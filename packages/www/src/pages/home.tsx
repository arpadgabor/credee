import { createMutation, createQuery } from '@tanstack/solid-query'
import { Component, createSignal, For } from 'solid-js'
import { api } from '../utils/trpc'

export const Home: Component = () => {
  const [subreddit, setSubreddit] = createSignal<string>()

  const jobs = createQuery(
    () => ['jobs'],
    () => api.tasks.jobs.query(),
    {
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      onSuccess(data) {
        console.log({ data })
      },
    }
  )

  const crawl = createMutation(() => api.tasks.crawlSubreddit.mutate({ subreddit: subreddit()!, stopsAfterCount: 5 }), {
    onSuccess() {
      jobs.refetch()
    },
  })

  return (
    <div>
      <form onSubmit={ev => (ev.preventDefault(), crawl.mutateAsync())}>
        <input type='text' name='subreddit' onInput={e => setSubreddit((e.target as HTMLInputElement).value)} />
        <button type='submit'>Crawl</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Subreddit</th>
            <th>State</th>
            <th>Created at</th>
            <th>Started at</th>
            <th>Finished at</th>
          </tr>
        </thead>
        <tbody>
          <For each={jobs.data || []}>
            {job => (
              <tr>
                <td>{job.id}</td>
                <td>{job.data.subreddit}</td>
                <td>{job.state}</td>
                <td>{new Date(job.createdAt).toISOString()}</td>
                <td>{job.startedAt ? new Date(job.startedAt).toISOString() : '-'}</td>
                <td>{job.completedAt ? new Date(job.completedAt).toISOString() : '-'}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
