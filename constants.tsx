
import React from 'react';
import { Page } from './types';

interface NavItem {
  name: Page;
  icon: React.JSX.Element;
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: <i data-lucide="layout-dashboard"></i> },
  { name: 'Mi Perfil', icon: <i data-lucide="user-circle"></i> },
  { name: 'Calendario', icon: <i data-lucide="calendar-days"></i> },
  { name: 'Vehículos', icon: <i data-lucide="siren"></i> },
  { name: 'Empleados', icon: <i data-lucide="users"></i> },
  { name: 'ERP', icon: <i data-lucide="briefcase"></i> },
  { name: 'Operaciones', icon: <i data-lucide="activity"></i> },
  { name: 'Datos de Interés', icon: <i data-lucide="info"></i> },
];
