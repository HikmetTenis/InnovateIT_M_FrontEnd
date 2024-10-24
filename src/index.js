import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import { PublicClientApplication } from '@azure/msal-browser';
import { AuthProvider } from './helpers/authcontext';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { NotificationsProvider } from './helpers/notification-context';
import 'bootstrap/dist/css/bootstrap.min.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
const msalInstance = new PublicClientApplication(msalConfig);

root.render(
  // <React.StrictMode>
  <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </ThemeProvider>
      </AuthProvider>
  </MsalProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
