import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { dismissMeetSpinner } from '@webmcp/meet-addon-loader';

dismissMeetSpinner(process.env.CLOUD_PROJECT_NUMBER);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
