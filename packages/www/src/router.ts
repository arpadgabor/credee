import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'
import { OverviewRoutes } from './modules/dashboard'

export const routes: RouteDefinition[] = [
  ...OverviewRoutes,
  {
    path: '/',
    component: lazy(() => import('./pages/index')),
  },
  {
    path: '/*all',
    component: lazy(() => import('./pages/not-found')),
  },
]
