/**
 * Stokk Pluggable API Configuration
 * Supports both standalone LocalStorage mode and .NET 8 Backend Web API mode.
 */

export const API_CONFIG = {
  // .NET 8 Web API endpoint
  baseUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api',
  swaggerUrl: 'http://localhost:5000/swagger',
  
  // Pluggable Mode: 'AUTO' | 'LOCAL_STORAGE' | 'DOTNET_API'
  mode: ((import.meta as any).env?.VITE_DATA_MODE as 'AUTO' | 'LOCAL_STORAGE' | 'DOTNET_API') || 'AUTO',
};

export async function checkBackendConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${API_CONFIG.baseUrl.replace('/api', '')}/`, { method: 'GET' });
    return res.ok;
  } catch (e) {
    return false;
  }
}
