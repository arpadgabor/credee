import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'
import { OverviewRoutes } from './modules/dashboard'
import { SurveyRoutes } from './modules/survey'

export const routes: RouteDefinition[] = [
  ...OverviewRoutes,
  ...SurveyRoutes,
  {
    path: '/',
    component: lazy(() => import('./pages/index')),
  },
  {
    path: '/*all',
    component: lazy(() => import('./pages/not-found')),
  },
]
