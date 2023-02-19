import { Outputs } from '@credee/api'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { createSignal, Match, Switch } from 'solid-js'
import { api } from '../../../utils/trpc'
import { SurveyRenderer } from '../form-builder'
import { createPostCredibilityForm } from '../forms/post-credibility.form'

interface Props {
  surveyId: number
  participantId: number
}

export function SurveyQuestions(props: Props) {
  const [formStructure, setFormStructure] = createSignal<ReturnType<typeof createPostCredibilityForm>>()
  const query = createQuery(() => [], {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      return await api.surveys.nextQuestion.query({
        surveyId: props.surveyId,
        participantId: props.participantId,
      })
    },
    onSuccess(data) {
      const structure = createPostCredibilityForm({
        title: 'Please answer the following:',
        imageAlt: data?.title!,
        imageHref: data?.screenshot_filename!,
      })
      setFormStructure(structure)
    },
  })

  const submit = createMutation<Outputs['responses']['addCredibility'], any, { credibility: number }>({
    async mutationFn({ credibility }) {
      return await api.responses.addCredibility.mutate({
        credibility,
        participantId: props.participantId!,
        postId: query.data?.post_id!,
        postVariantId: query.data?.id!,
        surveyId: props.surveyId,
      })
    },
    onSuccess() {
      query.refetch()
    },
  })

  function onSubmit(values: { credibility: number }) {
    submit.mutateAsync({
      credibility: values.credibility,
    })
  }

  return (
    <div>
      <Switch>
        <Match when={query.isSuccess && formStructure()}>
          <SurveyRenderer onSubmit={onSubmit} survey={formStructure()!} loading={submit.isLoading} />
        </Match>
        <Match when={query.isError}>
          <p> Error</p>
        </Match>
      </Switch>
    </div>
  )
}
