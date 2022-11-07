import testJson from './rich-text-test.json' assert { type: 'json' }

enum TextStyle {
  None = 0, // added by us
  Bold = 1,
  Italic = 2,
  BoldItalic = 3,
  // striketrough, spoiler, underline, sub/superscript
  Code = 64,
}
type StartIndex = number
type Length = number

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

export function richTextToHtml(docs: RichTextJSONSegment[], rawElem?: string): string {
  return docs
    ?.map(doc => {
      if (doc.e === 'hr') {
        return `<hr />`
      }

      if (doc.e === 'text') {
        if (doc.f) return styleText(doc.t!, doc.f)
        return doc.t
      }

      if (doc.e === 'raw') {
        return rawElem ? `<${rawElem}>${doc.t}</${rawElem}>` : doc.t
      }

      if (doc.e === 'r/') {
        return `<a href="https://reddit.com/r/${doc.t}">r/${doc.t}</a>`
      }
      if (doc.e === 'u/') {
        return `<a href="https://reddit.com/u/${doc.t}">r/${doc.t}</a>`
      }

      if (doc.e === 'link') {
        return `<a href="${doc.u}">${doc.t}</a>`
      }

      if (doc.e === 'list') {
        const type = doc.o ? 'ol' : 'ul'
        return `<${type}>${richTextToHtml(doc.c!)}</${type}>`
      }

      if (doc.e === 'li') {
        return `<li>${richTextToHtml(doc.c!)}</li>`
      }

      if (doc.e === 'par') {
        return `<p>${richTextToHtml(doc.c!)}</p>`
      }

      if (doc.e === 'code') {
        return `<pre>${richTextToHtml(doc.c!, 'pre')}</pre>`
      }

      if (doc.e === 'blockquote') {
        return `<blockquote>${richTextToHtml(doc.c!)}</blockquote>`
      }

      if (doc.e === 'h') {
        return `<h${doc.l}>${richTextToHtml(doc.c!)}</h${doc.l}>`
      }

      if (doc.e === 'table') {
        const rows = doc
          .c!.map(
            row => `<tr>${(row as any).map((col: RichTextJSONSegment) => `<td>${richTextToHtml(col.c!)}</td>`).join('')}</tr>`
          )
          .join('')
        return `<table><thead><tr>${doc
          .h!.map(col => `<th>${richTextToHtml(col.c!)}</th>`)
          .join('')}</tr></thead><tbody>${rows}</tbody></table>`
      }
    })
    .join('\n')
}

function styleText(text: string, replacements: RichTextJSONSegment['f']) {
  const _replacements: RichTextJSONSegment['f'] = [
    [TextStyle.None, 0, 0],
    ...replacements!,
    [TextStyle.None, text.length - 1, 0],
  ]

  return _replacements
    .map(([type, start, length]) => {
      const section = text.substring(start, start + length)

      if (type === TextStyle.None) return section
      if (type === TextStyle.Bold) return `<strong>${section}</strong>`
      if (type === TextStyle.Italic) return `<em>${section}</em>`
      if (type === TextStyle.BoldItalic) return `<strong><em>${section}</em></strong>`
      if (type === TextStyle.Code) return `<code>${section}</code>`
      return section
    })
    .join('')
}

console.log(richTextToHtml(testJson.richtextContent.document as any))
