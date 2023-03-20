import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

export const OverviewRoutes: RouteDefinition[] = [
  {
    path: '/dashboard',
    component: lazy(() => import('./layout')),
    children: [
      {
        component: lazy(() => import('./pages/reddit-surveys')),
        path: '/reddit/surveys',
      },
      {
        component: lazy(() => import('./pages/reddit-survey-id')),
        path: '/reddit/surveys/:id',
      },
      {
        component: lazy(() => import('./pages/reddit-create-survey')),
        path: '/reddit/surveys/create',
      },
      {
        component: lazy(() => import('./pages/reddit-jobs')),
        path: '/reddit/jobs',
      },
      {
        path: '/reddit/dataset',
        component: lazy(() => import('./pages/reddit-dataset')),
      },
      {
        path: '/reddit/detailed',
        component: lazy(() => import('./pages/reddit-detailed')),
      },
    ],
  },
]
