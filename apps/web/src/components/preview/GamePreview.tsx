'use client';

import { useEffect, useState } from 'react';
import { useGenerationStore } from '@/lib/stores/generationStore';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface GeneratedFile {
  path: string;
  content: string;
  type: 'scene' | 'entity' | 'system' | 'config' | 'asset' | 'html' | 'package';
}

export function GamePreview() {
  const { files } = useGenerationStore();
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (files.length === 0) {
      setBlobUrl('');
      return;
    }

    // 构建 HTML 内容
    const htmlContent = buildGameHTML(files);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    setBlobUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [files]);

  const buildGameHTML = (gameFiles: GeneratedFile[]): string => {
    const sceneFile = gameFiles.find((f) => f.type === 'scene');
    const configFile = gameFiles.find((f) => f.type === 'config');

    // 移除 TypeScript 特定语法，转换为浏览器可运行的代码
    const processCode = (code: string): string => {
      if (!code) return '';

      return code
        // 移除 export 语句
        .replace(/export\s+(default\s+)?/g, '')
        // 移除 import 语句
        .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
        // 移除私有字段声明中的类型注解 (private player!: Phaser.Physics.Arcade.Sprite;)
        .replace(/private\s+(\w+)!:\s*[^;]+;/g, 'private $1;')
        // 移除其他字段的类型注解 (player: Phaser.Physics.Arcade.Sprite)
        .replace(/^(\s+)(?:private\s+)?(?:public\s+)?(\w+)(?:\?)?:\s*[A-Za-z.<>[\]|]+\s*([=;])/gm, '$1$2$3')
        // 移除函数参数的类型注解
        .replace(/\((\w+):\s*[^,)]+\)/g, '($1)')
        // 移除返回类型注解
        .replace(/\):\s*[A-Za-z.<>[\]|]+\s*{/g, '): {')
        // 移除泛型参数
        .replace(/<[^>]+>/g, '');
    };

    const sceneCode = processCode(sceneFile?.content || '');
    const configCode = processCode(configFile?.content || '');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
</head>
<body style="margin:0; padding:0; overflow:hidden; background:#000;">
  <script>
    ${configCode}
    ${sceneCode}

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
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  if (files.length === 0) {
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
