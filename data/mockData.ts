
import { Vehicle, User, Alert, Incident, Client, Supplier, ERPFile, Shift, VehicleStatus, VehicleVisibility, UserRole, IncidentStatus, MedicalSupply, InterestData, FuelLog } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    matricula: '1234 ABC',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter',
    ano: 2022,
    estado: VehicleStatus.Disponible,
    visibilidad: VehicleVisibility.Visible,
    proximaITV: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    proximaRevision: 150000,
    kmActual: 148000,
    vencimientoSeguro: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: 'u3', // Assigned to Carlos (Tecnico)
    documentosBasicos: [
        { name: 'Permiso de Circulación', file: 'permiso_circulacion.pdf', uploadDate: '2023-01-15' },
        { name: 'Ficha Técnica', file: 'ficha_tecnica.pdf', uploadDate: '2023-01-15' },
    ],
    documentosEspecificos: [
        // Expiring soon for demo
        { name: 'Certificado Carrocero', file: 'cert_carrocero.pdf', uploadDate: '2023-02-01', expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ],
    documentosAdicionales: [],
    history: [
        { id: 'h1', date: '2023-01-15T10:00:00Z', action: 'Creación', user: 'Admin', details: 'Alta de vehículo en sistema' },
        { id: 'h2', date: '2023-06-20T14:30:00Z', action: 'Mantenimiento', user: 'Taller', details: 'Cambio de aceite' }
    ]
  },
  {
    id: '2',
    matricula: '5678 DEF',
    marca: 'Volkswagen',
    modelo: 'Crafter',
    ano: 2021,
    estado: VehicleStatus.NoDisponible,
    visibilidad: VehicleVisibility.Visible,
    proximaITV: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    proximaRevision: 120500,
    kmActual: 110000,
    vencimientoSeguro: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    documentosBasicos: [],
    documentosEspecificos: [],
    documentosAdicionales: [],
    history: []
  },
  {
    id: '3',
    matricula: '9012 GHI',
    marca: 'Ford',
    modelo: 'Transit',
    ano: 2023,
    estado: VehicleStatus.Disponible,
    visibilidad: VehicleVisibility.Visible,
    proximaITV: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    proximaRevision: 45000,
    kmActual: 20000,
    vencimientoSeguro: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    documentosBasicos: [],
    documentosEspecificos: [],
    documentosAdicionales: [],
    history: []
  },
    {
    id: '4',
    matricula: '3456 JKL',
    marca: 'Mercedes-Benz',
    modelo: 'Vito',
    ano: 2020,
    estado: VehicleStatus.Disponible,
    visibilidad: VehicleVisibility.Visible,
    proximaITV: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    proximaRevision: 95000,
    kmActual: 90000,
    vencimientoSeguro: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    documentosBasicos: [],
    documentosEspecificos: [],
    documentosAdicionales: [],
    history: []
  },
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    nombre: 'F.J.',
    primerApellido: 'Camacho',
    segundoApellido: '',
    apodo: 'Admin',
    rol: UserRole.Administrador,
    email: 'fj.camacho.sti@gmail.com',
    password: 'Apisistem1981', 
    telefono: '600000000',
    fechaContratacion: '2020-01-01',
    activo: true,
    puesto: 'Super Administrador',
    tipoContrato: 'Indefinido',
  },
  {
    id: 'u2',
    nombre: 'Ana',
    primerApellido: 'López',
    segundoApellido: 'Martínez',
    rol: UserRole.Gestor,
    email: 'gestor@amiga.com',
    password: '123', // Default password
    telefono: '600333444',
    fechaContratacion: '2021-03-20',
    finContrato: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activo: true,
    puesto: 'Jefa de Tráfico',
    tipoContrato: 'Temporal',
    documentosObligatorios: [
        // Already expired for demo
        { name: 'DNI', file: 'dni.pdf', uploadDate: '2021-03-20', expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    ]
  },
  {
    id: 'u3',
    nombre: 'Carlos',
    primerApellido: 'Sánchez',
    segundoApellido: 'Rodríguez',
    rol: UserRole.Tecnico,
    email: 'tecnico@amiga.com',
    password: '123', // Default password
    telefono: '600555666',
    fechaContratacion: '2022-07-01',
    activo: true,
    puesto: 'Técnico Sanitario',
    tipoContrato: 'Indefinido',
  },
  {
    id: 'u4',
    nombre: 'Maria',
    primerApellido: 'Gomez',
    segundoApellido: 'Ruiz',
    rol: UserRole.Oficina,
    email: 'oficina@amiga.com',
    password: '123',
    telefono: '600777888',
    fechaContratacion: '2023-01-10',
    activo: true,
    puesto: 'Administrativa',
    tipoContrato: 'Indefinido',
    permissions: {
        vehicles: true,
        employees: true,
        erp: false, // Restricted
        operations: true
    }
  },
   {
    id: 'u5',
    nombre: 'Laura',
    primerApellido: 'Fernandez',
    segundoApellido: 'Diaz',
    rol: UserRole.Medico,
    email: 'medico@amiga.com',
    password: '123',
    telefono: '600999000',
    fechaContratacion: '2023-05-10',
    activo: true,
    puesto: 'Médico',
    tipoContrato: 'Indefinido',
  }
];

