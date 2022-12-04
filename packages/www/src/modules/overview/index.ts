import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

export const OverviewRoutes: RouteDefinition[] = [
  {
    path: '/overview',
    component: lazy(() => import('./layout')),
    children: [
      {
        component: lazy(() => import('./pages/index')),
        path: '/',
      },
      {
        path: '/results/reddit',
        component: lazy(() => import('./pages/results-reddit')),
      },
    ],
  },
]
