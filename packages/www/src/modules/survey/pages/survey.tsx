import { createPostCredibilityForm } from '../forms/post-credibility.form'
import { SurveyRenderer } from '../form-builder'
import { uploadsPath } from '../../../utils/trpc'

export default function Survey() {
  function onSubmit(data: any) {
    console.log(data)
  }

  const postCredibilityForm = createPostCredibilityForm({
    title: 'Post 1',
    imageAlt: '',
    imageHref: uploadsPath(''),
  })

  return (
    <div>
      <section class='max-w-2xl mx-auto pt-32 pb-12 px-4'>
        <SurveyRenderer onSubmit={onSubmit} survey={postCredibilityForm} />
      </section>
    </div>
  )
}
