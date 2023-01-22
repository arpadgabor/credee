import { ParentComponent, Show } from 'solid-js'

export const PageHeader: ParentComponent<{ title: string; description?: string }> = props => {
  return (
    <header class='flex flex-col'>
      <h1 class='text-2xl font-bold text-gray-900'>{props.title}</h1>

      <Show when={props.description}>
        <p class='text-gray-600'>{props.description}</p>
      </Show>
    </header>
  )
}
