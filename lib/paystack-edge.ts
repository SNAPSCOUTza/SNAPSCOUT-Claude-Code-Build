// Calls the Supabase Edge Functions that replaced /api/paystack/* on Vercel.
// Edge Functions require a valid JWT in the Authorization header (the
// user's access token when signed in, otherwise the anon key) - this is
// separate from Paystack's own secret key, which never leaves the function.
export async function callPaystackFunction(
  functionName: "paystack-initialize" | "paystack-subscribe" | "paystack-verify",
  accessToken: string | undefined,
  body: unknown,
) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
}
