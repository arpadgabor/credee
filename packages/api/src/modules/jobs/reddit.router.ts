import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { createListSchema } from '../../core/zod.js'
import { groupById, groupByIdItem, groupByIdQuerySchema, listRedditResults } from './reddit.service.js'

const redditByPostId = procedure
  .input(groupByIdQuerySchema.optional())
  .output(createListSchema(groupByIdItem))
  .query(async ({ input }) => {
    const result = await groupById(input || {})

    return {
      data: result.data,
      meta: {
        count: result.count,
        next: (input?.limit ?? 0) + (input?.offset ?? 0),
      },
    }
  })

const getRedditResultsInput = z
  .object({
    limit: z.number().default(25).optional(),
    offset: z.number().default(25).optional(),
    order: z
      .array(
        z.object({
          column: z.enum(['created_at', 'inserted_at', 'score', 'ratio', 'nr_of_comments', 'domain', 'title']).optional(),
          sort: z.enum(['asc', 'desc']).optional(),
        })
      )
      .optional(),
  })
  .optional()

const redditResults = procedure
  .input(getRedditResultsInput)
  .output(z.any())
  .query(async ({ input }) => {
    const { data, count } = await listRedditResults({
      limit: input?.limit,
      offset: input?.offset,
      order: input?.order as any,
    })

    return {
      data,
      meta: {
        count: count || 0,
      },
    }
  })

export const RedditRouter = router({
  redditResults,
  redditByPostId,
})
