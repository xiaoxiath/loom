import { Orchestrator } from '@loom/orchestrator';
import flappyBird from './01-flappy-bird.json' assert { type: 'json' };

const orchestrator = new Orchestrator({
  enableAssetResolution: false,
  enableLLMCodeGen: false,
  enableCodeReview: false
});

const result = await orchestrator.generate({ gameSpec: flappyBird });
const sceneFile = result.codeOutput.files.find(f => f.type === 'scene');

console.log('=== Scene Code (first 100 lines) ===');
console.log(sceneFile.content.split('\n').slice(0, 100).join('\n'));
console.log('\n=== Config Code ===');
const configFile = result.codeOutput.files.find(f => f.type === 'config');
console.log(configFile?.content);
