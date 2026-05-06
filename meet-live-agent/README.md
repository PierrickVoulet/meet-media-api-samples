# Meet Live Agent - Multimodal AI in Google Meet

This sample project demonstrates how to integrate Google Meet with Gemini Live to create a multimodal AI agent that can participate in a meeting. The agent can listen to participants, see the meeting video, and respond in real-time with audio. It also provides live transcription and scene description in the Meet side panel.

> [!NOTE]
> The Google Meet Add-on SDK, the Meet Media API, and the Gemini Live model `gemini-3.1-flash-live-preview` are all currently in preview. You need to request access to the [Google Workspace Developer Preview Program (DPP)](https://developers.google.com/workspace/preview-program).

## Design Overview

The application consists of a frontend built with Lit web components and a Node.js backend.

-   **Frontend**: Uses the `@googleworkspace/meet-addons` SDK to integrate with Google Meet and the `@google/genai` SDK to connect to Gemini Live. It captures audio and video from the meeting via the Meet Media API and streams it to Gemini.
-   **Backend**: An Express server that serves the static frontend files and acts as a secure reverse proxy for Gemini API calls (both HTTP and WebSockets). This allows the application to use the Gemini API without exposing the API key in the browser. It automatically injects an interceptor script to route SDK calls through the proxy.

## Main Features

-   **Real-time Bidirectional Audio**: Speak to Gemini and hear it respond in real-time within the meeting.
-   **Visual Grounding**: The agent receives video frames from the meeting, allowing it to "see" and comment on what's happening.
-   **Live Transcription**: Displays transcripts of what participants say and what Gemini says.
-   **Scene Description**: Periodically generates a description of the visual scene using `gemini-2.5-flash`.
-   **Secure Proxy**: Protects your Gemini API key by routing requests through the backend.

## Prerequisites

Before you begin, ensure you have:

1.  **Google Cloud Project**: A project with billing enabled that has been granted access to the Meet Media API Developer Preview Program (DPP).
2.  **gcloud CLI**: Installed and authenticated. [Install guide](https://cloud.google.com/sdk/docs/install).
3.  **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).
4.  **Google Workspace Account**: With permissions to create and use Meet Add-ons.

---

## Deployment Instructions

Follow these steps to deploy the Meet Live Agent as a Google Meet add-on.

### 1. Enable Required APIs
 
 Enable the necessary Google Cloud APIs using the command line:
 
 ```bash
 gcloud services enable meet.googleapis.com \
                        artifactregistry.googleapis.com \
                        run.googleapis.com \
                        cloudbuild.googleapis.com \
                        appsmarket.googleapis.com \
                        workspaceaddons.googleapis.com
 ```

### 2. Configure OAuth Consent Screen

Before creating the client ID, you need to configure the OAuth consent screen (branding):

1.  Go to the **APIs & Services > OAuth consent screen** page in the Google Cloud Console.
2.  Select **Internal** for the User Type (this is sufficient for testing within your organization).
3.  Fill in the required app information (App name, User support email, Developer contact information).
4.  In the **Scopes** step, add the following scopes required by the Meet Media API:
    *   `https://www.googleapis.com/auth/meetings.space.readonly`
    *   `https://www.googleapis.com/auth/meetings.conference.media.readonly`
5.  Complete the wizard and save.

### 3. Initialize OAuth 2.0 Client

To allow the add-on to authenticate with the Meet Media API:

1.  Go to the **APIs & Services > Credentials** page in the Google Cloud Console.
2.  Click **Create Credentials > OAuth client ID**.
3.  Select **Web application** as the application type.
4.  Set a name for the credential such as `Meet Live Agent`.
5.  Click **Create** and copy the **Client ID** to your `.env` file.

### 4. Configure Environment Variables

Copy the sample environment file and fill in your details:

```bash
cp sample.env .env
```

Edit the `.env` file and provide values for:

*   `PROJECT_ID`: Your Google Cloud Project ID.
*   `REGION`: The region to deploy to (e.g., `us-central1`).
*   `GEMINI_API_KEY`: Your Gemini API key from AI Studio.
*   `CLOUD_PROJECT_NUMBER`: Your Google Cloud Project Number (found in Project Settings).
*   `CLIENT_ID`: Your OAuth 2.0 Client ID (see step 3).

You can use the following commands to retrieve some of the required values:

```bash
# Get Project ID
gcloud config get-value project

# Get Project Number
gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"
```

### 5. Deploy to Cloud Run

Run the provided deployment script. This script builds the Docker image and deploys it to Cloud Run, passing the environment variables securely.

```bash
chmod +x deploy.sh
./deploy.sh
```

### 6. Update OAuth Redirect URIs

1.  Once the deployment completes, the script will output the URL of your Cloud Run service.
2.  Copy this URL.
3.  Go back to the **APIs & Services > Credentials** page in the Google Cloud Console.
4.  Edit the OAuth client you initialized in Step 3.
5.  Add the Cloud Run URL to the **Authorized JavaScript origins** list.
6.  Save the changes.

### 7. Configure Google Workspace Add-on and Marketplace SDK
 
 To make the app appear in Google Meet, you need to configure both the Workspace Add-on deployment and the Marketplace SDK.
 
 #### 7.1 Configure Google Workspace Add-on (HTTP Deployment)
 
 1.  Open the `deployment.json` file in the root of the project.
 2.  Update the `addOnOrigins` and `sidePanelUrl` fields, replacing the placeholder `https://YOUR_CLOUD_RUN_URL` with your actual Cloud Run service URL (obtained in Step 5).
 3.  Go to the **Google Workspace Add-ons** page in the Google Cloud Console.
 4.  Click **Create** or **New Deployment**.
 5.  You will be asked to provide the deployment manifest. Paste the entire content of your modified `deployment.json` file.
 6.  Save the deployment.
 7.  Copy the **Deployment ID** generated for this deployment.
 
 #### 7.2 Configure Google Workspace Marketplace SDK
 
 1.  Go to the **APIs & Services > Enabled APIs & Services** page in the Google Cloud Console.
 2.  Search for and click on **Google Workspace Marketplace SDK**.
 3.  Click on the **App Configuration** tab.
 4.  Fill in the required fields:
     *   **App Visibility**: Select **Private** (and choose your domain) for testing.
     *   **Installation Type**: Select **Individual installation**.
 5.  Scroll down to the **Extensions** section.
 6.  Check the box for **Google Workspace Add-on**.
 7.  In the field that appears, paste the **Deployment ID** you copied in step 7.1.
 8.  Save the configuration.

## Testing the Add-on in Google Meet

After completing the deployment and configuration, you can test the add-on in a live meeting:

1.  Go to [Google Meet](https://meet.google.com) and start a new meeting.
2.  Click on the **Activities** icon (shapes icon) in the bottom right corner.
3.  You should see your add-on (e.g., "Meet Live Agent") listed under your Activities.
4.  Click on it to open the side panel.
5.  Click **Connect to Meet Media API** to start the agent.
6.  You may need to grant permissions for the add-on to access your media if prompted.
