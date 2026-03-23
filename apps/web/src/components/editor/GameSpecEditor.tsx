'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGameSpecStore } from '@/lib/stores/gameSpecStore';

// 动态导入 Monaco（优化包大小）
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function GameSpecEditor() {
  const { currentSpec, setGameSpec } = useGameSpecStore();
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleChange = (value: string | undefined) => {
    if (!value) return;

    try {
      const spec = JSON.parse(value);
      setGameSpec(spec);
    } catch {
      // JSON 解析错误，Monaco 会显示语法错误
    }
  };

  if (!currentSpec) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">未加载 GameSpec</p>
          <p className="text-sm">请从首页加载示例或创建新游戏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={JSON.stringify(currentSpec, null, 2)}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
        theme="vs-dark"
      />
    </div>
  );
}
