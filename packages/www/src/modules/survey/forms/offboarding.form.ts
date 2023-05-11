import { z } from 'zod'
import { FormData } from '../form-builder/form.type'

export interface OffboardingFields {
  redditAsNewsSource: string
  credibilityEvaluation: string
}

export function createOffboardingForm(options: { title: string }): FormData<keyof OffboardingFields> {
  return {
    title: options.title,
    fields: [
      {
        id: 'redditAsNewsSource',
        title: 'What do you think about reddit as a news source?',
        description: `Any problems you see, opportunities, why you prefer it or why you don't, etc.`,
        type: 'short-text',
        validator: z.string().min(1),
      },
      {
        id: 'credibilityEvaluation',
        title: 'How do you evaluate the credibility of a post?',
        description: 'Please describe your process of evaluating the credibility of a post.',
        type: 'short-text',
        validator: z.string().min(1),
      },
    ],
  }
}
