import { Outputs } from '@credee/api'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { TRPCClientError } from '@trpc/client'
import { createSignal, Match, Switch } from 'solid-js'
import { api } from '../../../utils/trpc'
import { SurveyRenderer } from '../form-builder'
import { FormData } from '../form-builder/form.type'
import { createPostCredibilityForm, CredibilityForm } from '../forms/credibility.form'

interface Props {
  surveyId: number
  participantId: number
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
        location.replace(redirectUrl)
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
    async mutationFn({ credibility, contentStyle, contentStyleEffect, topicFamiliarity }) {
      return await api.responses.addCredibility.mutate({
        credibility,
        contentStyle,
        contentStyleEffect,
        topicFamiliarity,
        participantId: props.participantId!,
        postId: question.data?.post!.post_id!,
        postVariantId: question.data!.post!.id!,
        surveyId: props.surveyId,
      })
    },
    onSuccess() {
      question.refetch()
    },
  })

  function onSubmit(values: CredibilityForm) {
    submit.mutateAsync(values)
  }

  return (
    <div>
      <Switch>
        <Match when={isDone()}>Thank you for completing the survey!</Match>

        <Match when={!isDone() && question.isSuccess && formStructure()}>
          <SurveyRenderer
            onSubmit={onSubmit}
            survey={formStructure()!}
            loading={submit.isLoading}
            submitLabel={question.data?.remaining === 0 ? 'Finish' : 'Next'}
          />
        </Match>

        <Match when={!isDone() && question.isError}>
          <p>Error</p>
        </Match>
      </Switch>
    </div>
  )
}
