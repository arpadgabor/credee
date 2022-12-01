require('esbuild')
  .build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    outfile: 'dist/server.js',
    format: 'esm',
    external: ['playwright', 'fastify', '@trpc/server', 'bull', 'convict', 'dotenv'],
    logLevel: 'debug',
  })
  .catch(() => process.exit(1))
