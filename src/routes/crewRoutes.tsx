import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { SuspenseRoute } from './shared';

const CrewLayout = lazy(() => import('@/pages/crew/CrewLayout'));
const CrewToday = lazy(() => import('@/pages/crew/CrewToday'));
const CrewChecklists = lazy(() => import('@/pages/crew/CrewChecklists'));
const CrewPhotos = lazy(() => import('@/pages/crew/CrewPhotos'));
const CrewComplete = lazy(() => import('@/pages/crew/CrewComplete'));

export function getCrewRoutes() {
  return [
    <Route key="crew" path="/crew" element={<SuspenseRoute><CrewLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><CrewToday /></SuspenseRoute>} />
      <Route path="checklists" element={<SuspenseRoute><CrewChecklists /></SuspenseRoute>} />
      <Route path="photos" element={<SuspenseRoute><CrewPhotos /></SuspenseRoute>} />
      <Route path="complete" element={<SuspenseRoute><CrewComplete /></SuspenseRoute>} />
    </Route>,
  ];
}
