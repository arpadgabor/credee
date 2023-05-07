import { z } from 'zod'
import { FormData } from '../form-builder/form.type'
import countries from '../../../assets/countries.json'

export interface OnboardingFields {
  age: number
  gender: 'male' | 'female' | 'other'
  redditUsage: 1 | 2 | 3 | 4 | 5
  socialMediaUsage: 1 | 2 | 3 | 4 | 5
  fakeNewsAbility: 1 | 2 | 3 | 4 | 5
  academicField: string
  nationality: string
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
        // description: `You can skip this if you don't want to share.`,
        validator: z.string(),
        options: [
          { value: 'male', label: `Male` },
          { value: 'female', label: `Female` },
          { value: 'other', label: `Other` },
        ],
      },
      {
        type: 'number',
        id: 'age',
        title: "What's your age?",
        // description: "You can skip this if you don't want to share.",
        validator: z.string().transform(v => Number(v)),
      },
      {
        type: 'search',
        id: 'nationality',
        title: "What's your nationality?",
        // description: "You can skip this if you don't want to share.",
        validator: z.string(),
        options: countries,
      },
      {
        type: 'multi-select',
        id: 'academicStatus',
        title: 'What is the highest level of studies you graduated?',
        description: `You can skip this if you don't want to share. Eg. if you are currently doing your masters, please choose Undergraduate`,
        validator: z.string(),
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
        type: 'dropdown',
        id: 'academicField',
        title: 'What is your field of study?',
        validator: z.string(),
        options: [
          'Agriculture & Natural Resources',
          'Arts',
          'Biology & Life Science',
          'Business',
          'Communications & Journalism',
          'Computers & Mathematics',
          'Education',
          'Engineering',
          'Health',
          'Humanities & Liberal Arts',
          'Industrial Arts & Consumer Services',
          'Interdisciplinary',
          'Law & Public Policy',
          'Physical Sciences',
          'Psychology & Social Work',
          'Social Science',
          'Other',
        ].map(value => ({ value, label: value })),
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
