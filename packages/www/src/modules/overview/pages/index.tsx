import { createMutation, createQuery } from '@tanstack/solid-query'
import { Component, createSignal, For } from 'solid-js'
import { Button } from '../../../components/ui/Button'
import { FormRow } from '../../../components/ui/FormRow'
import { Input } from '../../../components/ui/Input'
import { api } from '../../../utils/trpc'

const Overview: Component = () => {
  const [subreddit, setSubreddit] = createSignal<string>()

  const jobs = createQuery(
    () => ['jobs'],
    () => api.tasks.jobs.query(),
    {
      // refetchInterval: 5000,
      // refetchIntervalInBackground: true,
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
    <div class='p-8'>
      <form onSubmit={ev => (ev.preventDefault(), crawl.mutateAsync())} class='flex space-x-4'>
        <FormRow>
          <Input
            type='text'
            name='subreddit'
            placeholder='/r/'
            required
            pattern={'/r/(.*)'}
            onInput={e => setSubreddit((e.target as HTMLInputElement).value)}
          />
          <Input
            type='text'
            name='subreddit'
            placeholder='/r/'
            required
            pattern={'/r/(.*)'}
            onInput={e => setSubreddit((e.target as HTMLInputElement).value)}
          />
          <Input
            type='text'
            name='subreddit'
            placeholder='/r/'
            required
            pattern={'/r/(.*)'}
            onInput={e => setSubreddit((e.target as HTMLInputElement).value)}
          />
          <Button type='submit' theme='main'>
            Crawl
            <IconPhFileSearch class='ml-2' />
          </Button>
        </FormRow>

        <Button type='submit' theme='main'>
          Crawl
          <IconPhFileSearch class='ml-2' />
        </Button>
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

export default Overview
