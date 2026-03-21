#!/usr/bin/env node

/**
 * 验证所有 GameSpec 示例
 *
 * Usage: ts-node validate-examples.ts
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// 简单的 JSON 验证（实际应使用 AJV + Schema）
function validateGameSpec(spec: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查必需字段
  const requiredFields = [
    'meta',
    'settings',
    'scene',
    'entities',
    'systems',
    'mechanics',
    'scoring',
    'ui',
    'assets',
    'extensions'
  ];

  for (const field of requiredFields) {
    if (!(field in spec)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 检查 meta
  if (spec.meta) {
    const metaFields = ['title', 'genre', 'camera', 'dimension', 'version'];
    for (const field of metaFields) {
      if (!(field in spec.meta)) {
        errors.push(`Missing meta.${field}`);
      }
    }
  }

  // 检查 entities
  if (spec.entities && Array.isArray(spec.entities)) {
    if (spec.entities.length === 0) {
      errors.push('entities array is empty');
    }

    spec.entities.forEach((entity: any, index: number) => {
      if (!entity.id) {
        errors.push(`Entity ${index} missing id`);
      }
      if (!entity.type) {
        errors.push(`Entity ${index} missing type`);
      }
      if (!entity.sprite) {
        errors.push(`Entity ${index} missing sprite`);
      }
      if (!entity.components || !Array.isArray(entity.components)) {
        errors.push(`Entity ${index} missing components array`);
      }
    });

    // 检查是否有 player
    const hasPlayer = spec.entities.some((e: any) => e.type === 'player');
    if (!hasPlayer) {
      errors.push('No player entity found');
    }
  }

  // 检查 assets
  if (spec.assets && Array.isArray(spec.assets)) {
    spec.assets.forEach((asset: any, index: number) => {
      if (!asset.id) {
        errors.push(`Asset ${index} missing id`);
      }
      if (!asset.type) {
        errors.push(`Asset ${index} missing type`);
      }
      if (!asset.source) {
        errors.push(`Asset ${index} missing source`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 主函数
function main() {
  const examplesDir = join(__dirname);
  const files = readdirSync(examplesDir).filter(f => f.endsWith('.json'));

  console.log('🔍 Validating GameSpec Examples\n');
  console.log(`Found ${files.length} example files\n`);

  let totalValid = 0;
  let totalErrors = 0;

  files.forEach(file => {
    console.log(`📄 Validating ${file}...`);

    try {
      const content = readFileSync(join(examplesDir, file), 'utf-8');
      const spec = JSON.parse(content);

      const result = validateGameSpec(spec);

      if (result.valid) {
        console.log(`  ✅ Valid\n`);
        totalValid++;
      } else {
        console.log(`  ❌ Invalid`);
        result.errors.forEach(error => {
          console.log(`     - ${error}`);
          totalErrors++;
        });
        console.log('');
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error}\n`);
      totalErrors++;
    }
  });

  // 总结
  console.log('═'.repeat(50));
  console.log(`\n📊 Summary:\n`);
  console.log(`  Total files: ${files.length}`);
  console.log(`  Valid: ${totalValid}`);
  console.log(`  Invalid: ${files.length - totalValid}`);
  console.log(`  Total errors: ${totalErrors}\n`);

  if (totalValid === files.length) {
    console.log('✅ All examples are valid!\n');
    process.exit(0);
  } else {
    console.log('❌ Some examples have errors.\n');
    process.exit(1);
  }
}

main();
