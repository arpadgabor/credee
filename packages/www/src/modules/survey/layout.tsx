import { Outlet } from '@solidjs/router'
import { Component } from 'solid-js'

const Layout: Component = () => {
  return (
    <div class='w-screen'>
      <Outlet></Outlet>
    </div>
  )
}

export default Layout
