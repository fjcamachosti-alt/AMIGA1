
import React, { useEffect, useState } from 'react';
import { User, Shift, Vehicle, UserDocument } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface MyProfileProps {
    user: User;
}

const docTypes = {
    obligatorios: ['CV', 'DNI', 'Foto', 'Títulos', 'Certificado Penales', 'Certificado Delitos Sexuales', 'PRL Art. 17', 'PRL Art. 18', 'PRL Art. 19', 'Acto Médico'],
    laborales: ['Alta SS', 'IDC', 'Contrato de Trabajo', 'Comunicación Contrato', 'Certificado Empresa', 'Carta Preaviso', 'Finiquito'],
    adicionales: ['Varios1', 'Varios2', 'Varios3', 'Varios4', 'Varios5'],
    nominas: ['Nómina Enero', 'Nómina Febrero', 'Nómina Marzo', 'Nómina Abril', 'Nómina Mayo', 'Nómina Junio', 'Nómina Julio', 'Nómina Agosto', 'Nómina Septiembre', 'Nómina Octubre', 'Nómina Noviembre', 'Nómina Diciembre']
};

export const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [myShifts, setMyShifts] = useState<Shift[]>([]);
    const [assignedVehicles, setAssignedVehicles] = useState<Vehicle[]>([]);
    const [activeTab, setActiveTab] = useState('datos');
    const [formData, setFormData] = useState<User>(user);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [shifts, vehicles] = await Promise.all([
                api.getShifts(user.id),
                api.getVehicles(user.id)
            ]);
            setMyShifts(shifts);
            setAssignedVehicles(vehicles);
            setFormData(user); // Sync local state
            setLoading(false);
            setTimeout(() => window.lucide?.createIcons(), 0);
        };
        fetchData();
    }, [user.id, user]);

    const handleDownloadPayroll = (month: string) => {
        alert(`Simulación: Descargando nómina de ${month} para ${user.nombre} ${user.primerApellido}`);
    };
    
    const handleFileChange = (category: keyof typeof docTypes, name: string, file: File) => {
        const newDoc: UserDocument = { name, file: file.name, uploadDate: new Date().toISOString().split('T')[0] };
        
        let key: keyof User;
        if (category === 'obligatorios') key = 'documentosObligatorios';
        else if (category === 'laborales') key = 'documentosLaborales';
        else if (category === 'nominas') key = 'nominas';
        else key = 'documentosAdicionales';
    
        const docs = formData[key] || [];
        const updatedDocs = [...docs.filter(d => d.name !== name), newDoc];
        
        const updatedUser = { ...formData, [key]: updatedDocs };
        setFormData(updatedUser);
        
        // In a real app, we would upload immediately or save the user state via API here
        api.saveUser(updatedUser).then(() => {
            alert(`Documento "${name}" actualizado correctamente.`);
        });
    };

    const renderDocumentUploads = (category: keyof typeof docTypes) => {
          let key: keyof User;
          if (category === 'obligatorios') key = 'documentosObligatorios';
          else if (category === 'laborales') key = 'documentosLaborales';
          else if (category === 'nominas') key = 'nominas';
          else key = 'documentosAdicionales';
          
          const docs = formData[key] || [];
          return docTypes[category].map(docName => (
              <div key={docName} className="flex items-center justify-between gap-4 border-b border-gray-700 py-2">
                  <label className="text-sm text-gray-300">{docName}</label>
                  {docs.find(d => d.name === docName) ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                          <i data-lucide="check-circle" className="h-4 w-4"></i>
                          <span>Cargado</span>
                          <span className="text-xs text-gray-500">({docs.find(d => d.name === docName)?.uploadDate})</span>
                      </div>
                  ) : (
                    <input 
                        type="file" 
                        onChange={(e) => e.target.files && handleFileChange(category, docName, e.target.files[0])}
                        className="text-sm text-gray-400 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600"
                    />
                  )}
              </div>
          ));
    }

    if(loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold">
                     {user.nombre.charAt(0)}{user.primerApellido.charAt(0)}
                 </div>
                 <div>
                     <h2 className="text-3xl font-bold">Mi Perfil</h2>
                     <p className="text-gray-400">{user.puesto} - {user.rol}</p>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Personal Info & Shifts */}
                <div className="space-y-6">
                    <Card title="Datos Personales">
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Nombre Completo:</span>
                                <span>{user.nombre} {user.primerApellido} {user.segundoApellido}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Email:</span>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Teléfono:</span>
                                <span>{user.telefono}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">DNI:</span>
                                <span>{user.dni || 'No registrado'}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Mis Turnos">
                        {myShifts.length === 0 ? <p className="text-gray-500">No tienes turnos asignados próximamente.</p> : (
                            <ul className="space-y-2">
                                {myShifts.map(shift => (
                                    <li key={shift.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                                        <span>{new Date(shift.start).toLocaleDateString()}</span>
                                        <span className="text-gray-300 text-sm">
                                            {new Date(shift.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                            {new Date(shift.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    
                    {/* Assigned Vehicles (Techs only) */}
                    {assignedVehicles.length > 0 && (
                        <Card title="Vehículos Asignados">
                            <ul className="space-y-2">
                                {assignedVehicles.map(v => (
                                    <li key={v.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <i data-lucide="ambulance" className="text-primary"></i>
                                            <div>
                                                <p className="font-bold">{v.matricula}</p>
                                                <p className="text-xs text-gray-400">{v.marca} {v.modelo}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">{v.estado}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                {/* Right Column: Documentation Management */}
                <Card title="Adjuntar/Actualizar Documentación">
                    <div className="mb-4 border-b border-gray-700">
                         <nav className="-mb-px flex space-x-4 overflow-x-auto">
                             {[
                                 { id: 'doc_obligatoria', label: 'Obligatoria' },
                                 { id: 'doc_laboral', label: 'Laboral' },
                                 { id: 'nominas', label: 'Nóminas' },
                                 { id: 'doc_adicional', label: 'Adicional' },
                             ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                             ))}
                         </nav>
                    </div>
                    
                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {activeTab === 'doc_obligatoria' && renderDocumentUploads('obligatorios')}
                        {activeTab === 'doc_laboral' && renderDocumentUploads('laborales')}
                        {activeTab === 'nominas' && renderDocumentUploads('nominas')}
                        {activeTab === 'doc_adicional' && renderDocumentUploads('adicionales')}
                    </div>
                </Card>
            </div>
        </div>
    );
};
