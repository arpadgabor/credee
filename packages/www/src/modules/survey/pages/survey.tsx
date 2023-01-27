import { formSample } from '../form-sample'
import { SurveyRenderer } from '../survey-builder'

export default function Survey() {
  function onSubmit(data: any) {
    console.log(data)
  }
  return (
    <div>
      <SurveyRenderer onSubmit={onSubmit} survey={formSample} />
    </div>
  )
}