export const mockAlerts: Alert[] = [
    // Static mock alerts can remain or be removed as the dynamic system takes over. 
    // Keeping one manual alert for demo purposes.
    { id: 'a_manual_1', type: 'Revisión', description: 'Revisión general de flota (Manual)', dueDate: '2024-12-01', relatedId: 'sys', seen: false, urgency: 'low' }
];

export const mockIncidents: Incident[] = [
    { id: 'i1', description: 'Neumático delantero derecho pinchado', date: '2023-10-25', vehicleId: '2', reportedBy: 'Carlos Sánchez', status: IncidentStatus.Resuelta },
    { id: 'i2', description: 'Fallo en la sirena', date: '2023-10-24', vehicleId: '1', reportedBy: 'Otro Técnico', status: IncidentStatus.EnProgreso },
    { id: 'i3', description: 'Pequeño golpe en parachoques trasero', date: '2023-10-22', vehicleId: '3', reportedBy: 'Técnico Asignado', status: IncidentStatus.Abierta }
];

export const mockClients: Client[] = [
    { id: 'c1', name: 'Hospital Central', cif: 'A12345678', address: 'Calle Mayor 1', email: 'contacto@hospitalcentral.es', phone: '912345678' },
    { id: 'c2', name: 'Aseguradora SaludTotal', cif: 'B87654321', address: 'Avenida de la Salud 2', email: 'info@saludtotal.com', phone: '987654321' },
];

export const mockSuppliers: Supplier[] = [
    { id: 's1', name: 'Suministros Médicos Avanzados', cif: 'C98765432', address: 'Polígono Industrial La Fuente 10', email: 'pedidos@sumedav.com', phone: '965432109' },
    { id: 's2', name: 'Taller Mecánico Rápido', cif: 'D23456789', address: 'Calle del Motor 5', email: 'citas@tallerrapido.es', phone: '901234567' },
];

export const mockErpFiles: ERPFile[] = [
    { id: 'f1', name: 'escritura_constitucion.pdf', category: 'Escrituras', file: 'escritura_constitucion.pdf', uploadDate: '2020-01-10' },
    { id: 'f2', name: 'certificado_iso_9001.pdf', category: 'Certificados', file: 'certificado_iso_9001.pdf', uploadDate: '2023-05-20' },
    { id: 'f3', name: 'Factura Enero Hospital.pdf', category: 'Facturas Emitidas', file: 'factura_enero_hospital.pdf', uploadDate: '2024-02-01', invoiceNumber: 'FE-2024-001' },
    { id: 'f4', name: 'Factura Taller.pdf', category: 'Facturas Recibidas', file: 'factura_taller.pdf', uploadDate: '2024-01-15', invoiceNumber: 'FR-Taller-589' },
];

const today = new Date();
const getShiftDate = (dayOffset: number, hour: number, minute: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

export const mockShifts: Shift[] = [
    { id: 'sh1', userId: 'u2', start: getShiftDate(0, 8, 0), end: getShiftDate(0, 16, 0) },
    { id: 'sh2', userId: 'u3', start: getShiftDate(0, 16, 0), end: getShiftDate(1, 0, 0) },
    // This shift conflicts with sh1 for user u2
    { id: 'sh3', userId: 'u2', start: getShiftDate(0, 14, 0), end: getShiftDate(0, 22, 0) },
    { id: 'sh4', userId: 'u3', start: getShiftDate(1, 8, 0), end: getShiftDate(1, 16, 0) },
];

const getDateString = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

export const mockMedicalSupplies: MedicalSupply[] = [
    { id: 'ms1', name: 'Vendas Elásticas (Caja 100u)', category: 'Vendajes', stock: 50, reorderLevel: 20, expirationDate: getDateString(365) },
    { id: 'ms2', name: 'Ibuprofeno 600mg (Caja 40u)', category: 'Medicamentos', stock: 15, reorderLevel: 20, expirationDate: getDateString(180) }, // Low stock
    { id: 'ms3', name: 'Guantes de Nitrilo (Caja 200u)', category: 'Equipamiento', stock: 100, reorderLevel: 50, expirationDate: getDateString(730) },
    { id: 'ms4', name: 'Jeringas 5ml (Caja 50u)', category: 'Equipamiento', stock: 80, reorderLevel: 40, expirationDate: getDateString(25) }, // Nearing expiration
    { id: 'ms5', name: 'Paracetamol 1g (Caja 40u)', category: 'Medicamentos', stock: 60, reorderLevel: 20, expirationDate: getDateString(-10) }, // Expired
];

export const mockInterestData: InterestData[] = [
    { id: 'id1', title: 'Protocolo de Limpieza', content: 'Todos los vehículos deben desinfectarse al finalizar el turno. Usar producto XYZ en cabina y zona asistencial.', updatedAt: '2024-01-20' },
    { id: 'id2', title: 'Códigos de Puerta Base 2', content: 'La clave de acceso peatonal es 1234. Portón vehículos: 5678#.', updatedAt: '2024-02-10' },
];

export const mockFuelLogs: FuelLog[] = [
    { id: 'fl1', vehicleId: '1', date: '2023-10-20', liters: 45.5, cost: 72.50, mileage: 147500, performedBy: 'Carlos Sánchez' },
    { id: 'fl2', vehicleId: '1', date: '2023-10-27', liters: 40.0, cost: 65.00, mileage: 147900, performedBy: 'Carlos Sánchez' },
];
