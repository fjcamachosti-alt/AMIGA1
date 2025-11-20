# Firma Digital de Nóminas - AMIGA1

Este sistema permite que cada empleado descargue, firme manualmente, y suba sus nóminas digitales organizadas por mes mediante certificado FNMT/DNIe. El proceso es seguro, sencillo y totalmente compatible con cualquier dispositivo.

---

## Flujo general del usuario

1. Selecciona el mes en el panel principal.
2. Descarga su nómina PDF pendiente de firma.
3. Firma el PDF usando su certificado con FNMT-RCM FirmaPDF, Adobe Acrobat, o software corporativo.
4. Sube el PDF firmado a la plataforma.
5. Visualiza histórico y copia de nóminas firmadas agrupadas por mes.

---

## Rutas API principales (backend)

- **POST `/api/nóminas/upload`**  
  Subir nómina PDF (admin):  
  Campos: `empleadoId`, `empleadoNombre`, `mes`, archivo PDF.

- **GET `/api/nóminas/:id/descargar`**  
  Descargar nómina PDF original o firmado.

- **POST `/api/nóminas/:id/firmada`**  
  Subir PDF firmado (empleado):  
  Campo archivo: `firmada`.

- **GET `/api/nóminas/mis`**  
  Filtra nóminas del empleado logueado, agrupadas por mes.

- **GET `/api/nóminas/admin?mes=2025-11&estado=firmada`**  
  Consulta nóminas de todos los empleados, filtrables por mes y estado (admin).

---

## Guía rápida para empleados

- Consulta tu histórico y nóminas pendientes por mes.
- Descarga la nómina, firma con tu certificado FNMT/DNIe, y sube el PDF firmado.
- Si tienes dudas consulta la [Guía para firma manual](Guia_FirmaNomina_Manual.md).

---

## Instalación

1. Instala dependencias:
   ```
   npm install
   ```
2. Configura la base de datos y variables necesarias.
3. Inicia el backend y frontend según tus scripts.

---

## Personalización

- Todas las nóminas se agrupan y almacenan por mes.
- Panel visual incluye selector tipo calendario/desplegable y listado por empleado/estado.
