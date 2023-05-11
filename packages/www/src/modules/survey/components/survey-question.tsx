import { Outputs } from '@credee/api'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { TRPCClientError } from '@trpc/client'
import { createSignal, Match, Switch } from 'solid-js'
import { api } from '../../../utils/trpc'
import { SurveyRenderer } from '../form-builder'
import { FormData } from '../form-builder/form.type'
import { createPostCredibilityForm, CredibilityForm } from '../forms/credibility.form'
import { FormStore, reset } from '@modular-forms/solid'

interface Props {
  surveyId: number
  participantId: number
  onDone: (redirectUrl: string) => void
}

export function SurveyQuestions(props: Props) {
  const [isDone, setIsDone] = createSignal(false)
  const [formStructure, setFormStructure] = createSignal<FormData<keyof CredibilityForm>>()

  const question = createQuery(() => [], {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    retry: false,
    queryFn: async () => {
      return await api.surveys.nextQuestion.query({
        surveyId: props.surveyId,
        participantId: props.participantId,
      })
    },
    onSuccess({ post, remaining, redirectUrl }) {
      if (redirectUrl && !post) {
        props.onDone(redirectUrl)
        window.scrollTo({ top: 0 })
        return
      }

      window.scrollTo({ top: 0 })
      setFormStructure(
        createPostCredibilityForm({
          title: `Please answer the following questions.`,
          imageAlt: post!.title,
          imageHref: post!.screenshot_filename,
        })
      )
    },
    onError(error) {
      if (error instanceof TRPCClientError) {
        if (error.message === 'SURVEY_DONE') {
          setIsDone(true)
        }
      }
    },
  })

  const submit = createMutation<Outputs['responses']['addCredibility'], any, CredibilityForm>({
    async mutationFn({
      credibility,
      contentStyle,
      contentStyleEffect,
      topicFamiliarity,
      theirRating,
      theirRatingWhy,
      contentStyleOther,
    }) {
      return await api.responses.addCredibility.mutate({
        participantId: props.participantId!,
        postId: question.data?.post!.post_id!,
        postVariantId: question.data!.post!.id!,
        surveyId: props.surveyId,
        response: {
          credibility,
          contentStyle,
          contentStyleEffect,
          topicFamiliarity,
          theirRating,
          theirRatingWhy,
          contentStyleOther,
        },
      })
    },
    onSuccess() {
      question.refetch()
    },
  })

  async function onSubmit(values: CredibilityForm, form?: FormStore<any, any>) {
    await submit.mutateAsync(values)
    if (form) {
      reset(form)
    }
  }

  return (
    <div>
      <Switch>
        <Match when={isDone()}>Thank you for completing the survey!</Match>

        <Match when={!isDone() && question.isSuccess && formStructure()}>
          <SurveyRenderer onSubmit={onSubmit} survey={formStructure()!} loading={submit.isLoading} submitLabel='Next' />
        </Match>

        <Match when={!isDone() && question.isError}>
          <p>Error</p>
        </Match>
      </Switch>
    </div>
  )
}
