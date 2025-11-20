const mongoose = require('mongoose');

const NominaSchema = new mongoose.Schema({
  empleadoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empleado',
    required: true
  },
  empleadoNombre: {
    type: String,
    required: true
  },
  mes: {
    type: String, // Formato: YYYY-MM
    required: true
  },
  documentoOriginal: {
    type: String, // Ruta al PDF original
    required: true
  },
  documentoFirmado: {
    type: String, // Ruta al PDF firmado
    default: ""
  },
  estado: {
    type: String,
    enum: ['pendiente', 'firmada'],
    default: 'pendiente'
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  fechaFirma: Date
});

module.exports = mongoose.model('Nomina', NominaSchema);