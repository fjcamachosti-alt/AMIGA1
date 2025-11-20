
import { CertificateInfo } from '../types';

// This service mocks the behavior of the official "AutoScript.js" library 
// used to communicate with the local AutoFirma application via WebSocket (localhost:9774)
// or Protocol Handler.

const LATENCY_STEP = 1000; // ms between log steps

export interface AutoFirmaResponse {
    signature: string;
    certificate: CertificateInfo;
    signedFileName: string;
    log: string[];
}

export const AutoFirmaService = {
    
    // Simulate checking if AutoFirma is installed/running
    checkEnvironment: async (onLog: (msg: string) => void): Promise<boolean> => {
        onLog("Inicializando entorno de firma...");
        await new Promise(r => setTimeout(r, LATENCY_STEP / 2));
        
        onLog("Verificando WebSockets en 127.0.0.1:9774...");
        await new Promise(r => setTimeout(r, LATENCY_STEP / 2));
        
        onLog("Conexión establecida con AutoFirma v1.8.2");
        return true;
    },

    // Simulate the signing process
    signDocument: async (
        fileName: string, 
        userName: string, 
        onLog: (msg: string) => void
    ): Promise<AutoFirmaResponse> => {
        
        // 1. Send Document to Local App
        onLog(`Enviando documento "${fileName}" a la aplicación local...`);
        await new Promise(r => setTimeout(r, LATENCY_STEP));
        
        onLog("Calculando hash del documento (SHA-256)...");
        await new Promise(r => setTimeout(r, LATENCY_STEP / 2));
        
        // 2. Invoke AutoFirma User Interaction
        onLog("Esperando selección de certificado y PIN del usuario...");
        onLog("Por favor, complete el proceso en la ventana de AutoFirma.");
        
        // Longer delay to simulate user selecting cert and typing PIN in the external app
        await new Promise(r => setTimeout(r, LATENCY_STEP * 3));
        
        // 3. Generate Mock Certificate Data
        const validFrom = new Date();
        validFrom.setFullYear(validFrom.getFullYear() - 1);
        const validTo = new Date();
        validTo.setFullYear(validTo.getFullYear() + 2);
        
        const mockCert: CertificateInfo = {
            ownerName: userName.toUpperCase(),
            issuerName: 'AC FNMT Usuarios', // Fábrica Nacional de Moneda y Timbre
            serialNumber: generateRandomSerial(),
            validFrom: validFrom.toISOString().split('T')[0],
            validTo: validTo.toISOString().split('T')[0]
        };

        onLog(`Certificado validado: ${mockCert.ownerName}`);
        onLog(`PIN Correcto. Iniciando operación criptográfica...`);
        
        // 4. Generate Mock Signature and New Filename
        await new Promise(r => setTimeout(r, LATENCY_STEP));
        
        const mockSignature = generateMockBase64();
        
        // Generate signed filename: name.ext -> name_firmado.ext
        const lastDotIndex = fileName.lastIndexOf('.');
        let signedFileName = fileName + '_firmado'; // fallback
        if (lastDotIndex !== -1) {
            signedFileName = fileName.substring(0, lastDotIndex) + '_firmado' + fileName.substring(lastDotIndex);
        }
        
        onLog(`Generando archivo firmado: ${signedFileName}`);
        onLog("Recibiendo documento firmado desde AutoFirma...");
        await new Promise(r => setTimeout(r, LATENCY_STEP));

        onLog("Firma completada exitosamente.");

        return {
            signature: mockSignature,
            certificate: mockCert,
            signedFileName: signedFileName,
            log: []
        };
    }
};

// Helper to generate random hex serial
const generateRandomSerial = () => {
    return Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
};

// Helper to generate a long random string mimicking a base64 signature
const generateMockBase64 = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < 128; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + '=';
};
