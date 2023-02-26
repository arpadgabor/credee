import { Checkbox } from '@kobalte/core'
import { Field, FieldValues, FormState, getError } from '@modular-forms/solid'
import { createInfiniteQuery } from '@tanstack/solid-query'
import { cx } from 'class-variance-authority'
import { For, Show } from 'solid-js'
import CheckIcon from '~icons/lucide/check'
import { Button, FieldAlert, FieldLabel } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { PostTags } from './post-tags'
import { createRedditFilters, RedditFilters } from './reddit-filters'
import { Sparkline } from './sparkline'

interface Props<FORM extends FieldValues> {
  form: FormState<FORM>
  fieldName: keyof FORM
}

const sparklineColors = {
  gold: '#FCAB10',
  score: '#000000',
  comments: '#84DCCF',
  ratio: '#aaaaaa',
  inserted_at: '',
} as const

export function PostsForSurveySelect<FORM extends FieldValues>($: Props<FORM>) {
  const { filterBy, props } = createRedditFilters()

  const posts = createInfiniteQuery({
    queryKey: () => [filterBy],
    queryFn: ({ pageParam }) => {
      return api.reddit.redditByPostId.query({
        limit: 10,
        offset: pageParam ?? 0,
        flair: filterBy.flair || undefined,
        subreddit: filterBy.subreddit || undefined,
        title: filterBy.title,
      })
    },
    getNextPageParam: lastPage => {
      return lastPage.meta.next! >= lastPage.meta.count! ? undefined : lastPage.meta.next
    },
  })

  return (
    <div>
      <FieldLabel>Select posts to be included survey</FieldLabel>
      <RedditFilters {...props} />

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
                        'flex py-2 px-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition',
                        'data-[checked]:border-accent-500 focus-within:ring-2 focus-within:ring-accent-400 focus-within:border-gray-400',
                      ])}
                    >
                      <Checkbox.Input
                        {...field.props}
                        name={post.post_id}
                        value={post.post_id}
                        checked={(field.value as string[])?.includes(post.post_id)}
                      />
                      <div class='flex-1 flex space-x-2'>
                        <div class='w-64 rounded bg-gray-50 dark:bg-gray-800 border dark:border-gray-700'>
                          <Sparkline
                            id={post.post_id}
                            dataset={post.history.map(item => ({
                              ...item,
                              inserted_at: new Date(item.inserted_at),
                            }))}
                            labelField='inserted_at'
                            valueFields={['gold', 'score', 'comments', 'ratio']}
                            colors={sparklineColors}
                          />
                        </div>

                        <div class='flex flex-col flex-1'>
                          <div class='flex space-x-2 text-xs text-gray-500 dark:text-gray-300 mb-1'>
                            <span>{post.subreddit}</span>
                            <a href={post.permalink} target='_blank' class='underline decoration-dotted text-accent-500'>
                              {post.post_id}
                            </a>
                          </div>

                          <Checkbox.Label class='text-gray-800 dark:text-gray-200 text-sm'>{post.title}</Checkbox.Label>

                          <PostTags post={post} />
                        </div>
                      </div>

                      <div class='flex items-start'>
                        <Checkbox.Control class='w-6 h-6 rounded-full border dark:border-gray-700 flex items-center justify-center'>
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
