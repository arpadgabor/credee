import { useSearchParams } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { createEffect, ErrorBoundary } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Button, Input, Select } from '../../../components/ui'
import { api } from '../../../utils/trpc'

export function createRedditFilters() {
  const [queryString, setSearchParams] = useSearchParams()

  const [filterBy, setFilter] = createStore({
    subreddit: '' as string,
    flair: '' as string,
    title: '' as string,
  })
  const setFilterWrapper = (key: keyof typeof filterBy, value: any) => {
    setSearchParams({
      [key]: value,
    })
    setFilter(key, value)
    console.log(queryString)
  }

  function clearFilters() {
    setFilterWrapper('flair', '')
    setFilterWrapper('subreddit', '')
    setFilterWrapper('title', '')
  }

  const query = createQuery(() => ['detailed_reddit_fitlers'], {
    queryFn: async () => {
      return await api.reddit.redditFilters.query()
    },
  })
  const subreddits = () => [{ label: 'Any', value: '' }, ...(query.data?.subreddits.map(s => ({ label: s, value: s })) ?? [])]
  const flairs = () => [{ label: 'Any', value: '' }, ...(query.data?.flairs.map(s => ({ label: s, value: s })) ?? [])]

  return {
    filterBy,
    clearFilters,
    setFilter: setFilterWrapper,
    query,
    subreddits,
    flairs,
    props: {
      subreddits,
      flairs,
      filterBy,
      setFilter: setFilterWrapper,
      clearFilters,
    },
  }
}

export function RedditFilters({
  subreddits,
  filterBy,
  flairs,
  setFilter,
  clearFilters,
}: ReturnType<typeof createRedditFilters>['props']) {
  return (
    <div class='flex mb-2 flex-row gap-2'>
      <ErrorBoundary fallback={<></>}>
        <Select
          options={subreddits() || []}
          value={filterBy.subreddit}
          label='Subreddits'
          name='subreddits'
          class='w-64'
          placeholder='Select subreddit'
          onSelect={e => setFilter('subreddit', e)}
        />
      </ErrorBoundary>

      <ErrorBoundary fallback={<></>}>
        <Select
          options={flairs() || []}
          value={filterBy.flair}
          label='Flair'
          name='flair'
          class='w-64'
          placeholder='Select flair'
          onSelect={e => setFilter('flair', e)}
        />
      </ErrorBoundary>

      <Input placeholder='Search by title' onInput={e => setFilter('title', e.currentTarget.value)} value={filterBy.title} />
      <Button theme='ghost' onClick={clearFilters}>
        Clear
      </Button>
    </div>
  )
}
