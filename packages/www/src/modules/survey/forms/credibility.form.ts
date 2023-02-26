import { Inputs } from '@credee/api'
import { z } from 'zod'
import { FormData } from '../form-builder/form.type'

export type CredibilityForm = Pick<
  Inputs['responses']['addCredibility'],
  'contentStyle' | 'contentStyleEffect' | 'credibility' | 'topicFamiliarity' | 'contentStyleOther'
>

export function createPostCredibilityForm(options: {
  title: string
  imageHref: string
  imageAlt: string
}): FormData<keyof CredibilityForm> {
  return {
    title: options.title,
    fields: [
      {
        type: 'scale',
        id: 'credibility',
        title: 'How credible do you find the following reddit post?',
        description: "Please refrain from looking the post or it's contents up on the internet.",
        validator: z.number(),
        media: [{ type: 'image', href: options.imageHref, alt: options.imageAlt }],
        options: [
          { value: 1, label: `It is not credible at all`, icon: 'face' },
          { value: 2, label: `It is somewhat uncredible`, icon: 'face' },
          { value: 3, label: `I'm neutral`, icon: 'face' },
          { value: 4, label: `It is somewhat credible`, icon: 'face' },
          { value: 5, label: `It is very credible`, icon: 'face' },
        ],
      },
      {
        type: 'scale',
        id: 'topicFamiliarity',
        title: 'How familiar are you with the topic of the post?',
        description: undefined,
        validator: z.number(),
        options: [
          { value: 1, label: `Not familiar at all/never heard of it` },
          { value: 2, label: `I have heard of it, but no other familiarity` },
          { value: 3, label: `Limited knowledge of the topic` },
          { value: 4, label: `Moderate knowledge on the topic` },
          { value: 5, label: `High or very high knowledge on the topic` },
        ],
      },
      {
        type: 'multi-select',
        id: 'contentStyle',
        title: 'How would you characterize the content of the post?',
        description: 'Please choose what is most representative.',
        validator: z.string(),
        options: [
          { value: 'jargony', label: `I find the title hard to read or understand` },
          { value: 'easy-to-understand', label: `I find the title easy to understand` },
          { value: 'offensive', label: `I find the post offensive` },
          { value: 'disagreement', label: `I disagree with what the post claims` },
          { value: 'none', label: `I have no opinion` },
          { value: 'other', label: `Other, please specify below` },
        ],
      },
      {
        type: 'short-text',
        id: 'contentStyleOther',
        title: 'If you have another way to characterize the post, please specify below',
        description: undefined,
        validator: z.string(),
      },
      {
        type: 'scale',
        id: 'contentStyleEffect',
        title: 'Taking into account the previous answer, how does it affect your view on the credibility of the post?',
        description: undefined,
        validator: z.number(),
        options: [
          { value: 1, label: `Very negatively` },
          { value: 2, label: `Somewhat negatively` },
          { value: 3, label: `Neutral` },
          { value: 4, label: `Somewhat positively` },
          { value: 5, label: `Very positively` },
        ],
      },
    ],
  }
}
