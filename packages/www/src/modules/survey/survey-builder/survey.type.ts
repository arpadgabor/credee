export interface Survey {
  title: string
  fields: (SurveyShortTextField | SurveyScaleField)[]
}

interface SurveyField {
  type: string
  id: string
  title: string
  description?: string
  validator: Zod.Schema
  media?: { type: 'image'; href: string; alt: string }[]
}

interface SurveyShortTextField extends SurveyField {
  type: 'short-text'
}

interface SurveyScaleField extends SurveyField {
  type: 'scale'
  options: { value: number; label: string; icon?: string }[]
}
