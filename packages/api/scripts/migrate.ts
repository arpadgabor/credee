import { Migration, MigrationProvider, Migrator } from 'kysely'
import { db } from '../src/database/client.js'

import * as _001 from '../src/database/migrations/001-reddit-posts.js'
import * as _002 from '../src/database/migrations/002-reddit-posts-screenshot.js'

class LocalProvider implements MigrationProvider {
  constructor() {}

  async getMigrations() {
    return {
      '001_reddit_posts': _001,
      '002-reddit-posts-screenshot': _002,
    } satisfies Record<string, Migration>
  }
}

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new LocalProvider(),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach(it => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()
