#!/bin/bash

# --- Variables de Configuración (Ajustar según tu proyecto) ---
# Reemplaza estas variables con tus datos reales de Google Cloud y Vercel
PROJECT_ID="gen-lang-client-0474588174"
POOL_NAME="vercel-pool"
PROVIDER_NAME="vercel-provider"
SERVICE_ACCOUNT_NAME="vercel-api-handler"
# VERCEL_TEAM_ID="tu-equipo-en-vercel" # Opcional si es cuenta personal

# 1. Crear el Workload Identity Pool
gcloud iam workload-identity-pools create $POOL_NAME \
    --location="global" \
    --display-name="Vercel Identity Pool" \
    --project=$PROJECT_ID

# 2. Crear el Proveedor de Identidad OIDC para Vercel
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --issuer-uri="https://oidc.vercel.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.vercel_project_id=assertion.vercel_project_id" \
    --display-name="Vercel OIDC Provider" \
    --project=$PROJECT_ID

# 3. Crear la Cuenta de Servicio (si no existe)
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="Servicio para Vercel API" \
    --project=$PROJECT_ID

# 4. Vincular la Cuenta de Servicio con el Pool de Identidad
# Esto permite que Vercel actúe como esta cuenta de servicio
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_NAME/*" \
    --project=$PROJECT_ID

echo "Configuración completada con éxito."
echo "IMPORTANTE: Ahora debes otorgar los permisos necesarios (Calendar, Drive) a la cuenta de servicio: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
