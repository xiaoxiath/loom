'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameSpecStore } from '@/lib/stores/gameSpecStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const examples = [
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: '经典跳跃躲避游戏',
    genre: 'Runner',
  },
  {
    id: 'space-runner',
    title: 'Space Runner',
    description: '太空跑酷收集金币',
    genre: 'Runner',
  },
  {
    id: 'galactic-shooter',
    title: 'Galactic Shooter',
    description: '俯视射击消灭敌人',
    genre: 'Shooter',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { setGameSpec } = useGameSpecStore();

  const handleLoadExample = async (id: string) => {
    try {
      const response = await fetch(`/api/examples/${id}`);
      const { gameSpec } = await response.json();
      setGameSpec(gameSpec);
      router.push('/editor');
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Loom
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            AI 驱动的游戏生成平台
          </p>
          <p className="text-sm text-slate-400">
            从 GameSpec 到可玩游戏，一键生成 Phaser.js 代码
          </p>
        </div>

        {/* Example Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {examples.map((example) => (
            <Card
              key={example.id}
              className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white">{example.title}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    {example.genre}
                  </span>
                </div>
                <CardDescription className="text-slate-400">
                  {example.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => handleLoadExample(example.id)}
                >
                  加载示例
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create New */}
        <div className="text-center">
          <Link href="/editor">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              创建新游戏
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="text-slate-400">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              编辑 GameSpec
            </h3>
            <p className="text-sm">
              使用 Monaco 编辑器实时编辑 JSON 格式的游戏规范
            </p>
          </div>
          <div className="text-slate-400">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">一键生成</h3>
            <p className="text-sm">
              点击按钮即可生成完整的 Phaser.js 游戏代码
            </p>
          </div>
          <div className="text-slate-400">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              实时预览
            </h3>
            <p className="text-sm">
              在浏览器中直接预览和游玩生成的游戏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
