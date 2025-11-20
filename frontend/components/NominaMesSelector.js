import React from 'react';

export default function NominaMesSelector({ meses, mesSeleccionado, onChangeMes }) {
  return (
    <div>
      <label htmlFor="mesSelect">Selecciona el mes: </label>
      <select id="mesSelect" value={mesSeleccionado} onChange={e => onChangeMes(e.target.value)}>
        {meses.map(mes => (
          <option key={mes} value={mes}>{mes}</option>
        ))}
      </select>
    </div>
  );
}