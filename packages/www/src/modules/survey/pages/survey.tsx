import { formSample } from '../form-sample'
import { SurveyRenderer } from '../survey-builder'

export default function Survey() {
  function onSubmit(data: any) {
    console.log(data)
  }
  return (
    <div>
      <section class='max-w-xl mx-auto pt-32 pb-12 px-4'>
        <SurveyRenderer onSubmit={onSubmit} survey={formSample} />
      </section>
    </div>
  )
}
