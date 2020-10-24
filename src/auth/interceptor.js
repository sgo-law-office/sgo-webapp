import { authProvider } from "./auth-provider";

export const authRequestInterceptor = async (config) => {
    const data = await authProvider.getIdToken();
    const { idToken } = data;
    return {
        ...config,
        headers: {
            ...config.headers,
            'Authorization': 'Bearer ' + idToken.rawIdToken
        }
    };

    // const idToken = await authProvider.getIdToken();
    // console.log(config, idToken.rawIdToken);

    // if (
    //     !config.url.endsWith('login') ||
    //     !config.url.endsWith('refresh') ||
    //     !config.url.endsWith('signup')
    // ) {
    //     const userTokenExpiration = new Date(await AsyncStorage.getItem('userTokenExpiration'));
    //     const today = new Date();
    //     if (today > userTokenExpiration) {
    //         // refresh the token here
    //         const userRefreshToken = await AsyncStorage.getItem('userRefreshToken');
    //     } else {
    //         const userToken = await AsyncStorage.getItem('userToken');
    //         config.headers.Authorization = `Bearer ${userToken}`;
    //     }
    // }

    return config;
}

export const authRequestInterceptorOnError = async (error) => {
    // I cand handle a request with errors here
    return Promise.reject(error);
}


export const authResponseInterceptor = async (response) => {
    return response;
}

export const authResponseInterceptorOnError = async (error) => {

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
    console.log(error.config);

    if (error.response.status === 403) {
        authProvider.getIdToken().then(data => {
            console.log("403 from response.")
            console.log(data)
            console.log(data.idToken.rawIdToken)
        }).error(console.error);
        // acquireTokenSilent().then(data => {
        //     console.log("TOKEEEEEEEN", data.idToken);
        // })
    }

    // I cand handle a request with errors here
    return Promise.reject(error);
}
