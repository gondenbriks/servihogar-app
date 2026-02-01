import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Inicializar la autenticación
        let auth;

        // Si estamos en Vercel con Workload Identity configurado
        if (process.env.GCP_WORKLOAD_IDENTITY_PROVIDER && process.env.VERCEL_OIDC_TOKEN) {
            console.log("Detectado entorno Vercel con Workload Identity");
            auth = new google.auth.GoogleAuth({
                projectId: process.env.GCP_PROJECT_ID,
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                credentials: {
                    type: 'external_account',
                    audience: `//iam.googleapis.com/${process.env.GCP_WORKLOAD_IDENTITY_PROVIDER}`,
                    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
                    token_url: 'https://sts.googleapis.com/v1/token',
                    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
                    credential_source: {
                        url: 'https://www.googleapis.com/not-used', // Placeholder obligado por el tipo
                        // En versiones recientes de la librería, podemos pasar el token directamente o usar un fetcher.
                        // Sin embargo, para Vercel es más robusto usar el flujo de intercambio manual o configurar el external account correctamente.
                    }
                } as any
            });

            // Ajuste para la librería: Sobrescribimos el fetcher de tokens para usar el de Vercel
            // Nota: Esto es un patrón avanzado para evitar archivos temporales en Vercel
            (auth as any).getSubjectToken = () => process.env.VERCEL_OIDC_TOKEN;
        } else {
            // Autenticación por defecto (ADC) para local
            auth = new google.auth.GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });
        }

        const authClient = await auth.getClient();
        const projectId = await auth.getProjectId();

        // 2. Ejemplo: Usar una API específica
        const resourcemanager = google.cloudresourcemanager({
            version: 'v3',
            auth: authClient as any,
        });

        const response = await resourcemanager.projects.get({
            name: `projects/${projectId}`,
        });

        // 3. Retornar éxito si la conexión funciona
        return NextResponse.json({
            status: "Conexión Exitosa",
            project: response.data.displayName,
            serviceAccount: (authClient.credentials as any).client_email || "Vercel OIDC Active"
        });

    } catch (error: any) {
        console.error("Error de autenticación:", error.message);

        // Manejo específico para falta de credenciales en local
        if (error.message.includes("Could not load the default credentials")) {
            return NextResponse.json({
                error: "Credenciales de Google no encontradas en este entorno",
                details: error.message,
                instrucciones_fix_local: "Para solucionar esto en tu máquina local, ejecuta este comando en tu terminal y sigue los pasos: gcloud auth application-default login",
                status_produccion: "En Vercel, este error no debería ocurrir si Workload Identity está configurado."
            }, { status: 401 });
        }

        return NextResponse.json(
            { error: "Error al conectar con Google Cloud", details: error.message },
            { status: 500 }
        );
    }
}
