// Use VITE_API_BASE_URL for production (e.g. Render), default to empty string for local dev (which uses Vite proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
console.log('[DEBUG] VITE_API_BASE_URL at build time was:', JSON.stringify(import.meta.env.VITE_API_BASE_URL));
