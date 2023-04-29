import { Alert } from '@kobalte/core'
import { useParams, useSearchParams } from '@solidjs/router'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { createSignal, Match, onMount, Switch } from 'solid-js'
import { createStore } from 'solid-js/store'
import { z } from 'zod'
import { api } from '../../../utils/trpc'
import { SurveyQuestions } from '../components/survey-question'
import { SurveyRenderer } from '../form-builder'
import { createOnboardingForm, OnboardingFields } from '../forms/onboarding.form'
import { TRPCClientError } from '@trpc/client'
import toast from 'solid-toast'
import { RichEditor } from '../../../components/ui/rich-editor'

const queryParams = z.union([
  z.object({
    referrer: z.enum(['prolific']),
    participant_id: z.string(),
  }),
  z.object({
    referrer: z.enum(['custom']),
    participant_id: z.string().optional(),
  }),
])

type Query = z.infer<typeof queryParams>

export default function Survey() {
  const params = useParams<{ id: string }>()
  const surveyId = Number(params.id)

  const [query] = useSearchParams()
  const [participantId, setParticipantId] = createSignal(Number(localStorage.getItem('participant')) || undefined)

  const [surveyInfo, setSurveyInfo] = createStore<Query>({ referrer: 'custom' })
  const [invalidSession, setInvalidSession] = createSignal(false)

  const postCredibilityForm = createOnboardingForm({
    title: 'Onboarding',
  })

  const qSurvey = createQuery(() => [params.id], {
    queryFn: async () => {
      return api.surveys.getById.query(surveyId)
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const qOnboard = createMutation({
    mutationFn: async (data: OnboardingFields) => {
      return api.participants.onboard.mutate({
        surveyId,
        externalParticipantId: surveyInfo?.participant_id,
        externalPlatform: surveyInfo?.referrer!,
        response: {
          age: Number(data.age),
          gender: data.gender,
          academicStatus: data.academicStatus,
          redditUsage: data.redditUsage,
          socialMediaUsage: data.socialMediaUsage,
          fakeNewsAbility: data.fakeNewsAbility,
          academicField: data.academicField,
          // TODO:
          // redditAsNewsSource: data.redditAsNewsSource,
          nationality: data.nationality,
        },
      })
    },
    onSuccess(data) {
      localStorage.setItem('participant', String(data.id))
      setParticipantId(data.id)
    },
    onError(e) {
      if (e instanceof TRPCClientError) {
        toast.error(e.message)
      } else {
        toast.error('There was an unexpected error. Please try again later.')
      }
    },
  })

  onMount(() => {
    const result = queryParams.safeParse(query)

    if (result.success) {
      setSurveyInfo(result.data)
      qSurvey.refetch()
    } else {
      setInvalidSession(true)
    }
  })

  async function onSubmit(data: OnboardingFields) {
    await qOnboard.mutateAsync(data)
  }

  return (
    <div>
      <section class='max-w-3xl mx-auto pt-32 pb-64 px-4'>
        <Switch>
          <Match when={invalidSession() || qSurvey.isError}>
            <Alert.Root class='text-red-600 font-bold'>Sorry, it looks like you cannot access this survey.</Alert.Root>
          </Match>

          <Match when={qSurvey.data?.endsAt && new Date(qSurvey.data?.endsAt) < new Date()}>
            <Alert.Root class='text-red-600 font-bold'>We're sorry but this survey has ended.</Alert.Root>
          </Match>

          {/* Onboarding survey */}
          <Match when={qSurvey.isSuccess && !participantId()}>
            <RichEditor readonly defaultValue={qSurvey.data?.description} />

            <div class='h-8' />

            <SurveyRenderer
              onSubmit={onSubmit}
              survey={postCredibilityForm}
              loading={qOnboard.isLoading}
              submitLabel={'Continue'}
            />
          </Match>

          {/* Credibility survey */}
          <Match when={participantId() && qSurvey.data}>
            <SurveyQuestions participantId={participantId()!} surveyId={qSurvey.data!.id} />
          </Match>
        </Switch>
      </section>
    </div>
  )
}
