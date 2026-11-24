import {Pause, Play} from 'lucide-react';

interface TopBarProps {
  activeView: 'workbench' | 'presets' | 'guide';
  onSelectView: (view: 'workbench' | 'presets' | 'guide') => void;
  isPlaying: boolean;
  canPlay: boolean;
  onTogglePlay: () => void;
}

export function TopBar({
  activeView,
  onSelectView,
  isPlaying,
  canPlay,
  onTogglePlay,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-sm">
      {/* Zone 1: Brand wordmark */}
      <button
        type="button"
        onClick={() => onSelectView('workbench')}
        className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        CipherFlow
      </button>

      {/* Zone 2: Navigation */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectView('workbench')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
            activeView === 'workbench' ? 'text-slate-900 underline decoration-sky-600 decoration-2 underline-offset-8' : ''
          }`}
        >
          Workbench
        </button>
        <button
          type="button"
          onClick={() => onSelectView('guide')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
            activeView === 'guide' ? 'text-slate-900 underline decoration-sky-600 decoration-2 underline-offset-8' : ''
          }`}
        >
          Guide
        </button>
        <button
          type="button"
          onClick={() => onSelectView('presets')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
            activeView === 'presets' ? 'text-slate-900 underline decoration-sky-600 decoration-2 underline-offset-8' : ''
          }`}
        >
          Recipes
        </button>
      </nav>

      {/* Zone 3: Primary action (Workbench only) */}
      {activeView === 'workbench' && (
        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={!canPlay}
            onClick={onTogglePlay}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Start Recipe'}</span>
          </button>
        </div>
      )}
    </header>
  );
}
