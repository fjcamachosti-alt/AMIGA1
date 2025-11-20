
import { mockVehicles, mockUsers, mockAlerts, mockIncidents, mockClients, mockSuppliers, mockErpFiles, mockShifts, mockMedicalSupplies, mockInterestData, mockFuelLogs } from '../data/mockData';
import { Vehicle, User, Incident, Client, Supplier, ERPFile, ERPFileCategory, IncidentStatus, Shift, MedicalSupply, AuthResponse, Alert, InterestData, VehicleDocument, UserDocument, FuelLog, VehicleHistory } from '../types';

const LATENCY = 500; // ms

// A helper to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let vehicles = [...mockVehicles];
let users = [...mockUsers];
let incidents = [...mockIncidents];
let clients = [...mockClients];
let suppliers = [...mockSuppliers];
let erpFiles = [...mockErpFiles];
let shifts = [...mockShifts];
let medicalSupplies = [...mockMedicalSupplies];
let interestData = [...mockInterestData];
let fuelLogs = [...mockFuelLogs];
let runtimeAlerts: Alert[] = [...mockAlerts];

// Helper to generate simple tokens
const generateToken = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Helper to generate dynamic alerts
const generateAllProactiveAlerts = () => {
    const generatedAlerts: Alert[] = [];
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // --- 1. Vehicle Alerts ---
    vehicles.forEach(v => {
        // 1a. Core Dates (ITV, Insurance)
        const itvDate = new Date(v.proximaITV);
        if (itvDate.getTime() - now.getTime() < thirtyDays) {
            generatedAlerts.push({
                id: `alert_itv_${v.id}`,
                type: 'ITV',
                description: `ITV próxima a vencer: ${v.matricula}`,
                dueDate: v.proximaITV,
                relatedId: v.id,
                relatedEntity: 'Vehículo',
                urgency: itvDate < now ? 'high' : 'medium'
            });
        }

        const insDate = new Date(v.vencimientoSeguro);
        if (insDate.getTime() - now.getTime() < thirtyDays) {
            generatedAlerts.push({
                id: `alert_ins_${v.id}`,
                type: 'Seguro',
                description: `Seguro próximo a vencer: ${v.matricula}`,
                dueDate: v.vencimientoSeguro,
                relatedId: v.id,
                relatedEntity: 'Vehículo',
                urgency: insDate < now ? 'high' : 'medium'
            });
        }

        // 1b. Revision (Km)
        if (v.kmActual && (v.proximaRevision - v.kmActual < 5000)) {
            generatedAlerts.push({
                id: `alert_rev_${v.id}`,
                type: 'Revisión',
                description: `Revisión necesaria: ${v.matricula} (${v.kmActual}km)`,
                dueDate: `${v.proximaRevision} km`,
                relatedId: v.id,
                relatedEntity: 'Vehículo',
                urgency: v.kmActual > v.proximaRevision ? 'high' : 'medium'
            });
        }
        
        // 1c. Vehicle Document Alerts
        const allDocs: VehicleDocument[] = [...(v.documentosBasicos || []), ...(v.documentosEspecificos || []), ...(v.documentosAdicionales || [])];
        allDocs.forEach(doc => {
            if (doc.expirationDate) {
                const docDate = new Date(doc.expirationDate);
                if (docDate.getTime() - now.getTime() < thirtyDays) {
                    generatedAlerts.push({
                        id: `alert_vdoc_${v.id}_${doc.name.replace(/\s/g, '')}`,
                        type: 'Documento',
                        description: `Caducidad ${doc.name}: ${v.matricula}`,
                        dueDate: doc.expirationDate,
                        relatedId: v.id,
                        relatedEntity: 'Vehículo',
                        urgency: docDate < now ? 'high' : 'medium'
                    });
                }
            }
        });
    });

    // --- 2. User Alerts ---
    users.forEach(u => {
        // 2a. Contract End
        if (u.finContrato) {
            const contractDate = new Date(u.finContrato);
            if (contractDate.getTime() - now.getTime() < thirtyDays) {
                generatedAlerts.push({
                    id: `alert_con_${u.id}`,
                    type: 'Contrato',
                    description: `Fin de contrato: ${u.nombre} ${u.primerApellido}`,
                    dueDate: u.finContrato,
                    relatedId: u.id,
                    relatedEntity: 'Empleado',
                    urgency: contractDate < now ? 'high' : 'medium'
                });
            }
        }
        
        // 2b. User Document Alerts (Licenses, Certs, etc)
        const allUserDocs: UserDocument[] = [...(u.documentosObligatorios || []), ...(u.documentosLaborales || []), ...(u.documentosAdicionales || [])];
        allUserDocs.forEach(doc => {
            if (doc.expirationDate) {
                const docDate = new Date(doc.expirationDate);
                if (docDate.getTime() - now.getTime() < thirtyDays) {
                     generatedAlerts.push({
                        id: `alert_udoc_${u.id}_${doc.name.replace(/\s/g, '')}`,
                        type: 'Documento',
                        description: `Caducidad ${doc.name}: ${u.nombre} ${u.primerApellido}`,
                        dueDate: doc.expirationDate,
                        relatedId: u.id,
                        relatedEntity: 'Empleado',
                        urgency: docDate < now ? 'high' : 'medium'
                    });
                }
            }
        });
    });

    return generatedAlerts;
};

