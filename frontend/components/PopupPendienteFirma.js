import React from 'react';

export default function PopupPendienteFirma({ pendientes, onCerrar }) {
  if (!pendientes.length) return null;
  return (
    <div className="popup-firma">
      <h3>Documentos pendientes de firma</h3>
      <ul>
        {pendientes.map(nomina =>
          <li key={nomina._id}>
            {nomina.mes} - {nomina.documentoOriginal?.split("/").pop()}
          </li>
        )}
      </ul>
      <button onClick={onCerrar}>Cerrar</button>
    </div>
  );
}