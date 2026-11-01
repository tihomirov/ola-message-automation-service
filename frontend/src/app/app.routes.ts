import { Routes } from '@angular/router';
import { authGuard, flow2Guard } from './auth';
import { Shell } from './shell';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then((m) => m.LoginPage) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'status' },
      { path: 'status', title: 'Status', loadComponent: () => import('./pages/status').then((m) => m.StatusPage) },
      { path: 'orders', title: 'Orders', loadComponent: () => import('./pages/orders').then((m) => m.OrdersPage) },
      { path: 'settings', title: 'Settings', loadComponent: () => import('./pages/settings').then((m) => m.SettingsPage) },
      { path: 'template', title: 'Message', loadComponent: () => import('./pages/template').then((m) => m.TemplatePage) },
      {
        path: 'shop',
        title: 'Shop',
        canActivate: [flow2Guard],
        loadComponent: () => import('./pages/shop').then((m) => m.ShopPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
