require('esbuild')
  .build({
    entryPoints: ['src/workers.ts'],
    bundle: true,
    outfile: 'dist/workers.js',
    format: 'esm',
    target: 'node16',
    platform: 'node',
    sourcemap: true,
    external: [
      'playwright',
      'pg-native',
      'bullmq',
      'kysely',
      'fastify',
      '@trpc/server',
      'dotenv',
      'convict',
      '@aws-sdk/*',
      'natural',
    ],
    logLevel: 'debug',
    banner: {
      js: [
        `import { createRequire } from 'module';`,
        `import path from 'path';`,
        `import { fileURLToPath } from 'url';`,
        `const require = createRequire(import.meta.url);`,
        `const __filename = fileURLToPath(import.meta.url);`,
        `const __dirname = path.dirname(__filename);`,
      ].join('\n'),
    },
  })
  .catch(() => process.exit(1))
