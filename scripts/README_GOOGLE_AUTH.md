# Guía de Configuración: Vercel + Google Cloud (Workload Identity)

Esta guía explica cómo configurar las variables de entorno en Vercel para que la aplicación se autentique de forma segura con Google Cloud utilizando el script de **Workload Identity Federation** que creamos.

## 1. Variables de Entorno en Vercel

Debes agregar las siguientes variables en el panel de control de Vercel (**Settings > Environment Variables**):

| Variable | Valor de Ejemplo | Descripción |
| :--- | :--- | :--- |
| `GCP_PROJECT_ID` | `tu-proyecto-id` | El ID de tu proyecto en Google Cloud. |
| `GCP_WORKLOAD_IDENTITY_POOL` | `vercel-pool` | El nombre del Pool creado en el script (paso 1). |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `vercel-provider` | El nombre del Proveedor creado en el script (paso 2). |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `vercel-api-handler@...` | El email de la cuenta de servicio creada (paso 3). |

## 2. Cómo funciona en el Código

El código en `app/api/google-service/route.ts` ya está preparado para usar estas identidades. La librería `google-auth-library` detectará automáticamente la configuración si está presente.

Si prefieres usar una configuración directa sin depender de archivos temporales, puedes actualizar la inicialización así en `route.ts`:

```typescript
// Ejemplo de configuración manual si ADC no detecta automáticamente
const auth = new GoogleAuth({
    projectId: process.env.GCP_PROJECT_ID,
    // La librería manejará el intercambio de tokens de Vercel internamente
    // si detecta que está corriendo en un entorno compatible.
});
```

## 3. Permisos de la Cuenta de Servicio

No olvides que la cuenta de servicio (`vercel-api-handler@...`) necesita permisos explícitos:

1.  **Google Calendar**: Ve a tu calendario personal o de empresa, entra en "Configuración y uso compartido" y agrega el email de la cuenta de servicio con permiso de **"Realizar cambios en eventos"**.
2.  **Google Drive**: Si necesitas subir archivos, comparte la carpeta de destino con el email de la cuenta de servicio.

## 4. Notas de Seguridad

*   **Sin Keys JSON**: Con este método, NO necesitas descargar ningún archivo `.json` de Google Cloud. Esto es mucho más seguro ya que no hay "secretos" que se puedan filtrar en el código o en los logs.
*   **OIDC**: Vercel genera un token de identidad firmado que Google valida directamente.
