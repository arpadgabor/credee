import { createSignal } from 'solid-js'

const [selectedVariants, setSelectedVariants] = createSignal<number[]>([])

export function useSurveyQuestionChooser() {
  function toggleVariant(id: number) {
    setSelectedVariants(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
  }

  return {
    selectedVariants,
    toggleVariant,
  }
}
