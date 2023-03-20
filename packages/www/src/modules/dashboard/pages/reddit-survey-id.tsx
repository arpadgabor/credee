import { useLocation, useParams } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { api } from '../../../utils/trpc'
import { PageHeader } from '../../../components/ui'
import { Switch, Match, Show } from 'solid-js'

export default function RedditSurveyId() {
  const params = useParams<{ id: string }>()

  const query = createQuery(() => [params.id], {
    async queryFn() {
      return api.surveys.getByIdDetailed.query({
        surveyId: Number(params.id),
      })
    },
  })

  return (
    <Switch>
      <Match when={query.isLoading}>Loading</Match>
      <Match when={query.isSuccess && query.data}>
        <section>
          <PageHeader title={query.data!.title} description={query.data!.deadline?.toISOString() || 'No deadline'} />

          <main>
            <Show when={query.data?.answers.length === 0}>No answers yet.</Show>

            {query.data?.answers.map(answer => (
              <div>Credibility: {answer.credibility}</div>
            ))}
          </main>
        </section>
      </Match>
    </Switch>
  )
}
