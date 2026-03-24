#!/usr/bin/env node

/**
 * Schema Validation Utility
 *
 * Validates JSON data against Loom JSON schemas.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Resolve the schemas directory.
 *
 * When compiled, __dirname is `schemas/dist/`, so schemas are one level up.
 * When running source directly (e.g. via tsx), __dirname is `schemas/`.
 * We detect this by checking whether schema files exist at each candidate.
 */
function resolveSchemasDir(): string {
  // Candidate 1: same directory (running from source via tsx)
  const candidate1 = __dirname;
  // Candidate 2: parent directory (running from dist/)
  const candidate2 = join(__dirname, '..');

  try {
    const files = readdirSync(candidate1);
    if (files.some(f => f.endsWith('.schema.json'))) {
      return candidate1;
    }
  } catch {
    // ignore
  }

  try {
    const files = readdirSync(candidate2);
    if (files.some(f => f.endsWith('.schema.json'))) {
      return candidate2;
    }
  } catch {
    // ignore
  }

  // Fallback: assume same directory
  return candidate1;
}

const SCHEMAS_DIR = resolveSchemasDir();

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load all schemas
function loadSchemas() {
  const schemaFiles = readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema.json'));

  for (const file of schemaFiles) {
    const schemaPath = join(SCHEMAS_DIR, file);
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    ajv.addSchema(schema, schema.$id);
    console.log(`Loaded schema: ${file}`);
  }
}

// Validate data against a schema
export function validate(schemaId: string, data: unknown): boolean {
  const validateFn = ajv.getSchema(schemaId);

  if (!validateFn) {
    throw new Error(`Schema not found: ${schemaId}`);
  }

  const valid = validateFn(data);

  if (!valid && validateFn.errors) {
    console.error('Validation errors:');
    for (const error of validateFn.errors) {
      console.error(`  - ${error.instancePath} ${error.message}`);
    }
    return false;
  }

  return true;
}

// Export validation function for use in other modules
export { ajv };

// CLI interface
const isMain =
  typeof require !== 'undefined' && require.main === module;

if (isMain) {
  loadSchemas();
  console.log('\nSchema validation utility loaded successfully.');
  console.log('Use this module to validate GameSpec and other data structures.\n');
}
