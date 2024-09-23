// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState(null);
  const [accessTokenGraph, setAccessTokenGraph] = useState(null);
  const [authError, setAuthError] = useState(null);

  const getAccessToken = async () => {
    if (accounts.length > 0) {
      const request = {
        ...loginRequest,
        account: accounts[0],
      };

      try {
        const response = await instance.acquireTokenSilent(request);
        setAccessToken(response.accessToken);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          try {
            const response = await instance.loginRedirect(request);
            setAccessToken(response.accessToken);
            return response.accessToken;
          } catch (popupError) {
            console.error('Failed to acquire token via popup', popupError);
            setAuthError(popupError);
          }
        } else {
          console.error('Failed to acquire token silently', error);
          setAuthError(error);
        }
        return null;
      }
    }
    return null;
  };
  const getAccessTokenGraph = async () => {
    if (accounts.length > 0) {
      const request = {
        scopes: ['User.Read'],
        account: accounts[0],
      };

      try {
        const response = await instance.acquireTokenSilent(request);
        setAccessTokenGraph(response.accessToken);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          try {
            const response = await instance.loginRedirect(request);
            setAccessTokenGraph(response.accessToken);
            return response.accessToken;
          } catch (popupError) {
            console.error('Failed to acquire token via popup', popupError);
            setAuthError(popupError);
          }
        } else {
          console.error('Failed to acquire token silently', error);
          setAuthError(error);
        }
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    getAccessToken();
    getAccessTokenGraph();
  }, [instance, accounts]);

  return (
    <AuthContext.Provider value={{ accessToken, getAccessToken, getAccessTokenGraph,authError }}>
      {children}
    </AuthContext.Provider>
  );
};
