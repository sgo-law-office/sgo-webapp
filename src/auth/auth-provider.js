// authProvider.js
import { MsalAuthProvider, LoginType } from 'react-aad-msal';

// Msal Configurations
const config = {
    auth: {
        authority: 'https://login.microsoftonline.com/25390568-e018-4472-ac76-f136c4daedfa',
        clientId: '69cb8a6c-d551-4de8-856a-be8d6f12c2a6',
        redirectUri: 'http://localhost:3000'
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    },
    system: {
        loadFrameTimeout: 20000
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
    tokenRefreshUri: 'http://localhost:3000'
}

export const authProvider = new MsalAuthProvider(config, authenticationParameters, options)