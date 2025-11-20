
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserDocument, UserPermissions } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface UserFormProps {
  user: User | null;
  onSave: (user: User) => void;
  onCancel: () => void;
  isAccountManagement?: boolean;
}

const docTypes = {
    obligatorios: ['CV', 'DNI', 'Foto', 'Títulos', 'Certificado Penales', 'Certificado Delitos Sexuales', 'PRL Art. 17', 'PRL Art. 18', 'PRL Art. 19', 'Acto Médico'],
    laborales: ['Alta SS', 'IDC', 'Contrato de Trabajo', 'Comunicación Contrato', 'Certificado Empresa', 'Carta Preaviso', 'Finiquito'],
    adicionales: ['Varios1', 'Varios2', 'Varios3', 'Varios4', 'Varios5'],
    nominas: ['Nómina Enero', 'Nómina Febrero', 'Nómina Marzo', 'Nómina Abril', 'Nómina Mayo', 'Nómina Junio', 'Nómina Julio', 'Nómina Agosto', 'Nómina Septiembre', 'Nómina Octubre', 'Nómina Noviembre', 'Nómina Diciembre']
};

export const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isAccountManagement = false }) => {
  const [activeTab, setActiveTab] = useState('datos');
  const [formData, setFormData] = useState<Partial<User>>(user || { activo: true, rol: UserRole.Tecnico });
  const [password, setPassword] = useState('');

  useEffect(() => {
    setFormData(user || { activo: true, rol: UserRole.Tecnico });
    setPassword(''); // Reset password on form open
     setTimeout(() => window.lucide?.createIcons(), 0);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checkedValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ ...prev, [name]: isCheckbox ? checkedValue : value }));
  };
  
  const handlePermissionChange = (perm: keyof UserPermissions) => {
      const currentPerms = formData.permissions || { vehicles: false, employees: false, erp: false, operations: false };
      setFormData(prev => ({
          ...prev,
          permissions: {
              ...currentPerms,
              [perm]: !currentPerms[perm]
          }
      }));
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
    
    setFormData(prev => ({ ...prev, [key]: updatedDocs }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userToSave = { ...formData };
    if (password) {
        userToSave.password = password;
    }
    // Clean permissions if not Office
    if (userToSave.rol !== UserRole.Oficina) {
        delete userToSave.permissions;
    } else if (!userToSave.permissions) {
        // Default permissions for office if none set
        userToSave.permissions = { vehicles: false, employees: false, erp: false, operations: false };
    }
    onSave(userToSave as User);
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
              <label className="text-sm">{docName}</label>
              {docs.find(d => d.name === docName) ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                      <i data-lucide="check-circle" className="h-4 w-4"></i>
                      <span>Cargado</span>
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

  const tabs = [
      { id: 'datos', label: 'Datos Personales' },
      { id: 'doc_obligatoria', label: 'Doc. Obligatoria' },
      { id: 'doc_laboral', label: 'Doc. Laboral' },
      { id: 'nominas', label: 'Nóminas' },
      { id: 'doc_adicional', label: 'Doc. Adicional' },
  ];

  const accountTabs = [{ id: 'datos', label: 'Datos de Acceso' }];
  const currentTabs = isAccountManagement ? accountTabs : tabs;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {currentTabs.map(tab => (
                  <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
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

      <div className={activeTab === 'datos' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
            {!isAccountManagement && <Input label="Segundo Nombre" name="segundoNombre" value={formData.segundoNombre || ''} onChange={handleChange} />}
            <Input label="Primer Apellido" name="primerApellido" value={formData.primerApellido || ''} onChange={handleChange} required />
            {!isAccountManagement && <Input label="Segundo Apellido" name="segundoApellido" value={formData.segundoApellido || ''} onChange={handleChange} required />}
            {!isAccountManagement && <Input label="Apodo" name="apodo" value={formData.apodo || ''} onChange={handleChange} />}
            
            <div className="bg-gray-800 p-3 rounded border border-gray-600 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="col-span-1 md:col-span-2 text-sm text-primary font-semibold">Credenciales de Acceso</p>
                <Input label="Email (Usuario de acceso)" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                <Input 
                    label="Contraseña" 
                    name="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={user ? "Dejar en blanco para mantener actual" : "Asignar contraseña"} 
                    required={!user} 
                />
            </div>

            <Input label="Teléfono" name="telefono" value={formData.telefono || ''} onChange={handleChange} required />
            {!isAccountManagement && <Input label="DNI" name="dni" value={formData.dni || ''} onChange={handleChange} />}
            {!isAccountManagement && <Input label="Nº Afiliación SS" name="numeroAfiliacionSS" value={formData.numeroAfiliacionSS || ''} onChange={handleChange} />}
            {!isAccountManagement && <Input label="Cuenta Bancaria" name="cuentaBancaria" value={formData.cuentaBancaria || ''} onChange={handleChange} />}
            <Input label="Puesto de Trabajo" name="puesto" value={formData.puesto || ''} onChange={handleChange} />
            {!isAccountManagement && <Input label="Fecha Contratación" name="fechaContratacion" type="date" value={formData.fechaContratacion || ''} onChange={handleChange} required />}
            {!isAccountManagement && <Input label="Fecha Fin Contrato" name="finContrato" type="date" value={formData.finContrato || ''} onChange={handleChange} />}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
                <select name="rol" value={formData.rol || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
             <div className="flex items-center gap-2 pt-8">
                <input type="checkbox" id="activo" name="activo" checked={formData.activo || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="activo" className="text-sm font-medium text-gray-300">Empleado Activo</label>
            </div>
        </div>
        
        {/* Permissions Section - Only for Office Role */}
        {formData.rol === UserRole.Oficina && (
            <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600">
                <h4 className="font-semibold mb-3">Permisos de Acceso (Rol Oficina)</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.permissions?.vehicles || false} onChange={() => handlePermissionChange('vehicles')} className="h-4 w-4 rounded border-gray-300 text-primary" />
                        <label>Acceso a Vehículos</label>
                    </div>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.permissions?.employees || false} onChange={() => handlePermissionChange('employees')} className="h-4 w-4 rounded border-gray-300 text-primary" />
                        <label>Acceso a Empleados</label>
                    </div>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.permissions?.erp || false} onChange={() => handlePermissionChange('erp')} className="h-4 w-4 rounded border-gray-300 text-primary" />
                        <label>Acceso a ERP</label>
                    </div>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.permissions?.operations || false} onChange={() => handlePermissionChange('operations')} className="h-4 w-4 rounded border-gray-300 text-primary" />
                        <label>Acceso a Operaciones</label>
                    </div>
                </div>
            </div>
        )}
      </div>
      
      {!isAccountManagement && <div className={activeTab === 'doc_obligatoria' ? 'block space-y-2' : 'hidden'}>{renderDocumentUploads('obligatorios')}</div>}
      {!isAccountManagement && <div className={activeTab === 'doc_laboral' ? 'block space-y-2' : 'hidden'}>{renderDocumentUploads('laborales')}</div>}
      {!isAccountManagement && <div className={activeTab === 'nominas' ? 'block space-y-2' : 'hidden'}>{renderDocumentUploads('nominas')}</div>}
      {!isAccountManagement && <div className={activeTab === 'doc_adicional' ? 'block space-y-2' : 'hidden'}>{renderDocumentUploads('adicionales')}</div>}


      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};
