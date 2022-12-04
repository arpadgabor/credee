import { A, Outlet } from '@solidjs/router'
import { Component } from 'solid-js'

const NavLink: Component<{ href: string; label: string }> = props => {
  return (
    <A
      href={props.href}
      activeClass='!text-blue-500 !border-b'
      end
      class='font-semibold border-b-0 border-spacing-y-4 border-blue-200 text-gray-500'
    >
      {props.label}
    </A>
  )
}

const OverviewLayout: Component = () => {
  return (
    <div>
      <header class='px-8 py-4 border-b border-gray-100 space-x-4'>
        <NavLink href='/overview' label='Crawl Tasks' />
        <NavLink href='/overview/results/reddit' label='Results from Reddit' />
      </header>

      <main class='px-8 py-4'>
        <Outlet></Outlet>
      </main>
    </div>
  )
}

export default OverviewLayout
