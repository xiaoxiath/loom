'use client';

import { useEffect, useState, useMemo } from 'react';
import { useGenerationStore } from '@/lib/stores/generationStore';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { stripTypeScript } from '@/lib/utils/typescript-stripper';

interface GeneratedFile {
  path: string;
  content: string;
  type: 'scene' | 'entity' | 'system' | 'config' | 'asset' | 'html' | 'package';
}

// Extract scene and config files to avoid re-processing unrelated files
function extractGameFiles(files: GeneratedFile[]) {
  return {
    scene: files.find((f) => f.type === 'scene')?.content || '',
    config: files.find((f) => f.type === 'config')?.content || '',
  };
}

export function GamePreview() {
  const { files } = useGenerationStore();
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [iframeKey, setIframeKey] = useState(0);

  // Memoize extracted files to prevent unnecessary re-renders
  const gameFiles = useMemo(() => extractGameFiles(files), [files]);

  // Memoize processed code to avoid re-transforming on every render
  const processedCode = useMemo(() => {
    if (!gameFiles.scene && !gameFiles.config) {
      return null;
    }
    return {
      scene: stripTypeScript(gameFiles.scene),
      config: stripTypeScript(gameFiles.config),
    };
  }, [gameFiles.scene, gameFiles.config]);

  useEffect(() => {
    if (!processedCode) {
      setBlobUrl('');
      return;
    }

    // Build HTML with processed code
    const htmlContent = buildGameHTML(processedCode);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    setBlobUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [processedCode]);

  // HTML template builder - pure function, no dependencies
  function buildGameHTML(code: { scene: string; config: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
</head>
<body style="margin:0; padding:0; overflow:hidden; background:#000;">
  <script>
    ${code.config}
    ${code.scene}

    try {
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game',
        physics: {
          default: 'arcade',
          arcade: {
            debug: false
          }
        },
        scene: MainScene
      };

      new Phaser.Game(config);
    } catch (error) {
      console.error('Game initialization error:', error);
      document.body.innerHTML = '<div style="color: white; padding: 20px; font-family: monospace; background: #1e1e1e;">Game failed to load: ' + error.message + '<br><br>Please check the console for details.</div>';
    }
  </script>
  <div id="game" style="display: flex; justify-content: center; align-items: center; min-height: 100vh;"></div>
</body>
</html>`;
  }

  const handleReload = () => setIframeKey((k) => k + 1);

  if (files.length === 0 || !blobUrl) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-slate-900">
        <div className="text-center">
          <p className="text-lg mb-2">游戏预览</p>
          <p className="text-sm">生成游戏后将在此处显示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex gap-2 p-2 border-b border-slate-700 bg-slate-800">
        <Button
          size="sm"
          variant="outline"
          onClick={handleReload}
          className="border-slate-600"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重载
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {blobUrl && (
          <iframe
            key={iframeKey}
            src={blobUrl}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Game Preview"
          />
        )}
      </div>
    </div>
  );
}
