import { A, Outlet } from '@solidjs/router'
import { cva } from 'class-variance-authority'
import { children, Component, ParentComponent } from 'solid-js'

const NavLink: ParentComponent<{ href: string }> = props => {
  const slot = children(() => props.children)
  const linkClass = cva([
    'w-full py-3 px-3',
    'font-semibold text-gray-500',
    'transition duration-300 ease-in-out',
    'rounded hover:bg-gray-50',
  ])
  const activeClass = cva('text-blue-500 hover:bg-blue-50 bg-gradient-to-r from-blue-50 to-blue-100/10')

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
      <aside class='flex flex-col h-screen w-80 border-r border-gray-200'>
        <div class='py-6 px-6 border-b border-gray-200'>
          <h1 class='font-bold text-2xl text-blue-700'>Credee</h1>
        </div>

        <nav class='flex flex-col px-4 py-4'>
          <NavGroupHeader>Reddit</NavGroupHeader>
          <NavLink href='/dashboard/reddit/jobs'>Crawl Jobs</NavLink>
          <NavLink href='/dashboard/reddit/dataset'>Dataset</NavLink>
        </nav>
      </aside>

      <main class='flex-1 px-4 py-4 overflow-y-auto'>
        <Outlet></Outlet>
      </main>
    </div>
  )
}

export default OverviewLayout
