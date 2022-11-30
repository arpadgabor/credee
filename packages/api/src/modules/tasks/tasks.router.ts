import { procedure, router } from "@/core/trpc.js";
import { z } from "zod";

export const TasksRouter = router({
  create: procedure
    .input(
      z.object({
        subreddit: z.string().startsWith('/r/'),
        stopsAfterCountIs: z.number().optional().default(25),
        stopsAfterSeconds: z.number().optional()
      })
    )
    .mutation(({ input }) => {
      console.log(input)
    })
})