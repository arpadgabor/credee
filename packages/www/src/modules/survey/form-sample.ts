import { z } from 'zod'
import { Survey } from './survey-builder/survey.type'

export const formSample: Survey = {
  title: 'Reddit Credibility Survey',
  fields: [
    {
      type: 'short-text',
      id: 'name',
      title: 'Your name',
      description: `We'll keep it a secret.`,
      validator: z.string().min(1),
    },
    {
      type: 'scale',
      id: 'credibility',
      title: 'Without looking it up, do believe what this post is saying?',
      description: 'Please avoid looking the post up on the internet.',
      validator: z.number(),
      media: [{ type: 'image', href: '', alt: '' }],
      options: [
        { value: 1, label: `I don't believe it at all`, icon: 'face' },
        { value: 2, label: `I somewhat don't believe it`, icon: 'face' },
        { value: 3, label: `I'm neutral`, icon: 'face' },
        { value: 4, label: `I somewhat believe it`, icon: 'face' },
        { value: 5, label: `I very much believe it`, icon: 'face' },
      ],
    },
  ],
}
