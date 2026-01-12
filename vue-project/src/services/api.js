export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

export const STRAPI_URL = API_URL.replace('/api', '');