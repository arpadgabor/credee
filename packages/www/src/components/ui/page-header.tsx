import { JSX, ParentComponent, Show } from 'solid-js'

export const PageHeader: ParentComponent<{ title: string; description?: JSX.Element }> = props => {
  return (
    <header class='flex flex-col mb-4'>
      <h1 class='text-2xl font-bold text-gray-900 mb-2'>{props.title}</h1>

      <Show when={props.description}>
        <p class='text-gray-600'>{props.description}</p>
      </Show>
    </header>
  )
}
