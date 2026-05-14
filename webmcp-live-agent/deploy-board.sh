#!/bin/bash
set -e

# Load environment settings from root .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID is not set. Please set it in your environment or .env file."
  exit 1
fi

REGION=${REGION:-us-central1}

echo "================================================================================"
echo "  DEPLOYING KANBAN-WEB-APP SAMPLE TO CLOUD RUN"
echo "================================================================================"
# Copy root environment variables so that Vite's compile/build stage inside Cloud Build has access to them
cp .env kanban-web-app/.env.production
cp -r webmcp-client kanban-web-app/webmcp-client
cp -r meet-addon-loader kanban-web-app/meet-addon-loader

cd kanban-web-app
gcloud run deploy webmcp-kanban-board \
  --source . \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --clear-base-image \
  --port 3000

# Get the public Kanban Board URL
KANBAN_BOARD_URL=$(gcloud run services describe webmcp-kanban-board --project "$PROJECT_ID" --region "$REGION" --format="value(status.url)")
echo "================================================================================"
echo "  [Success] Public Kanban Board available at: $KANBAN_BOARD_URL"
echo "================================================================================"
cd ..
# Delete the temporary build time environment files
rm -f kanban-web-app/.env.production
rm -rf kanban-web-app/webmcp-client
rm -rf kanban-web-app/meet-addon-loader
