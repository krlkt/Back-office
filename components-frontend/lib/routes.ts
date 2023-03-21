export interface AppRoute {
  path: string;
  name: string;
}

export const appRoutes: AppRoute[] = [
  {
    path: '/tenant/create',
    name: 'Create Tenant',
  },
  {
    path: '/tenant/manage',
    name: 'Tenant Management',
  },
  {
    path: '/feature',
    name: 'Feature',
  },
];
