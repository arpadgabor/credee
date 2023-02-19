import { z } from 'zod'
import { FormData } from '../form-builder/form.type'

export function createPostCredibilityForm(options: { title: string; imageHref: string; imageAlt: string }): FormData {
  return {
    title: options.title,
    fields: [
      {
        type: 'scale',
        id: 'credibility',
        title: 'Without looking it up, do believe what this post is saying?',
        description: 'Please avoid looking the post up on the internet.',
        validator: z.number(),
        media: [{ type: 'image', href: options.imageHref, alt: options.imageAlt }],
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
}
