// Example function to proxy Supabase requests for enhanced security
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Initialize Supabase with service role key for server-side operations
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { path } = event.queryStringParameters || {};
    
    switch (path) {
      case 'profiles':
        if (event.httpMethod === 'GET') {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(50);
          
          if (error) throw error;
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
          };
        }
        break;
        
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }

  } catch (error) {
    console.error('Supabase proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};