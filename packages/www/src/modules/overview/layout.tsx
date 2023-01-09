import { A, Outlet } from '@solidjs/router'
import { cva } from 'class-variance-authority'
import { link } from 'fs'
import { Component } from 'solid-js'

const NavLink: Component<{ href: string; label: string }> = props => {
  const linkClass = cva([
    'w-full py-2 px-3',
    'font-semibold text-gray-500',
    'transition duration-300 ease-in-out',
    'rounded hover:bg-gray-50',
  ])
  const activeClass = cva('text-blue-500 hover:bg-blue-50 bg-blue-50')

  return (
    <A href={props.href} end activeClass={activeClass()} class={linkClass()}>
      {props.label}
    </A>
  )
}

const OverviewLayout: Component = () => {
  return (
    <div class='w-screen max-h-screen flex'>
      <aside class='flex flex-col w-80 border-r border-gray-200'>
        <div class='py-6 px-6 border-b border-gray-200'>
          <h1 class='font-bold text-2xl text-blue-700'>Credee</h1>
        </div>

        <nav class='flex flex-col space-y-2 px-4 py-4'>
          <NavLink href='/overview' label='Crawl Tasks' />
          <NavLink href='/overview/results/reddit' label='Results from Reddit' />
        </nav>
      </aside>

      <main class='flex-1 px-4 py-4 overflow-y-auto'>
        <Outlet></Outlet>
      </main>
    </div>
  )
}

export default OverviewLayout
