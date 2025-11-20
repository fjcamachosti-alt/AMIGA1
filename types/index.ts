
// Fix: Add type definition for window.lucide to prevent TypeScript errors.
declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

export enum VehicleStatus {
  Disponible = 'Disponible',
  NoDisponible = 'No Disponible',
}

export enum VehicleVisibility {
  Visible = 'Visible',
  NoVisible = 'No Visible',
}

export interface VehicleDocument {
  name: string;
  file?: File | string;
  uploadDate?: string;
  expirationDate?: string; // New field for alerts
}

export interface UserDocument {
  name: string;
  file?: File | string;
  uploadDate?: string;
  expirationDate?: string; // New field for alerts
}

export interface VehicleHistory {
    id: string;
    date: string; // ISO string
    action: string;
    user: string;
    details?: string;
}

export interface FuelLog {
    id: string;
    vehicleId: string;
    date: string;
    liters: number;
    cost: number;
    mileage: number;
    performedBy: string;
}

export interface Vehicle {
  id: string;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  estado: VehicleStatus;
  visibilidad: VehicleVisibility;
  proximaITV: string;
  proximaRevision: number; // in km
  kmActual?: number;
  vencimientoSeguro: string;
  assignedTo?: string; // User ID of the technician
  documentosBasicos: VehicleDocument[];
  documentosEspecificos: VehicleDocument[];
  documentosAdicionales: VehicleDocument[];
  history?: VehicleHistory[];
}

export enum UserRole {
  Administrador = 'Administrador',
  Gestor = 'Gestor',
  Oficina = 'Oficina',
  Tecnico = 'Técnico',
  Medico = 'Médico/Enfermero',
}

export interface UserPermissions {
  vehicles: boolean;
  employees: boolean;
  erp: boolean;
  operations: boolean;
}

export interface User {
  id: string;
  nombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido: string;
  apodo?: string;
  rol: UserRole;
  email: string;
  telefono: string;
  fechaContratacion: string;
  finContrato?: string;
  activo: boolean;
  password?: string; 
  // New fields
  permissions?: UserPermissions; // For Office role
  dni?: string;
  numeroAfiliacionSS?: string;
  cuentaBancaria?: string;
  puesto?: string;
  horario?: string;
  tipoContrato?: string;
  jornada?: string;
  documentosObligatorios?: UserDocument[];
  documentosLaborales?: UserDocument[];
  documentosAdicionales?: UserDocument[];
  nominas?: UserDocument[];
}

export interface Alert {
    id: string;
    type: 'ITV' | 'Revisión' | 'Seguro' | 'Contrato' | 'Documento';
    description: string;
    dueDate: string;
    relatedId: string; // Vehicle or User ID
    seen?: boolean;
    relatedEntity?: string; 
    dueKm?: number;
    urgency?: 'high' | 'medium' | 'low';
}

export enum IncidentStatus {
    Abierta = 'Abierta',
    EnProgreso = 'En Progreso',
    Resuelta = 'Resuelta',
}

export interface Incident {
    id: string;
    description: string;
    date: string;
    vehicleId: string;
    reportedBy: string;
    status: IncidentStatus;
}

export interface AppState {
    isAuthenticated: boolean;
    user: User | null;
}

export type Page = 'Dashboard' | 'Vehículos' | 'Empleados' | 'ERP' | 'Operaciones' | 'Datos de Interés' | 'Mi Perfil' | 'Calendario';

// ERP Types
export interface Client {
    id: string;
    name: string;
    cif: string;
    address: string;
    email: string;
    phone: string;
}

export interface Supplier {
    id: string;
    name: string;
    cif: string;
    address: string;
    email: string;
    phone: string;
}

export type ERPFileCategory = 'Escrituras' | 'Certificados' | 'Contratos' | 'Documentos Bancarios' | 'AEAT' | 'Seguridad Social' | 'Facturas Emitidas' | 'Facturas Recibidas';

export interface ERPFile {
    id: string;
    name: string;
    category: ERPFileCategory;
    file: File | string;
    uploadDate: string;
    invoiceNumber?: string;
}

// Operations Types
export interface Shift {
    id: string;
    userId: string;
    start: string; // ISO 8601 format
    end: string; // ISO 8601 format
}

export interface MedicalSupply {
    id: string;
    name: string;
    category: string;
    stock: number;
    reorderLevel: number;
    expirationDate: string; // ISO 8601 format (YYYY-MM-DD)
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface InterestData {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
}
