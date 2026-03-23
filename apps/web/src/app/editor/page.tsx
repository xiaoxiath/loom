'use client';

import { useGameSpecStore } from '@/lib/stores/gameSpecStore';
import { useGenerationStore } from '@/lib/stores/generationStore';
import { GameSpecEditor } from '@/components/editor/GameSpecEditor';
import { GamePreview } from '@/components/preview/GamePreview';
import { GeneratedFiles } from '@/components/output/GeneratedFiles';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Undo, Redo } from 'lucide-react';

export default function EditorPage() {
  const { currentSpec } = useGameSpecStore();
  const { isGenerating, startGeneration, setResults, setError } =
    useGenerationStore();
  const { canUndo, canRedo, undo, redo } = useGameSpecStore();

  const handleGenerate = async () => {
    if (!currentSpec) return;

    startGeneration();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSpec: currentSpec }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.files, data.diagnostics);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* 顶部工具栏 */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Loom Editor</h1>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={undo}
              disabled={!canUndo()}
              className="text-slate-400 hover:text-white"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={redo}
              disabled={!canRedo()}
              className="text-slate-400 hover:text-white"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={!currentSpec || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              生成游戏
            </>
          )}
        </Button>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：编辑器 */}
        <div className="w-1/2 border-r border-slate-800">
          <GameSpecEditor />
        </div>

        {/* 右侧：预览和输出 */}
        <div className="w-1/2 flex flex-col">
          <div className="h-1/2 border-b border-slate-800">
            <GamePreview />
          </div>
          <div className="h-1/2">
            <GeneratedFiles />
          </div>
        </div>
      </div>
    </div>
  );
}
