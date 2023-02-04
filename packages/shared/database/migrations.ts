import { Migration, MigrationProvider, Migrator } from 'kysely'
import { db } from './client.js'

import * as _001 from './migrations/001-reddit-posts.js'
import * as _002 from './migrations/002-reddit-posts-screenshot.js'
import * as _003 from './migrations/003-reddit-posts-flair.js'
import * as _004 from './migrations/004-survey.js'
import * as _005 from './migrations/005-reddit-posts-sentiment.js'

class Migrations implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      '001_reddit_posts': _001,
      '002-reddit-posts-screenshot': _002,
      '003-reddit-posts-flair': _003,
      '004-survey': _004,
      '005-reddit-posts-sentiment': _005,
    }
  }
}

export async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new Migrations(),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach(result => {
    if (result.status === 'Success') {
      console.log(`Migration "${result.migrationName}" was executed successfully.`)
    } else if (result.status === 'Error') {
      console.error(`Failed to execute migration "${result.migrationName}".`)
    }
  })

  if (error) {
    console.error('Failed to run migrations!')
    console.error(error)
    process.exit(1)
  }
}
