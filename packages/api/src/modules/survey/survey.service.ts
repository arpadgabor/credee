import { db } from '../../database/client.js'
import { Survey } from '../../database/database.js'

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

export async function findSurvey(id: number) {
  return await db.selectFrom('surveys').selectAll().where('id', '=', id).executeTakeFirst()
}

export async function listSurveys() {
  return await db.selectFrom('surveys').selectAll().execute()
}
export async function countSurveys() {
  const result = await db.selectFrom('surveys').select(db.fn.count('id').as('count')).executeTakeFirst()

  return Number(result?.count) || 0
}
