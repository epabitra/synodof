/**
 * Environment Configuration
 * Validates and exports environment variables
 */

// In Vite, environment variables must be prefixed with VITE_ to be exposed to the client
const requiredEnvVars = ['VITE_API_BASE_URL'];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using fallback values.`
    );
    
    // Don't throw error - use fallback values instead
    if (import.meta.env.MODE === 'production') {
      console.error('Production build missing required environment variables!');
      console.error('Please ensure .env.production file exists with VITE_API_BASE_URL');
    }
  }
};

validateEnv();

export const ENV = {
  // Support both VITE_ prefix (Vite standard) and REACT_APP_ prefix (for compatibility)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
                import.meta.env.REACT_APP_API_BASE_URL || 
                '',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  SITE_NAME: import.meta.env.VITE_SITE_NAME || 
             import.meta.env.REACT_APP_SITE_NAME || 
             'Berhampur Diocesan Synod',
  SITE_URL: import.meta.env.VITE_SITE_URL || 
            import.meta.env.REACT_APP_SITE_URL || 
            'https://www.synodofberhampur.com',
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID || 
                  import.meta.env.REACT_APP_GA_TRACKING_ID || 
                  '',
  ENABLE_ANALYTICS: (import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || 
                     import.meta.env.REACT_APP_ENABLE_ANALYTICS === 'true'),
  ENABLE_DEBUG: (import.meta.env.VITE_ENABLE_DEBUG === 'true' || 
                 import.meta.env.REACT_APP_ENABLE_DEBUG === 'true'),
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
};

// Log environment info in development
if (ENV.IS_DEVELOPMENT || ENV.ENABLE_DEBUG) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: ENV.API_BASE_URL || '❌ NOT SET - Please create .env file with VITE_API_BASE_URL',
    ENVIRONMENT: ENV.ENVIRONMENT,
    IS_PRODUCTION: ENV.IS_PRODUCTION,
  });
  
  if (!ENV.API_BASE_URL) {
    console.warn('⚠️ WARNING: VITE_API_BASE_URL (or REACT_APP_API_BASE_URL) is not set!');
    console.warn('📝 Please create/update .env file in the root directory with:');
    console.warn('   VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
    console.warn('   (Note: In Vite, use VITE_ prefix, not REACT_APP_)');
    console.warn('   Then restart the dev server.');
  } else if (ENV.API_BASE_URL.includes('localhost:3000')) {
    console.error('❌ ERROR: API_BASE_URL is pointing to localhost:3000 (Vite dev server)!');
    console.error('📝 This should be your Google Apps Script Web App URL.');
    console.error('📝 Update VITE_API_BASE_URL in your .env file and restart the server.');
  } else {
    console.log('✅ API_BASE_URL is configured:', ENV.API_BASE_URL);
  }
}

