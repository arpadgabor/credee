import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

export const OverviewRoutes: RouteDefinition[] = [
  {
    path: '/dashboard',
    component: lazy(() => import('./layout')),
    children: [
      {
        component: lazy(() => import('./pages/reddit-jobs')),
        path: '/reddit/jobs',
      },
      {
        path: '/reddit/dataset',
        component: lazy(() => import('./pages/reddit-dataset')),
      },
    ],
  },
]
