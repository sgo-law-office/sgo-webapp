import { store } from 'store/store';

export const loadingRequestInterceptor = async (config) => {
    document.body.classList.add('loading-indicator');
    return config;
}

export const loadingRequestInterceptorOnError = async (error) => {
    document.body.classList.remove('loading-indicator');
    return Promise.reject(error);
}

export const loadingResponseInterceptor = async (response) => {
    document.body.classList.remove('loading-indicator');
    return response;
}

export const loadingResponseInterceptorOnError = async (error) => {
    document.body.classList.remove('loading-indicator');
    return Promise.reject(error);
}
