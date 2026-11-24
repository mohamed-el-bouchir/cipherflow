import {useEffect, useMemo, useState} from 'react';
import {ALGORITHM_MAP, executePipeline, PRESET_RECIPES} from './algorithms/registry';
import type {AlgorithmDefinition, PresetRecipe, RecipeStep} from './algorithms/types';
import {AddOperationModal} from './components/AddOperationModal';
import {AnimationStage} from './components/AnimationStage';
import {InputPanel, OutputPanel} from './components/IOPanels';
import {PresetsView} from './components/PresetsView';
import {RecipePipeline} from './components/RecipePipeline';
import {TopBar} from './components/TopBar';
import {GuidePage} from './pages/Guide/GuidePage';

const SAVED_RECIPES_KEY = 'cipherflow_saved_recipes_v1';

function createStepInstance(algo: AlgorithmDefinition, overrideParams?: Record<string, any>): RecipeStep {
  return {
    instanceId: `${algo.id}-${Math.random().toString(36).slice(2, 8)}`,
    algorithmId: algo.id,
    enabled: true,
    params: {
      ...algo.defaultParams,
      ...(overrideParams ?? {}),
    },
  };
}

function getInitialRecipe(): RecipeStep[] {
  const defaultPreset = PRESET_RECIPES[0];
  return defaultPreset.steps
    .map((s) => {
      const algo = ALGORITHM_MAP[s.algorithmId];
      return algo ? createStepInstance(algo, s.params) : null;
    })
    .filter((s): s is RecipeStep => s !== null);
}

