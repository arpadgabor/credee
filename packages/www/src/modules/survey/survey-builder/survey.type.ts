export type SurveyField = SurveyShortTextField | SurveyScaleField

export interface Survey {
  title: string
  fields: SurveyField[]
}

interface SurveyFieldBase {
  type: string
  id: string
  title: string
  description?: string
  validator: Zod.Schema
  media?: { type: 'image'; href: string; alt: string }[]
}

interface SurveyShortTextField extends SurveyFieldBase {
  type: 'short-text'
}

interface SurveyScaleField extends SurveyFieldBase {
  type: 'scale'
  options: { value: number; label: string; icon?: string }[]
}
