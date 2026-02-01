import { GoogleAuth } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Service API Handler
 * Soporta:
 * - Verificación de Autenticación
 * - Gestión de Carpetas y Cargas en Google Drive
 * - Creación de Eventos en Google Calendar
 */

async function getOrCreateFolder(client: any, folderName: string) {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchResponse = await client.request({ url: searchUrl });
    const files = (searchResponse.data as any).files;

    if (files && files.length > 0) {
        return files[0].id;
    }

    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createResponse = await client.request({
        url: createUrl,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        })
    });

    return (createResponse.data as any).id;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, fileName, content, mimeType = 'text/plain', calendarEvent } = body;

        // 1. Inicializar autenticación
        let auth;
        const scopes = [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        if (process.env.GCP_WORKLOAD_IDENTITY_PROVIDER && process.env.VERCEL_OIDC_TOKEN) {
            auth = new GoogleAuth({
                projectId: process.env.GCP_PROJECT_ID,
                scopes,
                credentials: {
                    type: 'external_account',
                    audience: `//iam.googleapis.com/${process.env.GCP_WORKLOAD_IDENTITY_PROVIDER}`,
                    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
                    token_url: 'https://sts.googleapis.com/v1/token',
                    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
                    credential_source: {
                        url: 'https://www.googleapis.com/not-used',
                    }
                } as any
            });
            (auth as any).getSubjectToken = () => process.env.VERCEL_OIDC_TOKEN;
        } else {
            auth = new GoogleAuth({ scopes });
        }

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();

        // 2. Acción: Guardar en Google Drive
        if (action === 'upload_to_drive') {
            if (!content || !fileName) {
                return NextResponse.json({ error: "Faltan datos: fileName o content" }, { status: 400 });
            }

            const folderId = await getOrCreateFolder(client, '0Facturas Servitec Pro');

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const metadata = {
                name: fileName,
                mimeType: mimeType,
                parents: [folderId]
            };

            const isBase64 = content.includes('base64,') || mimeType === 'application/pdf';
            const cleanContent = content.includes('base64,') ? content.split('base64,')[1] : content;

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + mimeType + (isBase64 ? '\r\nContent-Transfer-Encoding: base64' : '') + '\r\n\r\n' +
                cleanContent +
                close_delim;

            const response = await client.request({
                url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/related; boundary=' + boundary
                },
                body: multipartRequestBody
            });

            return NextResponse.json({
                success: true,
                fileId: (response.data as any).id,
                message: "Archivo guardado en '0Facturas Servitec Pro' correctamente"
            });
        }

        // 3. Acción: Crear evento en Google Calendar
        if (action === 'create_calendar_event') {
            if (!calendarEvent) {
                return NextResponse.json({ error: "Faltan datos del evento" }, { status: 400 });
            }

            const calendarResponse = await client.request({
                url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: calendarEvent.summary,
                    location: calendarEvent.location,
                    description: calendarEvent.description,
                    start: {
                        dateTime: calendarEvent.start,
                        timeZone: 'America/Bogota'
                    },
                    end: {
                        dateTime: calendarEvent.end,
                        timeZone: 'America/Bogota'
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 30 }
                        ]
                    }
                })
            });

            return NextResponse.json({
                success: true,
                eventId: (calendarResponse.data as any).id,
                link: (calendarResponse.data as any).htmlLink,
                message: "Cita programada en Google Calendar"
            });
        }

        // 4. Acción: Listar eventos de Google Calendar
        if (action === 'list_calendar_events') {
            const timeMin = body.timeMin || new Date().toISOString();
            const timeMax = body.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days by default

            const calendarResponse = await client.request({
                url: `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
                method: 'GET'
            });

            return NextResponse.json({
                success: true,
                events: (calendarResponse.data as any).items || []
            });
        }

        // 5. Acción: Eliminar evento
        if (action === 'delete_calendar_event') {
            const { eventId } = body;
            if (!eventId) return NextResponse.json({ error: "Falta eventId" }, { status: 400 });

            await client.request({
                url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
                method: 'DELETE'
            });

            return NextResponse.json({ success: true, message: "Evento eliminado" });
        }

        return NextResponse.json({
            success: true,
            projectId,
            message: "Servicio de Google activo."
        });

    } catch (error: any) {
        console.error("Error en la API de Google:", error);
        return NextResponse.json({
            error: "Fallo en la comunicación con Google API",
            details: error.message
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        status: "active",
        capabilities: ["Drive", "Calendar", "Cloud Platform"]
    });
}
