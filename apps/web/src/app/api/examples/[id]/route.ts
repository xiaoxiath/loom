import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const examples: Record<string, string> = {
  'flappy-bird': '01-flappy-bird.json',
  'space-runner': '02-space-runner.json',
  'galactic-shooter': '03-galactic-shooter.json',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filename = examples[id];

    if (!filename) {
      return NextResponse.json({ error: 'Example not found' }, { status: 404 });
    }

    // 从项目根目录的 examples/ 文件夹读取
    const filePath = path.join(process.cwd(), '..', '..', 'examples', filename);

    const content = await fs.readFile(filePath, 'utf-8');
    const gameSpec = JSON.parse(content);

    return NextResponse.json({ gameSpec });
  } catch (error) {
    console.error('Failed to load example:', error);
    return NextResponse.json(
      { error: 'Failed to load example' },
      { status: 500 }
    );
  }
}
