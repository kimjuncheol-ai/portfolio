// A role written inside a JWT is not proof. Verify it with the project's database gateway.
export async function verifyServiceRole(token: string, url: string, apiKey: string, fetcher: typeof fetch = fetch) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.role !== 'service_role') return false;
    // HEAD + limit=0 validates the JWT and table privilege without returning administrator data.
    const response = await fetcher(`${url}/rest/v1/site_admins?select=user_id&limit=0`, {
      method: 'HEAD', headers: { apikey: apiKey, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000)
    });
    return response.ok;
  } catch { return false; }
}
