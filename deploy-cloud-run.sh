#!/bin/bash
set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="wishlist-app"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed."
    echo "   Please install it: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Project ID is set
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    echo "❌ Error: No Google Cloud Project ID found."
    echo "   Please run: gcloud config set project [YOUR_PROJECT_ID]"
    exit 1
fi

IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🔧 Building and deploying to Google Cloud Run..."
echo "   Project: ${PROJECT_ID}"
echo "   Region: ${REGION}"
echo "   Service: ${SERVICE_NAME}"
echo "   Image: ${IMAGE_NAME}"

# Supabase Deployment
echo "🗄️  Applying Database Migrations..."
# Force non-interactive mode for CI/CD safety, or remove --debug if not needed.
# Using npx to ensure supabase CLI is available.
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "⚠️  SUPABASE_ACCESS_TOKEN not found. You may be prompted to log in."
fi

npx supabase db push || {
    echo "❌ Database migration failed"
    exit 1
}

echo "⚡ Deploying Edge Functions..."
# Deploy 'server' function. Add --no-verify-jwt as per previous attempts/standard for some setups.
npx supabase functions deploy server --project-ref mlfypfplrgnxgioxndsv --no-verify-jwt || {
    echo "❌ Function deployment failed"
    exit 1
}

# Build and push the container image
echo "📦 Building container image..."
gcloud builds submit --tag "${IMAGE_NAME}" . || {
    echo "❌ Build failed"
    exit 1
}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 || {
      echo "❌ Deployment failed"
      exit 1
  }

echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo "   Service URL: ${SERVICE_URL}"
