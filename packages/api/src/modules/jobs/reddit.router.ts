import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { createListSchema } from '../../core/zod'
import {
  getRedditFilters,
  groupById,
  groupByIdItem,
  groupByIdQuerySchema,
  listRedditResults,
  listRedditResultsSchema,
  redditFiltersResult,
  removeRedditResult,
  removeRedditSchema,
  removeRedditVariant,
  removeRedditVariantSchema,
} from './reddit.service'

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

const redditResults = procedure
  .input(listRedditResultsSchema)
  .output(z.any())
  .query(async ({ input }) => {
    const { data, count } = await listRedditResults({
      limit: input?.limit,
      offset: input?.offset,
      order: input?.order as any,
      postId: input?.postId,
    })

    return {
      data,
      meta: {
        count: count || 0,
      },
    }
  })

const redditFilters = procedure.output(redditFiltersResult).query(async () => {
  const filters = await getRedditFilters()

  return filters
})
const removeByPostId = procedure.input(removeRedditSchema).mutation(async ({ input }) => {
  await removeRedditResult({
    postId: input.postId,
  })
})
const removeVariantById = procedure.input(removeRedditVariantSchema).mutation(async ({ input }) => {
  await removeRedditVariant({
    variantId: input.variantId,
  })
})

export const RedditRouter = router({
  redditResults,
  redditByPostId,
  redditFilters,
  removeByPostId,
  removeVariantById,
})
