#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Fix all logger errors
const routeFiles = glob.sync('src/routes/*.ts');

routeFiles.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  
  // Fix logger errors with unknown
  content = content.replace(
    /fastify\.log\.error\(([^,]+), error\);/g,
    'fastify.log.error($1, error instanceof Error ? error.message : \'Unknown error\');'
  );
  
  // Fix telegramUser undefined - add non-null assertion
  content = content.replace(
    /const telegramUser = request\.telegramUser;/g,
    'const telegramUser = request.telegramUser!;'
  );
  
  writeFileSync(file, content);
  console.log(`✓ Fixed ${file}`);
});

// Fix user.ts duplicate schema
let userContent = readFileSync('src/routes/user.ts', 'utf-8');
const lines = userContent.split('\n');
const filteredLines = [];
let foundSchema = false;

for (const line of lines) {
  if (line.includes('const userResponseSchema = z.object')) {
    if (!foundSchema) {
      filteredLines.push(line);
      foundSchema = true;
    }
  } else {
    filteredLines.push(line);
  }
}

writeFileSync('src/routes/user.ts', filteredLines.join('\n'));
console.log('✓ Fixed duplicate schema');
