import { Survey } from 'database/database.js'
import { db } from '../../database/client.js'

export async function createSurvey(values: Pick<Survey, 'title' | 'ends_at'>) {
  const [survey] = await db
    .insertInto('surveys')
    .values({
      ...values,
    })
    .returningAll()
    .execute()

  return survey
}

export async function findSurvey(id: Survey['id']) {
  return await db
    .selectFrom('surveys')
    .selectAll()
    .where('id', '=', id as unknown as number)
    .executeTakeFirst()
}

export async function listSurveys() {
  return await db.selectFrom('surveys').selectAll().execute()
}
export async function countSurveys() {
  const result = await db.selectFrom('surveys').select(db.fn.count<number>('id').as('count')).executeTakeFirst()

  return result.count
}
