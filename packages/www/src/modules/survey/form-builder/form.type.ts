export interface FormFields {
  'short-text': FormShortTextField
  scale: FormScaleField
}

export type FormField = FormFields[keyof FormFields]

export interface FormData {
  title: string
  fields: FormField[]
}

export interface Media {
  type: 'image'
  href: string
  alt: string
}

interface FormFieldBase {
  type: keyof FormFields
  id: string
  title: string
  description?: string
  validator: Zod.Schema
  media?: Media[]
}

export interface FormShortTextField extends FormFieldBase {
  type: 'short-text'
}

export interface FormScaleField extends FormFieldBase {
  type: 'scale'
  options: { value: number; label: string; icon?: string }[]
}
