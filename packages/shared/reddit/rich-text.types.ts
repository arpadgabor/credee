export enum TextStyle {
  None = 0, // added by us
  Bold = 1,
  Italic = 2,
  BoldItalic = 3,
  // striketrough, spoiler, underline, sub/superscript
  Code = 64,
}
export type StartIndex = number
export type Length = number

export interface RichTextJSONSegment {
  e:
    | 'text'
    | 'spoilertext'
    | 'raw'
    | 'link'
    | 'img'
    | 'blockquote'
    | 'par'
    | 'h'
    | 'list'
    | 'li'
    | 'code'
    | 'u/'
    | 'r/'
    | 'hr'
    | 'table'
  o?: boolean
  l?: number
  id?: string
  t?: string
  f?: Array<[TextStyle, StartIndex, Length]>
  c?: RichTextJSONSegment[]
  u?: string
  h?: RichTextJSONSegment[]
  a?: 'C'
}
