// authProvider.js
import { MsalAuthProvider, LoginType } from 'react-aad-msal';

import secrets from './config.json';

// Msal Configurations
const config = {
    auth: {
        authority: secrets.authority,
        clientId: secrets.clientId,
        redirectUri: secrets.redirectUri
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    }
};

// Authentication Parameters
const authenticationParameters = {
    scopes: [
        "user.read"
    ]
}

// Options
const options = {
    loginType: LoginType.Redirect,
    tokenRefreshUri: window.location.origin + '/auth.html'
}

export const authProvider = new MsalAuthProvider(config, authenticationParameters, options)
