/**
 * 游戏生成示例
 * 演示如何使用 Loom 平台从 GameSpec 生成 Phaser.js 游戏
 */

import { Orchestrator } from '@loom/orchestrator';
import * as fs from 'fs';
import * as path from 'path';

async function generateFlappyBird() {
  console.log('🎮 开始生成 Flappy Bird 游戏...\n');

  // 创建 Orchestrator 实例（使用模板模式，无需 LLM API）
  const orchestrator = new Orchestrator({
    enableAssetResolution: false, // 使用占位符资源
    enableLLMCodeGen: false,       // 使用模板生成（不需要 LLM）
    enableCodeReview: false        // 跳过代码审查
  });

  // 读取 GameSpec
  const specPath = path.join(__dirname, '../examples/01-flappy-bird.json');
  const gameSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

  console.log('📝 GameSpec 配置:');
  console.log(`  - 标题: ${gameSpec.meta.title}`);
  console.log(`  - 类型: ${gameSpec.meta.genre}`);
  console.log(`  - 实体数量: ${gameSpec.entities.length}`);
  console.log(`  - 系统: ${gameSpec.systems.join(', ')}`);
  console.log('');

  // 生成游戏
  const result = await orchestrator.generate({ gameSpec });

  // 输出诊断信息
  console.log('📊 生成结果:');
  console.log(`  - 方法: ${result.diagnostics.generationMethod || 'template'}`);
  console.log(`  - 文件数: ${result.codeOutput.files.length}`);
  console.log(`  - 警告: ${result.diagnostics.warnings.length}`);
  console.log(`  - 错误: ${result.diagnostics.errors.length}`);
  console.log('');

  if (result.diagnostics.warnings.length > 0) {
    console.log('⚠️  警告:');
    result.diagnostics.warnings.forEach(w => console.log(`  - ${w}`));
    console.log('');
  }

  if (result.diagnostics.errors.length > 0) {
    console.log('❌ 错误:');
    result.diagnostics.errors.forEach(e => console.log(`  - ${e}`));
    console.log('');
  }

  // 保存生成的文件
  const outputDir = path.join(__dirname, '../output/flappy-bird');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('💾 保存文件:');
  for (const file of result.codeOutput.files) {
    const filePath = path.join(outputDir, file.path);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.content, 'utf-8');
    console.log(`  ✅ ${file.path}`);
  }

  console.log('\n✨ 游戏生成完成！');
  console.log(`\n📂 输出目录: ${outputDir}`);
  console.log('\n下一步:');
  console.log('  1. 在浏览器中打开 output/flappy-bird/index.html');
  console.log('  2. 或者将生成的场景代码集成到你的 Phaser 项目中');
}

async function generateAllExamples() {
  console.log('🚀 批量生成所有示例游戏\n');
  console.log('=' .repeat(60) + '\n');

  const examples = [
    '01-flappy-bird.json',
    '02-space-runner.json',
    '03-galactic-shooter.json'
  ];

  for (const example of examples) {
    console.log(`\n📋 处理: ${example}`);
    console.log('-'.repeat(60));

    const orchestrator = new Orchestrator({
      enableAssetResolution: false,
      enableLLMCodeGen: false,
      enableCodeReview: false
    });

    const specPath = path.join(__dirname, '../examples', example);
    const gameSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

    const result = await orchestrator.generate({ gameSpec });

    const gameName = example.replace('.json', '');
    const outputDir = path.join(__dirname, '../output', gameName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const file of result.codeOutput.files) {
      const filePath = path.join(outputDir, file.path);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content, 'utf-8');
    }

    console.log(`✅ 生成成功: ${result.codeOutput.files.length} 个文件`);
    console.log(`   方法: ${result.diagnostics.generationMethod || 'template'}`);
    console.log(`   输出: ${outputDir}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有游戏生成完成！\n');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'single';

  try {
    switch (command) {
      case 'all':
        await generateAllExamples();
        break;
      case 'single':
      default:
        await generateFlappyBird();
        break;
    }
  } catch (error) {
    console.error('\n❌ 生成失败:');
    console.error(error);
    process.exit(1);
  }
}

main();
