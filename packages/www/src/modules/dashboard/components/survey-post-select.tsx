import { Checkbox } from '@kobalte/core'
import { FormState, getError, Field, FieldValues } from '@modular-forms/solid'
import { createEffect, createSignal, For, JSX, Show } from 'solid-js'
import CheckIcon from '~icons/lucide/check'
import { api } from '../../../utils/trpc'
import { createInfiniteQuery } from '@tanstack/solid-query'
import { Button, FieldAlert, FieldLabel, Input } from '../../../components/ui'
import { cx } from 'class-variance-authority'
import { SentimentMeter } from './sentiment-meter'
import { InfoTag } from './info-tag'
import { Outputs } from '@credee/api'
import { debounce } from 'lodash-es'

interface Props<FORM extends FieldValues> {
  form: FormState<FORM>
  fieldName: keyof FORM
}

export function PostsForSurveySelect<FORM extends FieldValues>($: Props<FORM>) {
  const [search, setSearch] = createSignal<string>()
  const onTypeSearch: JSX.EventHandlerUnion<HTMLInputElement, Event> = e => {
    setSearch(e.currentTarget.value)
  }

  const posts = createInfiniteQuery({
    queryKey: () => [search()],
    queryFn: ({ pageParam }) => {
      return api.reddit.redditByPostId.query({
        limit: 10,
        offset: pageParam ?? 0,
        flair: search(),
      })
    },
    getNextPageParam: lastPage => {
      return lastPage.meta.next! >= lastPage.meta.count! ? undefined : lastPage.meta.next
    },
  })

  type Post = Outputs['reddit']['redditByPostId']['data'][number]
  const latestHistory = (post: Post): Post['history'][number] => {
    return post.history[post.history.length - 1]
  }

  return (
    <div>
      <FieldLabel>Select posts to be included survey</FieldLabel>
      <div class='flex mb-2'>
        <Input type='text' value={search()} onInput={onTypeSearch} name='search' placeholder='Search by flair' />
      </div>

      <div class='flex flex-col space-y-1'>
        <For each={posts.data?.pages || []}>
          {page => (
            <For each={page.data}>
              {post => (
                <Field of={$.form} name={$.fieldName as any}>
                  {field => (
                    <Checkbox.Root
                      isChecked={(field.value as string[])?.includes(post.post_id)}
                      class={cx([
                        'flex py-3 px-2 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition',
                        'data-[checked]:border-accent-500 focus-within:ring-2 focus-within:ring-accent-400 focus-within:border-gray-400',
                      ])}
                    >
                      <Checkbox.Input
                        {...field.props}
                        name={post.post_id}
                        value={post.post_id}
                        checked={(field.value as string[])?.includes(post.post_id)}
                      />
                      <div class='flex-1'>
                        <div class='flex space-x-2 text-xs text-gray-500 mb-1'>
                          <span>
                            {post.subreddit}/{post.post_id}
                          </span>
                        </div>

                        <Checkbox.Label class='text-gray-800 text-sm'>{post.title}</Checkbox.Label>

                        <div class='flex text-xs text-gray-700 mt-2 space-x-4'>
                          <Show when={Number.isFinite(post.title_sentiment)}>
                            <SentimentMeter sentiment={post.title_sentiment!} />
                          </Show>

                          <InfoTag label='Upvotes' icon='arrowUp' value={latestHistory(post).score} />

                          <InfoTag label='Ratio' icon='upDown' value={latestHistory(post).ratio * 100 + '%'} />

                          <InfoTag label='Comments' icon='message' value={latestHistory(post).comments} />

                          <InfoTag label='Awards' icon='coin' value={latestHistory(post).gold} />
                          <InfoTag label='Scrape times' icon='files' value={post.history.length} />
                        </div>
                      </div>

                      <div class='flex items-start'>
                        <Checkbox.Control class='w-6 h-6 rounded-full border flex items-center justify-center'>
                          <Checkbox.Indicator class='bg-accent-500 w-full h-full rounded-full flex items-center justify-center text-white'>
                            <CheckIcon class='h-3.5' />
                          </Checkbox.Indicator>
                        </Checkbox.Control>
                      </div>
                    </Checkbox.Root>
                  )}
                </Field>
              )}
            </For>
          )}
        </For>

        <Show when={posts.hasNextPage}>
          <Button type='button' onClick={() => posts.fetchNextPage()}>
            More
          </Button>
        </Show>
      </div>
      <Show when={getError($.form, 'posts' as any)}>
        <FieldAlert type='error'>{getError($.form, 'posts' as any)}</FieldAlert>
      </Show>
    </div>
  )
}