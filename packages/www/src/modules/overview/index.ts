import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

export const OverviewRoutes: RouteDefinition[] = [
  {
    path: '/overview',
    component: lazy(() => import('./pages/index')),
  },
]
