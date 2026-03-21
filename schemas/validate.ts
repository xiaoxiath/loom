#!/usr/bin/env node

/**
 * Schema Validation Utility
 *
 * Validates JSON data against Loom JSON schemas.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCHEMAS_DIR = join(__dirname, '../schemas');

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

// Load all schemas
function loadSchemas() {
  const schemaFiles = readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema.json'));

  for (const file of schemaFiles) {
    const schemaPath = join(SCHEMAS_DIR, file);
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    ajv.addSchema(schema, schema.$id);
    console.log(`✓ Loaded schema: ${file}`);
  }
}

// Validate data against a schema
export function validate(schemaId: string, data: unknown): boolean {
  const validate = ajv.getSchema(schemaId);

  if (!validate) {
    throw new Error(`Schema not found: ${schemaId}`);
  }

  const valid = validate(data);

  if (!valid && validate.errors) {
    console.error('Validation errors:');
    for (const error of validate.errors) {
      console.error(`  - ${error.instancePath} ${error.message}`);
    }
    return false;
  }

  return true;
}

// Export validation function for use in other modules
export { ajv };

// CLI interface
if (require.main === module) {
  loadSchemas();
  console.log('\nSchema validation utility loaded successfully.');
  console.log('Use this module to validate GameSpec and other data structures.\n');
}
