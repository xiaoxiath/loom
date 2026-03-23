'use client';

import { useEffect, useState, useMemo } from 'react';
import { useGenerationStore } from '@/lib/stores/generationStore';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * Game Preview Component
 *
 * Displays Phaser games in an iframe sandbox.
 * Receives bundled JavaScript from API (esbuild output) and runs in browser.
 */
export function GamePreview() {
  const { files } = useGenerationStore();
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [iframeKey, setIframeKey] = useState(0);

  // Extract bundle (type: 'bundle' from API, but typed as 'config' in store)
  const bundleCode = useMemo(() => {
    // Look for bundle in files (API returns type: 'bundle')
    const bundleFile = files.find(
      (f: any) => f.type === 'bundle' || f.path === 'bundle.js'
    );
    return bundleFile?.content || '';
  }, [files]);

  useEffect(() => {
    if (!bundleCode) {
      setBlobUrl('');
      return;
    }

    // Build HTML with bundled JavaScript
    const htmlContent = buildGameHTML(bundleCode);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    setBlobUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [bundleCode]);

  // Pure function: build HTML template
  function buildGameHTML(code: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    #game-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    canvas {
      display: block;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <!-- Load Phaser from CDN (faster than bundling) -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script>
    try {
      ${code}
    } catch (error) {
      console.error('Game initialization error:', error);
      document.body.innerHTML = '<div style="color: white; padding: 20px; font-family: monospace; background: #1e1e1e; border-radius: 8px; max-width: 600px;"><h2 style="margin-bottom: 10px; color: #ff6b6b;">Game Failed to Load</h2><pre style="white-space: pre-wrap; word-wrap: break-word;">' + (error.stack || error.message) + '</pre><p style="margin-top: 15px; color: #aaa;">Please check the browser console for details.</p></div>';
    }
  </script>
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
        <iframe
          key={iframeKey}
          src={blobUrl}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          title="Game Preview"
        />
      </div>
    </div>
  );
}
