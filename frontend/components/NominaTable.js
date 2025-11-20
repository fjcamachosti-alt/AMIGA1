import React from 'react';

export default function NominaTable({
  nominas,
  onDescargar,
  onSubirFirmada,
  userId
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Empleado</th>
          <th>Mes</th>
          <th>Documento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {nominas.map(nomina => (
          <tr key={nomina._id}>
            <td>{nomina.empleadoNombre}</td>
            <td>{nomina.mes}</td>
            <td>{nomina.estado === "firmada"
                  ? nomina.documentoFirmado?.split("/").pop()
                  : nomina.documentoOriginal?.split("/").pop()}</td>
            <td>
              {nomina.estado === "firmada" ? (
                <span style={{color: "green"}}>Firmada</span>
              ) : (
                <span style={{color: "red"}}>Pendiente de firma</span>
              )}
            </td>
            <td>
              <button onClick={() => onDescargar(nomina._id)}>Descargar</button>
              {nomina.estado === "pendiente" && nomina.empleadoId === userId && (
                <>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{display: "inline-block", marginLeft: "8px"}}
                    onChange={e => onSubirFirmada(nomina._id, e.target.files[0])}
                  />
                </>
              )}
              {nomina.estado === "firmada" && (
                <span>PDF firmado disponible</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}