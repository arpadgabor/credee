import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    'packages/*': {
      entry: ['{index,server,worker,queue,queues}.{ts,tsx,mts,cts}'],
      project: ['**/*.{ts,tsx}'],
    },
  },
}

export default config
