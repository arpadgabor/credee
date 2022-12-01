import { createMutation } from '@tanstack/solid-query'
import { Component, createSignal } from 'solid-js'
import { api } from '../utils/trpc.js'

export const Home: Component = () => {
  const [subreddit, setSubreddit] = createSignal<string>()
  const crawl = createMutation(
    async () => {
      if (!subreddit()) return
      return await api.tasks.crawlSubreddit.mutate({ subreddit: subreddit()!, stopsAfterCount: 5 })
    },
    {
      onSuccess(data, variables, context) {
        console.log({ data })
      },
    }
  )
  return (
    <div>
      <form onSubmit={ev => (ev.preventDefault(), crawl.mutateAsync())}>
        <input type='text' name='subreddit' onInput={e => setSubreddit((e.target as HTMLInputElement).value)} />
        <button type='submit'>Crawl</button>
      </form>
    </div>
  )
}
