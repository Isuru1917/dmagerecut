// Development utility to handle Google Apps Script CORS issues
// This file can be imported to enable using a CORS proxy during local development

/**
 * Apply the CORS proxy to a Google Apps Script URL if in development mode
 * 
 * @param originalUrl The original Google Apps Script URL
 * @returns The proxied URL when in development, original otherwise
 */
export const applyDevCorsProxy = (originalUrl: string): string => {
  // Only apply proxy in development mode
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment && originalUrl.includes('script.google.com')) {
    // Using local CORS proxy server that runs on port 8082
    return `http://localhost:8082/${originalUrl}`;
  }
  
  return originalUrl;
};