export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<AuthResponse> => {
      await sleep(LATENCY);
      // Find user with matching email and password
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
          throw new Error('Credenciales inválidas');
      }
      
      if (!user.activo) {
          throw new Error('Usuario inactivo');
      }

      return {
          accessToken: `access_${generateToken()}`,
          refreshToken: `refresh_${generateToken()}`,
          user
      };
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
      await sleep(LATENCY);
      if (!refreshToken || !refreshToken.startsWith('refresh_')) {
          throw new Error('Token de refresco inválido');
      }
      return { accessToken: `access_${generateToken()}` };
  },

  // Vehicles
  getVehicles: async (userId?: string) => {
    await sleep(LATENCY);
    if (userId) {
        return vehicles.filter(v => v.assignedTo === userId);
    }
    return vehicles;
  },
  getVehicle: async (id: string) => {
    await sleep(LATENCY);
    return vehicles.find(v => v.id === id) || null;
  },
  saveVehicle: async (vehicle: Omit<Vehicle, 'id'> | Vehicle) => {
    await sleep(LATENCY);
    
    // History Logic
    const historyEntry: VehicleHistory = {
        id: `h${Date.now()}`,
        date: new Date().toISOString(),
        action: 'Modificación',
        user: 'Admin/Gestor', // Mock user
        details: 'Actualización de datos del vehículo'
    };

    if ('id' in vehicle && vehicle.id) {
        const index = vehicles.findIndex(v => v.id === vehicle.id);
        if (index > -1) {
            const existing = vehicles[index];
            vehicles[index] = {
                ...vehicle,
                history: [...(existing.history || []), historyEntry]
            } as Vehicle;
            return vehicles[index];
        }
    } else {
        const newVehicle = { 
            ...vehicle, 
            id: String(Date.now()),
            history: [{...historyEntry, action: 'Creación', details: 'Alta de vehículo'}] 
        } as Vehicle;
        vehicles.push(newVehicle);
        return newVehicle;
    }
    return null;
  },
  
  // Users
  getUsers: async () => {
    await sleep(LATENCY);
    return users;
  },
  getUser: async (id: string) => {
    await sleep(LATENCY);
    return users.find(u => u.id === id) || null;
  },
  saveUser: async (user: Omit<User, 'id'> | User) => {
      await sleep(LATENCY);
      if('id' in user && user.id) {
          const index = users.findIndex(u => u.id === user.id);
          if(index > -1) {
              // Preserve existing password if not provided in update
              const existingUser = users[index];
              users[index] = { 
                  ...user, 
                  password: user.password || existingUser.password 
              } as User;
              return users[index];
          }
      } else {
          // New user
          const newUser = { 
              ...user, 
              id: `u${Date.now()}`,
              password: user.password || '123456' // Default password if none provided
          } as User;
          users.push(newUser);
          return newUser;
      }
      return null;
  },
  deleteUser: async (id: string) => {
    await sleep(LATENCY);
    users = users.filter(u => u.id !== id);
    return true;
  },

  // Dashboard
  getDashboardData: async () => {
    await sleep(LATENCY);
    
    // Generate dynamic alerts from data
    const dynamicAlerts = generateAllProactiveAlerts();
    
    // Combine with static runtime alerts, avoiding duplicates if ID matches (simple merge)
    const allAlerts = [...runtimeAlerts.filter(ra => !dynamicAlerts.find(da => da.id === ra.id)), ...dynamicAlerts];

    const upcomingAlerts = allAlerts
        .filter(a => !a.seen)
        .sort((a, b) => {
            // High urgency first
            if (a.urgency === 'high' && b.urgency !== 'high') return -1;
            if (a.urgency !== 'high' && b.urgency === 'high') return 1;

            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            const valA = isNaN(dateA) ? Number.MAX_VALUE : dateA;
            const valB = isNaN(dateB) ? Number.MAX_VALUE : dateB;
            return valA - valB;
        })
        .slice(0, 5); // Show top 5
    
    const recentIncidents = incidents
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
        
    const recentVehicles = vehicles.slice(-3);

    return {
      totalVehicles: vehicles.length,
      totalWorkers: users.length,
      pendingAlerts: allAlerts.filter(a => !a.seen).length,
      upcomingAlerts,
      recentIncidents,
      recentVehicles
    };
  },
  
  getProactiveVehicleAlerts: async () => {
      return generateAllProactiveAlerts().filter(a => a.relatedEntity === 'Vehículo');
  },

  markAlertAsSeen: async (alertId: string) => {
      await sleep(LATENCY);
      const idx = runtimeAlerts.findIndex(a => a.id === alertId);
      if (idx > -1) {
          runtimeAlerts[idx].seen = true;
      } else {
          const dynamicAlerts = generateAllProactiveAlerts();
          const target = dynamicAlerts.find(a => a.id === alertId);
          if (target) {
              target.seen = true;
              runtimeAlerts.push(target);
          }
      }
      return true;
  },

  getIncidents: async () => {
    await sleep(LATENCY);
    return incidents;
  },
  saveIncident: async (incident: Omit<Incident, 'id'> | Incident) => {
    await sleep(LATENCY);
    let savedIncident: Incident;

    if('id' in incident && incident.id) {
        const index = incidents.findIndex(i => i.id === incident.id);
        if(index > -1) {
            incidents[index] = incident as Incident;
            savedIncident = incidents[index];
        } else {
            return null;
        }
    } else {
        const newIncident = { ...incident, id: `i${Date.now()}` } as Incident;
        incidents.push(newIncident);
        savedIncident = newIncident;
    }

    // Log to Vehicle History
    const vIndex = vehicles.findIndex(v => v.id === savedIncident.vehicleId);
    if (vIndex > -1) {
        const historyEntry: VehicleHistory = {
            id: `h_inc_${Date.now()}`,
            date: savedIncident.date || new Date().toISOString(),
            action: 'Incidencia',
            user: savedIncident.reportedBy,
            details: `Incidencia reportada: ${savedIncident.description} (${savedIncident.status})`
        };
        vehicles[vIndex].history = [...(vehicles[vIndex].history || []), historyEntry];
    }

    return savedIncident;
  },
  deleteIncident: async (id: string) => {
    await sleep(LATENCY);
    incidents = incidents.filter(i => i.id !== id);
    return true;
  },

  // ERP APIs
  getClients: async () => {
    await sleep(LATENCY);
    return clients;
  },
  saveClient: async (client: Omit<Client, 'id'> | Client) => {
    await sleep(LATENCY);
    if('id' in client && client.id) {
      const index = clients.findIndex(c => c.id === client.id);
      if(index > -1) {
        clients[index] = client as Client;
        return clients[index];
      }
    } else {
      const newClient = { ...client, id: `c${Date.now()}` } as Client;
      clients.push(newClient);
      return newClient;
    }
    return null;
  },
  deleteClient: async (id: string) => {
    await sleep(LATENCY);
    clients = clients.filter(c => c.id !== id);
    return true;
  },

  getSuppliers: async () => {
    await sleep(LATENCY);
    return suppliers;
  },
  saveSupplier: async (supplier: Omit<Supplier, 'id'> | Supplier) => {
    await sleep(LATENCY);
    if('id' in supplier && supplier.id) {
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if(index > -1) {
        suppliers[index] = supplier as Supplier;
        return suppliers[index];
      }
    } else {
      const newSupplier = { ...supplier, id: `s${Date.now()}` } as Supplier;
      suppliers.push(newSupplier);
      return newSupplier;
    }
    return null;
  },
  deleteSupplier: async (id: string) => {
    await sleep(LATENCY);
    suppliers = suppliers.filter(s => s.id !== id);
    return true;
  },
  
  getErpFiles: async (category: ERPFileCategory) => {
      await sleep(LATENCY);
      return erpFiles.filter(f => f.category === category);
  },
  saveErpFile: async (fileData: Omit<ERPFile, 'id'>) => {
      await sleep(LATENCY);
      const newFile = { ...fileData, id: `f${Date.now()}` } as ERPFile;
      erpFiles.push(newFile);
      return newFile;
  },
  deleteErpFile: async (id: string) => {
      await sleep(LATENCY);
      erpFiles = erpFiles.filter(f => f.id !== id);
      return true;
  },
  
  // Shift Planning APIs
  getShifts: async (userId?: string) => {
    await sleep(LATENCY);
    if (userId) {
        return shifts.filter(s => s.userId === userId);
    }
    return shifts;
  },
  saveShift: async (shift: Omit<Shift, 'id'> | Shift): Promise<{ success: boolean; message?: string, shift?: Shift }> => {
    await sleep(LATENCY);
    const newStart = new Date(shift.start).getTime();
    const newEnd = new Date(shift.end).getTime();

    // Conflict detection
    const hasConflict = shifts.some(existingShift => {
        if ('id' in shift && existingShift.id === shift.id) {
            return false;
        }
        if (existingShift.userId !== shift.userId) {
            return false;
        }
        const existingStart = new Date(existingShift.start).getTime();
        const existingEnd = new Date(existingShift.end).getTime();
        return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
        return { success: false, message: 'Conflicto de turno: El usuario ya tiene un turno asignado en este horario.' };
    }

    if('id' in shift && shift.id) {
        const index = shifts.findIndex(s => s.id === shift.id);
        if(index > -1) {
            shifts[index] = shift as Shift;
            return { success: true, shift: shifts[index] };
        }
    } else {
        const newShift = { ...shift, id: `sh${Date.now()}` } as Shift;
        shifts.push(newShift);
        return { success: true, shift: newShift };
    }
    return { success: false, message: 'No se pudo guardar el turno.' };
  },
  deleteShift: async (id: string) => {
    await sleep(LATENCY);
    shifts = shifts.filter(s => s.id !== id);
    return true;
  },

    // Medical Inventory APIs
  getMedicalSupplies: async () => {
    await sleep(LATENCY);
    return medicalSupplies;
  },
  saveMedicalSupply: async (supply: Omit<MedicalSupply, 'id'> | MedicalSupply) => {
    await sleep(LATENCY);
    if ('id' in supply && supply.id) {
        const index = medicalSupplies.findIndex(s => s.id === supply.id);
        if (index > -1) {
            medicalSupplies[index] = supply as MedicalSupply;
            return medicalSupplies[index];
        }
    } else {
        const newSupply = { ...supply, id: `ms${Date.now()}` } as MedicalSupply;
        medicalSupplies.push(newSupply);
        return newSupply;
    }
    return null;
  },
  deleteMedicalSupply: async (id: string) => {
    await sleep(LATENCY);
    medicalSupplies = medicalSupplies.filter(s => s.id !== id);
    return true;
  },

  // Interest Data
  getInterestData: async () => {
      await sleep(LATENCY);
      return interestData;
  },
  saveInterestData: async (data: Omit<InterestData, 'id'> | InterestData) => {
      await sleep(LATENCY);
       if('id' in data && data.id) {
        const index = interestData.findIndex(i => i.id === data.id);
        if(index > -1) {
            interestData[index] = data as InterestData;
            return interestData[index];
        }
    } else {
        const newData = { ...data, id: `id${Date.now()}` } as InterestData;
        interestData.push(newData);
        return newData;
    }
    return null;
  },
  
  // Fuel API
  getFuelLogs: async (vehicleId?: string) => {
      await sleep(LATENCY);
      if (vehicleId) {
          return fuelLogs.filter(l => l.vehicleId === vehicleId);
      }
      return fuelLogs;
  },
  saveFuelLog: async (log: Omit<FuelLog, 'id'> | FuelLog) => {
      await sleep(LATENCY);
      if ('id' in log && log.id) {
          const index = fuelLogs.findIndex(l => l.id === log.id);
          if (index > -1) {
              fuelLogs[index] = log as FuelLog;
              return fuelLogs[index];
          }
      } else {
          const newLog = { ...log, id: `fl${Date.now()}` } as FuelLog;
          fuelLogs.push(newLog);
          return newLog;
      }
      return null;
  },
  deleteFuelLog: async (id: string) => {
      await sleep(LATENCY);
      fuelLogs = fuelLogs.filter(l => l.id !== id);
      return true;
  }
};
