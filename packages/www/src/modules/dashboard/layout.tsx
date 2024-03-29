import { A, Outlet } from '@solidjs/router'
import { cva } from 'class-variance-authority'
import { children, Component, ParentComponent } from 'solid-js'

const NavLink: ParentComponent<{ href: string }> = props => {
  const slot = children(() => props.children)
  const linkClass = cva([
    'w-full py-3 px-3',
    'font-semibold text-gray-500 dark:text-gray-300',
    'transition duration-300 ease-in-out',
    'rounded hover:bg-gray-50 dark:hover:bg-gray-800',
  ])
  const activeClass = cva(
    'text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-800 bg-gradient-to-r from-accent-50 dark:from-accent-900 to-accent-100/10'
  )

  return (
    <A href={props.href} end activeClass={activeClass()} class={linkClass()}>
      {slot()}
    </A>
  )
}

const NavGroupHeader: ParentComponent = props => {
  const slot = children(() => props.children)
  const linkClass = cva(['w-full py-1 px-3', 'font-semibold uppercase text-sm text-gray-400'])

  return <h2 class={linkClass()}>{slot()}</h2>
}

const OverviewLayout: Component = () => {
  return (
    <div class='w-screen max-h-screen flex'>
      <aside class='flex flex-col h-screen w-80 border-r border-gray-200 dark:border-gray-800'>
        <div class='py-6 px-6 border-b border-gray-200 dark:border-gray-800'>
          <h1 class='font-bold text-2xl text-accent-700 dark:text-accent-400'>Credee</h1>
        </div>

        <nav class='flex flex-col px-4 py-4'>
          <NavGroupHeader>Reddit</NavGroupHeader>
          <NavLink href='/dashboard/reddit/surveys'>Surveys</NavLink>
          <NavLink href='/dashboard/reddit/detailed'>Aggregate data</NavLink>
          <NavLink href='/dashboard/reddit/dataset'>All data</NavLink>
          <NavLink href='/dashboard/reddit/jobs'>Scrape Jobs</NavLink>
        </nav>
      </aside>

      <main class='flex-1 px-4 py-4 overflow-y-auto'>
        <Outlet></Outlet>
      </main>
    </div>
  )
}

export default OverviewLayout
