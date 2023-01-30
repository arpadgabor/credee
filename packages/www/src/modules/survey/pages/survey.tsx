import { createPostCredibilityForm } from '../forms/post-credibility.form'
import { SurveyRenderer } from '../form-builder'
import { uploadsPath } from '../../../utils/trpc'
import { useParams, useSearchParams } from '@solidjs/router'
import { createSignal, onMount, Show } from 'solid-js'
import { z } from 'zod'
import { createStore } from 'solid-js/store'
import { Alert } from '@kobalte/core'
import { createOnboardingForm } from '../forms/onboarding.form'

const queryParams = z.object({
  referrer: z.enum(['prolific']),
  participant_id: z.string(),
})

export default function Survey() {
  const params = useParams<{ id: string }>()
  const [query] = useSearchParams()

  // @ts-expect-error we want it to be empty
  const [surveyInfo, setSurveyInfo] = createStore<z.infer<typeof queryParams>>({})
  const [invalidSession, setInvalidSession] = createSignal(false)

  onMount(() => {
    const result = queryParams.safeParse(query)
    if (result.success) {
      setSurveyInfo(result.data)
    } else {
      setInvalidSession(true)
    }
  })

  function onSubmit(data: any) {
    console.log(data)
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

        <SurveyRenderer onSubmit={onSubmit} survey={postCredibilityForm} />
      </section>
    </div>
  )
}
