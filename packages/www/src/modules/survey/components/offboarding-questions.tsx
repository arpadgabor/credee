import { Outputs } from '@credee/api'
import { createMutation } from '@tanstack/solid-query'
import { createSignal } from 'solid-js'
import { api } from '../../../utils/trpc'
import { SurveyRenderer } from '../form-builder'
import { createOffboardingForm, type OffboardingFields } from '../forms/offboarding.form'

interface Props {
  surveyId: number
  participantId: number
  redirectUrl: string
}

export function OffboardingQuestions(props: Props) {
  const [formStructure] = createSignal(createOffboardingForm({ title: 'Almost there...' }))

  const submit = createMutation<Outputs['participants']['updateResponse'], any, OffboardingFields>({
    async mutationFn({ credibilityEvaluation, redditAsNewsSource }) {
      return await api.participants.updateResponse.mutate({
        participantId: props.participantId!,
        response: {
          credibilityEvaluation,
          redditAsNewsSource,
        },
      })
    },
    onSuccess() {
      location.replace(props.redirectUrl)
    },
  })

  function onSubmit(values: OffboardingFields) {
    submit.mutateAsync(values)
  }

  return (
    <div>
      <SurveyRenderer onSubmit={onSubmit} survey={formStructure()!} loading={submit.isLoading} submitLabel={'Finish!'} />
    </div>
  )
}
