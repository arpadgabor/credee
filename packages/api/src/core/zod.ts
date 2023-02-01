import { z } from 'zod'

export function createListSchema<T extends z.ZodSchema>(schema: T) {
  return z.object({
    data: z.array(schema),
    meta: z.object({
      count: z.number().optional(),
    }),
  })
}
