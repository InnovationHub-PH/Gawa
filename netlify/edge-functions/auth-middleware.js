// Example Edge Function for authentication middleware
export default async (request, context) => {
  const url = new URL(request.url);
  
  // Check if user is authenticated for protected routes
  const authToken = request.headers.get('authorization');
  
  if (!authToken && url.pathname.startsWith('/api/protected/')) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
  
  // Continue to the next function or return the response
  return context.next();
};