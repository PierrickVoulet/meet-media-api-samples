#!/bin/bash
set -e

# Load environment settings from root .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$PROJECT_ID" ] || [ -z "$GEMINI_API_KEY" ] || [ -z "$CLOUD_PROJECT_NUMBER" ] || [ -z "$CLIENT_ID" ]; then
  echo "Error: Missing PROJECT_ID, GEMINI_API_KEY, CLOUD_PROJECT_NUMBER, or CLIENT_ID in environment or .env file."
  exit 1
fi

REGION=${REGION:-us-central1}

echo "================================================================================"
echo "  DEPLOYING MEET ADD-ON PROXY SERVER TO CLOUD RUN"
echo "================================================================================"

# Navigate to agent-client to deploy the companion container to Cloud Run
cd agent-client
cp ../.env .env.production

gcloud run deploy webmcp-meet-addon \
  --source . \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 3 \
  --memory 2Gi \
  --cpu 2000m \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,CLIENT_ID=$CLIENT_ID,CLOUD_PROJECT_NUMBER=$CLOUD_PROJECT_NUMBER,DEFAULT_BOARD_URL=$DEFAULT_BOARD_URL" \
  --clear-base-image \
  --port 3000

# Delete the temporary build time environment file
rm -f .env.production

# Get the public Meet Add-on URL
ADDON_URL=$(gcloud run services describe webmcp-meet-addon --project "$PROJECT_ID" --region "$REGION" --format="value(status.url)")
echo "================================================================================"
echo "  [Success] Public Meet Add-on Service available at: $ADDON_URL"
echo "  Update your OAuth Origins in Console and sidePanelUrl in deployment.json."
echo "================================================================================"
cd ..
