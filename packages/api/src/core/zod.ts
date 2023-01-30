import { z } from 'zod'

export function createListSchema(schema: z.ZodSchema) {
  return z.object({
    data: z.array(schema),
    meta: z.object({
      count: z.number().optional(),
    }),
  })
}
