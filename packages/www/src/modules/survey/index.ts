import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

export const SurveyRoutes: RouteDefinition[] = [
  {
    path: '/survey',
    component: lazy(() => import('./layout')),
    children: [
      {
        component: lazy(() => import('./pages/survey')),
        path: '/:id',
      },
    ],
  },
]
