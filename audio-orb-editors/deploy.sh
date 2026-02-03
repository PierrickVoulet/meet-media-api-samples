#!/bin/bash

# Deploy audio-orb-2 to Cloud Run
# Using source . (Cloud Build will build the Dockerfile)
# Setting GEMINI_API_KEY explicitly to enable server-side proxying

gcloud run deploy audio-orb-editors \
  --source . \
  --region us-west1 \
  --project <your_project_id> \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 3 \
  --memory 1Gi \
  --cpu 1000m \
  --set-env-vars "GEMINI_API_KEY=<your_api_key>" \
  --clear-base-image \
  --port 8080
