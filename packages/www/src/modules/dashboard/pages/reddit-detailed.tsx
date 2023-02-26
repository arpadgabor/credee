import type { Outputs } from '@credee/api'
import { createMutation, createQuery } from '@tanstack/solid-query'
import {
  CellContext,
  createColumnHelper,
  createSolidTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/solid-table'
import { TRPCClientError } from '@trpc/client'
import { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import toast from 'solid-toast'
import IconDelete from '~icons/lucide/trash-2'
import { ContextMenu, ContextOptions, DataTable, DateCell, PageHeader, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { PostTags } from '../components/post-tags'
import { createRedditFilters, RedditFilters } from '../components/reddit-filters'
import { Sparkline } from '../components/sparkline'

type DetailedPost = Outputs['reddit']['redditByPostId']['data'][number]

const sparklineColors = {
  gold: '#FCAB10',
  score: '#000000',
  comments: '#84DCCF',
  ratio: '#aaaaaa',
  inserted_at: '',
} as const

const Page: Component = () => {
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 25,
  })
  const { filterBy, props } = createRedditFilters()

  const results = createQuery(() => ['detailed_reddit', pagination, filterBy], {
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
    queryFn: () => {
      return api.reddit.redditByPostId.query({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        flair: filterBy.flair || undefined,
        subreddit: filterBy.subreddit || undefined,
        title: filterBy.title,
      })
    },
  })

  const col = createColumnHelper<DetailedPost>()
  const columns = [
    col.accessor('title', {
      header: 'Post',
      cell: cell => <PostDataCell cell={cell} onDelete={results.refetch} />,
      size: 700,
    }),
    col.display({
      id: 'tags',
      header: 'Features',
      cell: cell => {
        const post = cell.row.original
        return <PostTags post={post} />
      },
    }),
    col.accessor('created_at', {
      header: 'Posted at',
      cell: DateCell,
      size: 128,
    }),
    col.accessor('flair', {
      header: 'Flair',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('history', {
      header: 'Score history',
      size: 196,
      cell: cell => {
        const id = cell.row.original.post_id
        const history = cell.getValue().map(item => ({
          ...item,
          inserted_at: new Date(item.inserted_at),
        }))

        return (
          <Sparkline
            id={id}
            dataset={history}
            labelField='inserted_at'
            valueFields={['gold', 'score', 'comments', 'ratio']}
            colors={sparklineColors}
          />
        )
      },
    }),
  ]

  const table = createSolidTable<DetailedPost>({
    columns,
    get data() {
      return results.data?.data
    },
    state: {
      get pagination() {
        return pagination
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    enableSorting: false,
    get pageCount() {
      return results.data.meta.count ? Math.ceil(results.data.meta.count / pagination.pageSize) : 0
    },
  })

  return (
    <section class='max-w-full'>
      <PageHeader
        title='Detailed data'
        description={
          <>
            <span>This page contains aggregated data of the dataset. The posts are grouped by their ID. </span>
            <span>({results.data?.meta?.count} results)</span>
          </>
        }
      />

      <RedditFilters {...props} />

      <DataTable table={table} loading={results.isLoading} error={results.isError} />
    </section>
  )
}
export default Page

function PostDataCell(props: { cell: CellContext<DetailedPost, any>; onDelete: () => void }) {
  const post = props.cell.row.original

  const remove = createMutation({
    mutationFn: async () => {
      await api.reddit.removeByPostId.mutate({
        postId: post.post_id,
      })
    },
    onSuccess() {
      toast.success("Post and it's variants deleted successfully")
      props.onDelete()
    },
    onError(err) {
      if (err instanceof TRPCClientError) {
        toast.error(err?.message)
      } else {
        toast.error('Could not delete the post')
      }
    },
  })

  const contextMenu: ContextOptions[] = [
    {
      content: <>Delete post</>,
      command: () => remove.mutate(),
      icon: <IconDelete />,
    },
  ]

  return (
    <ContextMenu options={contextMenu}>
      <div class='flex flex-col'>
        <div class='flex space-x-2 text-xs text-gray-500 mb-1 select-none'>
          <span>{post.subreddit}</span>
          <a href={post.permalink} target='_blank' class='underline decoration-dotted text-accent-500'>
            {post.post_id}
          </a>
        </div>

        <p class='mb-2 select-none'>{post.title}</p>
      </div>
    </ContextMenu>
  )
}
