import { Outlet } from '@solidjs/router'
import { Component } from 'solid-js'

const Layout: Component = () => {
  return (
    <div>
      <Outlet></Outlet>
    </div>
  )
}

export default Layout
