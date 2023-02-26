import { z } from 'zod'
import { FormData } from '../form-builder/form.type'

export interface OnboardingFields {
  gender: 'male' | 'female' | 'non-binary'
  ageRange: 'under18' | '18to24' | '24to35' | '35to50' | 'over50'
  redditUsage: 1 | 2 | 3 | 4 | 5
  socialMediaUsage: 1 | 2 | 3 | 4 | 5
  fakeNewsAbility: 1 | 2 | 3 | 4 | 5
  academicStatus:
    | 'primary-school'
    | 'middle-school'
    | 'secondary-school'
    | 'post-secondary'
    | 'undergraduate'
    | 'graduate'
    | 'doctoral'
    | 'post-doctoral'
}

export function createOnboardingForm(options: { title: string }): FormData<keyof OnboardingFields> {
  return {
    title: options.title,
    fields: [
      {
        type: 'multi-select',
        id: 'gender',
        title: 'What gender do you identify as?',
        description: `You can skip this if you don't want to share.`,
        validator: z.string().optional(),
        options: [
          { value: 'male', label: `Male` },
          { value: 'female', label: `Female` },
          { value: 'non-binary', label: `Non-binary` },
        ],
      },
      {
        type: 'multi-select',
        id: 'ageRange',
        title: "What's your age?",
        description: "You can skip this if you don't want to share.",
        validator: z.string().optional(),
        options: [
          { value: 'under18', label: `17 or under` },
          { value: '18to24', label: `18-24` },
          { value: '24to35', label: `24-35` },
          { value: '35to50', label: `35-50` },
          { value: 'over50', label: `Over 50` },
        ],
      },
      {
        type: 'multi-select',
        id: 'academicStatus',
        title: 'What is the highest level of studies you graduated?',
        description: `You can skip this if you don't want to share. Eg. if you are currently doing your masters, please choose Undergraduate`,
        validator: z.string().optional(),
        options: [
          { value: 'primary-school', label: `Primary school` },
          { value: 'middle-school', label: `Middle school` },
          { value: 'secondary-school', label: `Secondary school` },
          { value: 'post-secondary', label: `Post secondary` },
          { value: 'undergraduate', label: `Undergraduate/Bachelors level` },
          { value: 'graduate', label: `Graduate/Masters level` },
          { value: 'doctoral', label: `Doctoral studies` },
          { value: 'post-doctoral', label: `Post-doctoral` },
        ],
      },
      {
        type: 'scale',
        id: 'redditUsage',
        title: 'Have you used reddit before? How often?',
        validator: z.number(),
        options: [
          { value: 1, label: 'Never used it' },
          { value: 2, label: 'I rarely use it' },
          { value: 3, label: 'I use it sometimes' },
          { value: 4, label: 'I use it at least once a week' },
          { value: 5, label: 'I use it every day' },
        ],
      },
      {
        type: 'scale',
        id: 'socialMediaUsage',
        title: 'How much do you use social media, in general?',
        validator: z.number(),
        options: [
          { value: 1, label: 'I never use social media' },
          { value: 2, label: 'I rarely use social media' },
          { value: 3, label: 'I use social media now and then' },
          { value: 4, label: 'I use social media at least once a week' },
          { value: 5, label: 'I use social media every day' },
        ],
      },
      {
        type: 'scale',
        id: 'fakeNewsAbility',
        title: 'How would you evaluate your ability to differentiate between fake/misleading media and true/credible media?',
        validator: z.number(),
        options: [
          { value: 1, label: 'I find it difficult to differentiate' },
          { value: 2, label: 'I find it somewhat difficult to differentiate' },
          { value: 3, label: 'I find it neither difficult nor easy to differentiate' },
          { value: 4, label: 'I find it somewhat easy to differentiate' },
          { value: 5, label: 'I find it easy to differentiate' },
        ],
      },
    ],
  }
}
