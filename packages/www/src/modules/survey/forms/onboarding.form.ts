import { z } from 'zod'
import { FormData } from '../form-builder/form.type'

type OnboardingFields =
  | 'gender'
  | 'ageRange'
  | 'nationality'
  | 'maritalStatus'
  | 'academicStatus'
  | 'employmentStatus'
  | 'annualIncomeLevel'

export function createOnboardingForm(options: { title: string }): FormData<OnboardingFields> {
  return {
    title: options.title,
    fields: [
      {
        type: 'multi-select',
        id: 'gender',
        title: 'What gender do you identify as?',
        description: `You can skip this if you don't want to share.`,
        validator: z.string(),
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
        validator: z.string(),
        options: [
          { value: 'under18', label: `17 or under` },
          { value: '18to24', label: `18-24` },
          { value: '24to35', label: `24-35` },
          { value: '35to50', label: `35-50` },
          { value: 'over50', label: `Over 50` },
        ],
      },
      {
        // TODO: Change to combobox
        type: 'short-text',
        id: 'nationality',
        title: 'What is your nationality?',
        description: `You can skip this if you don't want to share.`,
        validator: z.string(),
        // options: [
        //   { value: 'male', label: `Male` },
        //   { value: 'female', label: `Female` },
        //   { value: 'non-binary', label: `Non-binary` },
        // ],
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
    ],
  }
}
