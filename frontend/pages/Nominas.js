import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NominaMesSelector from '../components/NominaMesSelector';
import NominaTable from '../components/NominaTable';
import PopupPendienteFirma from '../components/PopupPendienteFirma';

export default function Nominas({ userId }) {
  const [nominasPorMes, setNominasPorMes] = useState({});
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    axios.get('/api/nóminas/mis').then(res => {
      setNominasPorMes(res.data);
      const listaMeses = Object.keys(res.data).sort().reverse();
      setMeses(listaMeses);
      setMesSeleccionado(listaMeses[0] || '');
      let pendientesList = [];
      listaMeses.forEach(m =>
        pendientesList = pendientesList.concat(res.data[m].filter(n => n.estado === "pendiente")));
      setPendientes(pendientesList);
    });
  }, []);

  const handleDescargar = id => {
    axios({
      url: `/api/nóminas/${id}/descargar`,
      method: 'GET',
      responseType: 'blob'
    }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'nomina.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSubirFirmada = (id, file) => {
    const formData = new FormData();
    formData.append('firmada', file);
    axios.post(`/api/nóminas/${id}/firmada`, formData)
      .then(() => window.location.reload());
  };

  const handleCerrarPopup = () => setPendientes([]);

  return (
    <div>
      <h2>Nóminas electrónicas</h2>
      <NominaMesSelector
        meses={meses}
        mesSeleccionado={mesSeleccionado}
        onChangeMes={setMesSeleccionado}
      />

      <NominaTable
        nominas={nominasPorMes[mesSeleccionado] || []}
        onDescargar={handleDescargar}
        onSubirFirmada={handleSubirFirmada}
        userId={userId}
      />

      <PopupPendienteFirma pendientes={pendientes} onCerrar={handleCerrarPopup} />
    </div>
  );
}