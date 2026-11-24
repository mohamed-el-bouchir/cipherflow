import {motion} from 'motion/react';
import type {AlgorithmDefinition, AlgorithmTrace, AnimationFrame, VisualizerProps} from './types';

const B64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

interface Base64Block {
  chars: string[];
  bytes8: string[];
  groups6: Array<{bits: string; index: number | null; b64Char: string}>;
  encoded: string;
}

interface Base64State {
  decode: boolean;
  phase: 'init' | 'bytes' | 'regroup' | 'lookup' | 'done';
  activeBlockIndex: number;
  blocks: Base64Block[];
  errorMessage?: string;
}

function encodeBase64Safe(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function decodeBase64Safe(str: string): {ok: true; text: string} | {ok: false; error: string} {
  try {
    const cleaned = str.trim();
    if (!cleaned) return {ok: true, text: ''};
    const bin = atob(cleaned);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return {ok: true, text: new TextDecoder().decode(bytes)};
  } catch {
    return {ok: false, error: 'Input is not valid Base64 text.'};
  }
}

function buildEncodeBlock(chunk: string[]): Base64Block {
  const bytes8 = chunk.map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'));
  const combined = bytes8.join('');
  const paddedLength = Math.ceil(combined.length / 6) * 6;
  const paddedBits = combined.padEnd(paddedLength, '0');

  const groups6: Base64Block['groups6'] = [];
  for (let i = 0; i < 4; i++) {
    const slice = paddedBits.slice(i * 6, i * 6 + 6);
    if (slice.length === 6) {
      const index = parseInt(slice, 2);
      groups6.push({bits: slice, index, b64Char: B64_TABLE[index]});
    } else {
      groups6.push({bits: '------', index: null, b64Char: '='});
    }
  }

  return {
    chars: chunk,
    bytes8,
    groups6,
    encoded: groups6.map((g) => g.b64Char).join(''),
  };
}

function buildDecodeBlock(b64Chunk: string[]): Base64Block {
  const groups6 = b64Chunk.map((ch) => {
    if (ch === '=') {
      return {bits: '------', index: null, b64Char: '='};
    }
    const index = B64_TABLE.indexOf(ch);
    const safeIdx = index >= 0 ? index : 0;
    return {
      bits: safeIdx.toString(2).padStart(6, '0'),
      index: safeIdx,
      b64Char: ch,
    };
  });

  const validBits = groups6
    .filter((g) => g.index !== null)
    .map((g) => g.bits)
    .join('');

  const byteCount = Math.floor(validBits.length / 8);
  const bytes8: string[] = [];
  const chars: string[] = [];
  for (let i = 0; i < byteCount; i++) {
    const b8 = validBits.slice(i * 8, i * 8 + 8);
    bytes8.push(b8);
    chars.push(String.fromCharCode(parseInt(b8, 2)));
  }

  return {
    chars,
    bytes8,
    groups6,
    encoded: chars.join(''),
  };
}

function computeBase64Trace(input: string, params: Record<string, any>): AlgorithmTrace<Base64State> {
  const decode = Boolean(params.decode);

  if (decode) {
    const decodedResult = decodeBase64Safe(input);
    if (decodedResult.ok === false) {
      return {
        frames: [
          {
            title: 'Invalid Base64 input',
            explanation: decodedResult.error,
            outputSoFar: '',
            state: {
              decode: true,
              phase: 'init',
              activeBlockIndex: -1,
              blocks: [],
              errorMessage: decodedResult.error,
            },
          },
        ],
        finalOutput: '',
      };
    }

    const cleaned = input.trim().slice(0, 12);
    const blocks: Base64Block[] = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      const chunk = cleaned.slice(i, i + 4).padEnd(4, '=').split('');
      blocks.push(buildDecodeBlock(chunk));
    }

    if (blocks.length === 0) {
      return {
        frames: [
          {
            title: 'Waiting for Base64 input',
            explanation: 'Enter Base64 text to decode 6-bit symbols back into 8-bit ASCII bytes.',
            outputSoFar: '',
            state: {decode: true, phase: 'init', activeBlockIndex: -1, blocks: []},
          },
        ],
        finalOutput: '',
      };
    }

    const frames: AnimationFrame<Base64State>[] = [
      {
        title: 'Split Base64 into 4-character blocks',
        explanation: `Grouped "${cleaned}" into ${blocks.length} block(s) of 4 Base64 symbols.`,
        outputSoFar: '',
        state: {decode: true, phase: 'init', activeBlockIndex: 0, blocks},
      },
    ];

    let running = '';
    blocks.forEach((block, idx) => {
      frames.push({
        title: `Block ${idx + 1}: Look up 6-bit values`,
        explanation: `Mapped Base64 symbols (${block.groups6.map((g) => g.b64Char).join('')}) back to 6-bit indices.`,
        outputSoFar: running,
        state: {decode: true, phase: 'regroup', activeBlockIndex: idx, blocks},
      });

      running += block.encoded;
      frames.push({
        title: `Block ${idx + 1}: Reassemble 8-bit ASCII "${block.encoded}"`,
        explanation: `Combined 6-bit chunks into 8-bit bytes: ${block.bytes8.join(' ')}.`,
        outputSoFar: running,
        state: {decode: true, phase: 'lookup', activeBlockIndex: idx, blocks},
      });
    });

    frames.push({
      title: 'Base64 decoding complete',
      explanation: `Decoded plaintext: "${decodedResult.text}".`,
      outputSoFar: decodedResult.text,
      state: {decode: true, phase: 'done', activeBlockIndex: blocks.length - 1, blocks},
    });

    return {frames, finalOutput: decodedResult.text};
  }

  // Encode mode
  const finalOutput = input.length > 0 ? encodeBase64Safe(input) : '';
  const preview = input.slice(0, 9);

  const blocks: Base64Block[] = [];
  for (let i = 0; i < preview.length; i += 3) {
    blocks.push(buildEncodeBlock(preview.slice(i, i + 3).split('')));
  }

  if (blocks.length === 0) {
    return {
      frames: [
        {
          title: 'Waiting for input bytes',
          explanation: 'Enter text to see 8-bit ASCII bytes regrouped into 6-bit Base64 symbols.',
          outputSoFar: '',
          state: {decode: false, phase: 'init', activeBlockIndex: -1, blocks: []},
        },
      ],
      finalOutput: '',
    };
  }

  const frames: AnimationFrame<Base64State>[] = [
    {
      title: 'Split input into 3-byte chunks',
      explanation: `Grouped "${preview}" into ${blocks.length} block(s) of up to 24 bits each.`,
      outputSoFar: '',
      state: {decode: false, phase: 'init', activeBlockIndex: 0, blocks},
    },
  ];

  let running = '';
  blocks.forEach((block, idx) => {
    frames.push({
      title: `Block ${idx + 1}: Convert "${block.chars.join('')}" to 8-bit ASCII`,
      explanation: `Each character becomes an 8-bit byte: ${block.bytes8.join(' ')}.`,
      outputSoFar: running,
      state: {decode: false, phase: 'bytes', activeBlockIndex: idx, blocks},
    });

    frames.push({
      title: `Block ${idx + 1}: Re-slice 24 bits into four 6-bit groups`,
      explanation: `Instead of 3×8 bits, Base64 reads 4×6-bit indices (${block.groups6
        .map((g) => (g.index !== null ? g.index : 'pad'))
        .join(', ')}).`,
      outputSoFar: running,
      state: {decode: false, phase: 'regroup', activeBlockIndex: idx, blocks},
    });

    running += block.encoded;
    frames.push({
      title: `Block ${idx + 1}: Map indices to "${block.encoded}"`,
      explanation: `Looked up each 6-bit integer (0–63) in the Base64 table${
        block.encoded.includes('=') ? ' and padded with =' : ''
      }.`,
      outputSoFar: running,
      state: {decode: false, phase: 'lookup', activeBlockIndex: idx, blocks},
    });
  });

  frames.push({
    title: 'Base64 encoding complete',
    explanation: `Final Base64 output (${finalOutput.length} chars): "${finalOutput}".`,
    outputSoFar: finalOutput,
    state: {decode: false, phase: 'done', activeBlockIndex: blocks.length - 1, blocks},
  });

  return {frames, finalOutput};
}

