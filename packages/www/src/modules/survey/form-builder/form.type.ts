export interface FormFields {
  'short-text': FormShortTextField
  scale: FormScaleField
  'multi-select': FormMultiSelectField
  dropdown: FormDropdownField
  number: FormNumberField
  search: FormSearchField
}

export type FormField<Keys = string> = { id: Keys } & FormFields[keyof FormFields]

export interface FormData<Keys extends string = string> {
  title: string
  description?: string
  fields: FormField<Keys>[]
}

export interface Media {
  type: 'image'
  href: string
  alt: string
}

interface FormFieldBase {
  type: keyof FormFields
  title: string
  description?: string
  validator: Zod.Schema
  media?: Media[]
}

export interface FormShortTextField extends FormFieldBase {
  type: 'short-text'
}
export interface FormNumberField extends FormFieldBase {
  type: 'number'
}

export interface FormScaleField extends FormFieldBase {
  type: 'scale'
  options: { value: number; label: string; icon?: string }[]
}

export interface FormMultiSelectField extends FormFieldBase {
  type: 'multi-select'
  options: { value: string; label: string; icon?: string }[]
}

export interface FormDropdownField extends FormFieldBase {
  type: 'dropdown'
  placeholder?: string
  options: { value: string; label: string }[]
}

export interface FormSearchField extends FormFieldBase {
  type: 'search'
  placeholder?: string
  options: { value: string; label: string }[]
}