function loadStoredRecipes(): PresetRecipe[] {
  try {
    const raw = window.localStorage.getItem(SAVED_RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<'workbench' | 'presets' | 'guide'>('workbench');
  const [addOpOpen, setAddOpOpen] = useState(false);

  const [input, setInput] = useState(PRESET_RECIPES[0].sampleInput);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>(() => getInitialRecipe());
  const [isDecryptMode, setIsDecryptMode] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<PresetRecipe[]>(() => loadStoredRecipes());
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedRecipes]);

  const {executedSteps, finalOutput} = useMemo(
    () => executePipeline(input, recipeSteps, isDecryptMode),
    [input, recipeSteps, isDecryptMode],
  );

  const safeStepIndex =
    executedSteps.length === 0 ? 0 : Math.min(activeStepIndex, executedSteps.length - 1);
  const activeExecution = executedSteps[safeStepIndex] ?? null;
  const totalFrames = activeExecution?.trace.frames.length ?? 0;

  useEffect(() => {
    if (totalFrames > 0 && frameIndex >= totalFrames) {
      setFrameIndex(totalFrames - 1);
    }
  }, [totalFrames, frameIndex]);

  useEffect(() => {
    if (!isPlaying || !activeExecution) return;

    const intervalMs = Math.round(900 / speed);
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (prev < totalFrames - 1) {
          return prev + 1;
        }
        if (safeStepIndex < executedSteps.length - 1) {
          setActiveStepIndex(safeStepIndex + 1);
          return 0;
        }
        setIsPlaying(false);
        return prev;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, speed, totalFrames, safeStepIndex, executedSteps.length, activeExecution]);

  function handleAddOperation(algo: AlgorithmDefinition) {
    const newStep = createStepInstance(algo);
    setRecipeSteps((prev) => {
      const next = [...prev, newStep];
      setActiveStepIndex(isDecryptMode ? 0 : next.length - 1);
      return next;
    });
    setFrameIndex(0);
    setIsPlaying(false);
    setActiveView('workbench');
  }

  function handleUpdateParam(instanceId: string, key: string, value: any) {
    setRecipeSteps((prev) =>
      prev.map((step) =>
        step.instanceId === instanceId
          ? {...step, params: {...step.params, [key]: value}}
          : step,
      ),
    );
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleToggleStep(instanceId: string) {
    setRecipeSteps((prev) =>
      prev.map((step) =>
        step.instanceId === instanceId ? {...step, enabled: !step.enabled} : step,
      ),
    );
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleMoveStep(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= recipeSteps.length) return;
    setRecipeSteps((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
    setActiveStepIndex(targetIndex);
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleReverseOperations() {
    setRecipeSteps((prev) => [...prev].reverse());
    setActiveStepIndex(0);
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleToggleDecryptMode(decrypt: boolean) {
    setIsDecryptMode(decrypt);
    setActiveStepIndex(0);
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleRemoveStep(instanceId: string) {
    setRecipeSteps((prev) => prev.filter((s) => s.instanceId !== instanceId));
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleClearRecipe() {
    setRecipeSteps([]);
    setIsDecryptMode(false);
    setActiveStepIndex(0);
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleSaveRecipe(name: string, description: string) {
    const newRecipe: PresetRecipe = {
      id: `custom-${Date.now().toString(36)}`,
      name,
      description:
        description ||
        `Custom chain of ${recipeSteps.length} ${recipeSteps.length === 1 ? 'operation' : 'operations'}.`,
      sampleInput: input,
      mode: isDecryptMode ? 'decrypt' : 'forward',
      isCustom: true,
      createdAt: new Date().toISOString(),
      steps: recipeSteps.map((s) => ({
        algorithmId: s.algorithmId,
        params: {...s.params},
      })),
    };
    setSavedRecipes((prev) => [newRecipe, ...prev]);
  }

  function handleDeleteSavedRecipe(id: string) {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSelectStep(index: number) {
    setActiveStepIndex(index);
    setFrameIndex(0);
    setIsPlaying(false);
  }

  function handleLoadPreset(preset: PresetRecipe) {
    const steps = preset.steps
      .map((s) => {
        const algo = ALGORITHM_MAP[s.algorithmId];
        return algo ? createStepInstance(algo, s.params) : null;
      })
      .filter((s): s is RecipeStep => s !== null);

    setInput(preset.sampleInput);
    setRecipeSteps(steps);
    setIsDecryptMode(preset.mode === 'decrypt');
    setActiveStepIndex(0);
    setFrameIndex(0);
    setIsPlaying(false);
    setActiveView('workbench');
  }

  function handleTogglePlay() {
    if (!activeExecution) return;
    if (!isPlaying && frameIndex >= totalFrames - 1 && safeStepIndex >= executedSteps.length - 1) {
      setActiveStepIndex(0);
      setFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        isPlaying={isPlaying}
        canPlay={Boolean(activeExecution)}
        onTogglePlay={handleTogglePlay}
      />

      {activeView === 'guide' ? (
        <GuidePage />
      ) : activeView === 'presets' ? (
        <main className="flex-1">
          <PresetsView
            savedRecipes={savedRecipes}
            onLoadPreset={handleLoadPreset}
            onDeleteSavedRecipe={handleDeleteSavedRecipe}
            onBackToWorkbench={() => setActiveView('workbench')}
          />
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 sm:p-6">
          {/* 1. Input Box on Top */}
          <InputPanel
            input={input}
            onChangeInput={(val) => {
              setInput(val);
              setFrameIndex(0);
              setIsPlaying(false);
            }}
          />

          {/* 2. Recipe Under Input (with Add Operation Popup, Decrypt Mode, Reverse Order, Save as Recipe) */}
          <RecipePipeline
            executedSteps={executedSteps}
            activeStepIndex={safeStepIndex}
            savedCount={savedRecipes.length + PRESET_RECIPES.length}
            isDecryptMode={isDecryptMode}
            onToggleDecryptMode={handleToggleDecryptMode}
            onReverseOperations={handleReverseOperations}
            onOpenAddOperation={() => setAddOpOpen(true)}
            onSelectStep={handleSelectStep}
            onUpdateParam={handleUpdateParam}
            onToggleStep={handleToggleStep}
            onMoveStep={handleMoveStep}
            onRemoveStep={handleRemoveStep}
            onClearRecipe={handleClearRecipe}
            onSaveRecipe={handleSaveRecipe}
            onOpenRecipes={() => setActiveView('presets')}
          />

          {/* 3. Animation Stage Under Recipe */}
          <AnimationStage
            activeExecution={activeExecution}
            activeStepIndex={safeStepIndex}
            totalSteps={executedSteps.length}
            frameIndex={frameIndex}
            isPlaying={isPlaying}
            speed={speed}
            onSetFrameIndex={(idx) => {
              setIsPlaying(false);
              setFrameIndex(idx);
            }}
            onTogglePlay={handleTogglePlay}
            onStepBack={() => {
              setIsPlaying(false);
              setFrameIndex((f) => Math.max(0, f - 1));
            }}
            onStepForward={() => {
              setIsPlaying(false);
              setFrameIndex((f) => Math.min(totalFrames - 1, f + 1));
            }}
            onResetFrame={() => {
              setIsPlaying(false);
              setFrameIndex(0);
            }}
            onChangeSpeed={setSpeed}
            onSelectStep={handleSelectStep}
          />

          {/* 4. Output Box Under Animation */}
          <OutputPanel
            finalOutput={finalOutput}
            stageOutput={activeExecution ? activeExecution.output : null}
            stageName={activeExecution ? activeExecution.algorithm.name : null}
            isDecryptMode={isDecryptMode}
            onUseAsInput={(val) => {
              setInput(val);
              setFrameIndex(0);
              setIsPlaying(false);
            }}
          />
        </main>
      )}

      <AddOperationModal
        open={addOpOpen}
        onClose={() => setAddOpOpen(false)}
        onSelectOperation={handleAddOperation}
      />
    </div>
  );
}