function Base64Visualizer({frame}: VisualizerProps<Base64State>) {
  const {decode, phase, activeBlockIndex, blocks, errorMessage} = frame.state;

  if (errorMessage) {
    return (
      <div className="flex h-56 items-center justify-center text-sm font-medium text-rose-700">
        {errorMessage}
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-500">
        Enter text in the Input box to animate Base64 bit regrouping.
      </div>
    );
  }

  const block = blocks[Math.max(0, activeBlockIndex)] ?? blocks[0];
  const showBytes = phase !== 'init';
  const showRegroup = phase === 'regroup' || phase === 'lookup' || phase === 'done';
  const showLookup = phase === 'lookup' || phase === 'done';

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Active chunk {Math.max(0, activeBlockIndex) + 1} of {blocks.length}
        </span>
        <span className="font-mono">
          {decode ? '4 Base64 chars (4 × 6 bits) → 3 ASCII bytes (24 bits)' : '3 bytes (24 bits) → 4 Base64 chars (4 × 6 bits)'}
        </span>
      </div>

      {decode ? (
        <>
          {/* Decode: 4x 6-bit Base64 symbols on top -> 3x 8-bit ASCII bytes below */}
          <div className="grid grid-cols-4 gap-3">
            {block.groups6.map((group, idx) => (
              <div
                key={`dec-g-${activeBlockIndex}-${idx}`}
                className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-3"
              >
                <span className="font-mono text-base font-bold text-sky-800">{group.b64Char}</span>
                <span className="mt-1 font-mono text-[11px] text-slate-500 tabular-nums">
                  {group.index !== null ? `Idx ${group.index}` : 'Padding'}
                </span>
                <motion.span
                  animate={{opacity: showRegroup ? 1 : 0.3}}
                  className="mt-2 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800"
                >
                  {group.bits}
                </motion.span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((slotIdx) => {
              const ch = block.chars[slotIdx];
              const bits = block.bytes8[slotIdx];
              return (
                <motion.div
                  key={`dec-b-${activeBlockIndex}-${slotIdx}`}
                  animate={{opacity: showLookup ? 1 : 0.35, y: showLookup ? 0 : 4}}
                  className={`rounded-lg border p-3 ${
                    ch ? 'border-emerald-600/30 bg-emerald-50/50' : 'border-dashed border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-base font-semibold text-slate-900">
                      {ch ? (ch === ' ' ? '␣' : `'${ch}'`) : 'Empty'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {ch ? `ASCII ${ch.charCodeAt(0)}` : 'Pad'}
                    </span>
                  </div>
                  <div className="mt-2 rounded bg-white px-2 py-1 text-center font-mono text-xs text-slate-800">
                    {bits ?? '--------'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Encode: 3x 8-bit ASCII bytes -> 4x 6-bit Base64 symbols */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((slotIdx) => {
              const ch = block.chars[slotIdx];
              const bits = block.bytes8[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`rounded-lg border p-3 ${
                    ch ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-base font-semibold text-slate-900">
                      {ch ? (ch === ' ' ? '␣' : `'${ch}'`) : 'Empty'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {ch ? `ASCII ${ch.charCodeAt(0)}` : 'Pad'}
                    </span>
                  </div>
                  <motion.div
                    animate={{opacity: showBytes ? 1 : 0.25}}
                    transition={{duration: 0.2}}
                    className="mt-2 rounded bg-slate-100 px-2 py-1 text-center font-mono text-xs tracking-wider text-slate-800"
                  >
                    {bits ?? '00000000'}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {block.groups6.map((group, idx) => (
              <motion.div
                key={`${activeBlockIndex}-${idx}`}
                initial={{opacity: 0.4, y: 6}}
                animate={{
                  opacity: showRegroup ? 1 : 0.35,
                  y: showRegroup ? 0 : 6,
                }}
                transition={{duration: 0.22, delay: idx * 0.05}}
                className={`flex flex-col items-center rounded-lg border p-3 ${
                  showLookup
                    ? 'border-sky-600/40 bg-sky-50/60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="font-mono text-xs font-medium text-slate-700">{group.bits}</span>
                <span className="mt-1 font-mono text-[11px] text-slate-500 tabular-nums">
                  {group.index !== null ? `Idx ${group.index}` : 'Padding'}
                </span>
                <motion.div
                  animate={{scale: showLookup ? 1 : 0.9, opacity: showLookup ? 1 : 0.3}}
                  className="mt-2 flex h-9 w-9 items-center justify-center rounded-md border border-sky-600/30 bg-white font-mono text-base font-bold text-sky-800"
                >
                  {showLookup ? group.b64Char : '?'}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const base64Algorithm: AlgorithmDefinition<Base64State> = {
  id: 'base64-encode',
  name: 'Base64',
  category: 'Encoding',
  summary: 'Converts between 8-bit ASCII bytes and 6-bit Base64 alphabet symbols.',
  animationPattern: 'Multi-Phase Bit Regrouping',
  complexity: 'O(n)',
  paramSchema: [
    {
      key: 'decode',
      label: 'Decode Mode',
      type: 'boolean',
    },
  ],
  defaultParams: {
    decode: false,
  },
  invertParams: (params) => ({
    ...params,
    decode: !params.decode,
  }),
  computeTrace: computeBase64Trace,
  Visualizer: Base64Visualizer,
};
