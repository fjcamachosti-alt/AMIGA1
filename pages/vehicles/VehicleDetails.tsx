
import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleDocument, User, FuelLog } from '../../types';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui/Spinner';

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

const docTypes = {
    basicos: ['Permiso de Circulación', 'Ficha Técnica', 'Póliza', 'Recibo de Seguro', 'ITV Favorable'],
    especificos: ['Memoria', 'Administrador Poder Sume', 'Certificado Carrocero', 'Contrato de Alquiler', 'Anexo Contrato de Alquiler'],
    adicionales: ['Varios1', 'Varios2', 'Varios3', 'Varios4', 'Varios5'],
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

const DocumentSection: React.FC<{ title: string; documents: VehicleDocument[]; allDocTypes: string[] }> = ({ title, documents, allDocTypes }) => {
    const uploadedDocs = new Map<string, VehicleDocument>(documents.map(d => [d.name, d]));
    
    const getExpirationStatus = (dateStr?: string) => {
        if (!dateStr) {
            return { color: 'bg-green-900 text-green-300 border-green-700', icon: 'check-circle-2', text: 'Vigente' }; 
        }
        const date = new Date(dateStr);
        const now = new Date();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (date < now) return { color: 'bg-red-900 text-red-300 border-red-700', icon: 'alert-octagon', text: 'Caducado' };
        if (date.getTime() - now.getTime() < thirtyDays) return { color: 'bg-yellow-900 text-yellow-300 border-yellow-700', icon: 'alert-triangle', text: 'Expira pronto' };
        
        return { color: 'bg-green-900 text-green-300 border-green-700', icon: 'check-circle-2', text: 'Vigente' };
    };

    return (
        <Card title={title}>
            <ul className="space-y-2">
                {allDocTypes.map(docName => {
                    const doc = uploadedDocs.get(docName);
                    const status = doc ? getExpirationStatus(doc.expirationDate) : null;

                    return (
                        <li key={docName} className="flex justify-between items-center text-sm p-3 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-750 transition-colors">
                            <div className="flex flex-col">
                                <span className="font-medium">{docName}</span>
                                {doc?.expirationDate && (
                                    <span className="text-xs text-gray-500 mt-1">Expira: {new Date(doc.expirationDate).toLocaleDateString()}</span>
                                )}
                            </div>
                            
                            {doc ? (
                                <div className="flex items-center gap-3">
                                     {status && (
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${status.color}`}>
                                            <i data-lucide={status.icon} className="h-3 w-3"></i>
                                            {status.text}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-400 border-l border-gray-600 pl-3">
                                        <i data-lucide="file-text" className="h-4 w-4"></i>
                                        <span className="text-xs font-mono hidden sm:inline-block truncate max-w-[100px]">
                                            {typeof doc.file === 'string' ? doc.file : doc.file?.name}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <i data-lucide="circle" className="h-4 w-4"></i>
                                    <span>Pendiente</span>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
};

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'fuel'>('info');
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        if (vehicle.assignedTo) {
            const user = await api.getUser(vehicle.assignedTo);
            setAssignedUser(user);
        } else {
            setAssignedUser(null);
        }
        const logs = await api.getFuelLogs(vehicle.id);
        setFuelLogs(logs);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };
    fetchData();
  }, [vehicle]);

  useEffect(() => {
      window.lucide?.createIcons();
  }, [activeTab]);

  const renderContent = () => {
      if (activeTab === 'info') {
          return (
            <div className="space-y-6">
                <Card title="Información General">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <DetailItem label="Año" value={vehicle.ano} />
                        <DetailItem 
                            label="Estado" 
                            value={
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vehicle.estado === 'Disponible' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {vehicle.estado}
                                </span>
                            }
                        />
                        <DetailItem label="Visibilidad" value={vehicle.visibilidad} />
                        <DetailItem label="Próxima ITV" value={vehicle.proximaITV} />
                        <DetailItem label="Próxima Revisión" value={`${vehicle.proximaRevision.toLocaleString()} km`} />
                        <DetailItem label="Vencimiento Seguro" value={vehicle.vencimientoSeguro} />
                        <DetailItem label="Técnico Asignado" value={assignedUser ? `${assignedUser.nombre} ${assignedUser.primerApellido}` : 'No asignado'} />
                    </div>
                </Card>
                
                <DocumentSection title="Documentación Básica" documents={vehicle.documentosBasicos || []} allDocTypes={docTypes.basicos} />
                <DocumentSection title="Documentación Específica" documents={vehicle.documentosEspecificos || []} allDocTypes={docTypes.especificos} />
                <DocumentSection title="Documentación Adicional" documents={vehicle.documentosAdicionales || []} allDocTypes={docTypes.adicionales} />
            </div>
          );
      }
      
      if (activeTab === 'history') {
          return (
              <Card title="Historial de Actividad">
                  {!vehicle.history || vehicle.history.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay historial registrado.</p>
                  ) : (
                      <div className="space-y-4 relative border-l border-gray-700 ml-3 pl-6">
                          {vehicle.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                              <div key={entry.id} className="relative mb-6 last:mb-0">
                                  <div className="absolute -left-[31px] top-1 bg-surface border border-gray-700 rounded-full p-1">
                                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                                  </div>
                                  <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-white">{entry.action}</h4>
                                      <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-300 mt-1">{entry.details}</p>
                                  <p className="text-xs text-gray-500 mt-1">Usuario: {entry.user}</p>
                              </div>
                          ))}
                      </div>
                  )}
              </Card>
          );
      }
      
      if (activeTab === 'fuel') {
          return (
              <Card title="Registro de Combustible">
                  {fuelLogs.length === 0 ? (
                       <p className="text-gray-500 text-center py-4">No hay registros de repostaje.</p>
                  ) : (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-gray-400">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Fecha</th>
                                        <th className="p-3">Litros</th>
                                        <th className="p-3">Coste (€)</th>
                                        <th className="p-3">Kilometraje</th>
                                        <th className="p-3 rounded-tr-lg">Responsable</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {fuelLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                        <tr key={log.id} className="hover:bg-gray-800/50">
                                            <td className="p-3">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="p-3 font-mono">{log.liters.toFixed(2)} L</td>
                                            <td className="p-3 font-mono">{log.cost.toFixed(2)} €</td>
                                            <td className="p-3">{log.mileage.toLocaleString()} km</td>
                                            <td className="p-3 text-gray-400">{log.performedBy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                          </table>
                      </div>
                  )}
              </Card>
          );
      }
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-end">
            <div>
                <h3 className="text-3xl font-bold">{vehicle.marca} {vehicle.modelo}</h3>
                <p className="text-lg text-gray-400 font-mono mt-1">{vehicle.matricula}</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'info' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Información
                </button>
                 <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'history' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Historial
                </button>
                 <button 
                    onClick={() => setActiveTab('fuel')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'fuel' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Combustible
                </button>
            </div>
        </div>

        {loading ? <Spinner /> : renderContent()}
    </div>
  );
};
