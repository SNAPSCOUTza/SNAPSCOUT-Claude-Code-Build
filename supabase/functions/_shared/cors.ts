// Edge Functions live on a different origin than the app (*.supabase.co vs
// your domain), so the browser sends a preflight OPTIONS request before the
// real POST. Every function that's called from the frontend needs to handle
// OPTIONS and echo these headers on its actual response.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
