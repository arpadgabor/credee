import { createPostCredibilityForm } from '../forms/post-credibility.form'
import { SurveyRenderer } from '../form-builder'
import { api, uploadsPath } from '../../../utils/trpc'
import { useParams, useSearchParams } from '@solidjs/router'
import { createSignal, onMount, Show } from 'solid-js'
import { z } from 'zod'
import { createStore } from 'solid-js/store'
import { Alert } from '@kobalte/core'
import { createOnboardingForm, OnboardingFields } from '../forms/onboarding.form'
import { createMutation } from '@tanstack/solid-query'

const queryParams = z.object({
  referrer: z.enum(['prolific']),
  participant_id: z.string(),
})
type Query = z.infer<typeof queryParams>

export default function Survey() {
  const params = useParams<{ id: string }>()
  const [query] = useSearchParams()

  // @ts-ignore
  const [surveyInfo, setSurveyInfo] = createStore<Query | undefined>()
  const [invalidSession, setInvalidSession] = createSignal(false)

  const onboard = createMutation({
    mutationFn: async (data: OnboardingFields) => {
      return api.participants.onboard.mutate({
        externalParticipantId: surveyInfo?.participant_id!,
        externalPlatform: surveyInfo?.referrer!,
        surveyId: Number(params.id),
        academicStatus: data.academicStatus,
        ageRange: data.ageRange,
        gender: data.gender,
      })
    },
  })

  onMount(() => {
    const result = queryParams.safeParse(query)
    if (result.success) {
      setSurveyInfo(result.data)
    } else {
      setInvalidSession(true)
    }
  })

  async function onSubmit(data: OnboardingFields) {
    await onboard.mutateAsync(data)
    if (onboard.isSuccess) {
      console.log(onboard.data!.id)
      localStorage.setItem('onboarded', String(onboard.data!.id))
    }
  }

  const postCredibilityForm = createOnboardingForm({
    title: 'Onboarding',
  })

  return (
    <div>
      <section class='max-w-2xl mx-auto pt-32 pb-12 px-4'>
        <Show when={invalidSession()}>
          <Alert.Root class='text-red-600 font-bold'>Sorry, it looks like you cannot access this survey.</Alert.Root>
        </Show>

        <Show when={!invalidSession()}>
          <SurveyRenderer onSubmit={onSubmit} survey={postCredibilityForm} loading={onboard.isLoading} />
        </Show>
      </section>
    </div>
  )
}
