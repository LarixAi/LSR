// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Use a Deno-compatible web-push implementation
// Minimal inline VAPID JWT generation to avoid external deps
function base64urlEncode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface PushSubscriptionRecord {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface SendPayload {
  userIds?: string[];
  role?: string;
  organization_id?: string;
  title: string;
  body: string;
  url?: string;
  data?: Record<string, any>;
}

// ECDSA over P-256 signing for VAPID
async function createVapidHeaders(origin: string, aud: string, vapidSubject: string, vapidPrivateKeyPem: string) {
  const jwtHeader = { alg: 'ES256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12h
  const jwtPayload = { aud, exp, sub: vapidSubject }; // RFC8292

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(jwtHeader)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(jwtPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import private key
  const pkcs8 = vapidPrivateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(signingInput)
  );

  // Convert DER ECDSA signature to JOSE (r||s)
  // Simple DER parser (assumes valid ECDSA signature)
  const sigBytes = new Uint8Array(signature);
  // DER structure: 0x30 len 0x02 rlen r 0x02 slen s
  let offset = 2;
  const rlen = sigBytes[offset + 1];
  offset += 2;
  const r = sigBytes.slice(offset, offset + rlen);
  offset += rlen + 2;
  const s = sigBytes.slice(offset, offset + sigBytes[offset - 1]);
  const jose = new Uint8Array(64);
  jose.set(r.length === 32 ? r : r.slice(-32), 0);
  jose.set(s.length === 32 ? s : s.slice(-32), 32);

  const sigB64 = base64urlEncode(jose);
  const jwt = `${signingInput}.${sigB64}`;

  const headers = new Headers();
  headers.set('Authorization', `WebPush ${jwt}`);
  headers.set('Crypto-Key', `p256ecdsa=${Deno.env.get('VAPID_PUBLIC_KEY')}`);
  return headers;
}

async function sendWebPush(subscription: PushSubscriptionRecord, payload: any, vapidHeaders: Headers) {
  const ttl = 60;
  const headers = new Headers(vapidHeaders);
  headers.set('TTL', String(ttl));
  headers.set('Content-Encoding', 'aes128gcm');
  headers.set('Content-Type', 'application/octet-stream');

  // For simplicity, send unencrypted payload using Web Push (some services may reject). In production, implement full message encryption.
  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  return res;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { userIds, role, organization_id, title, body, url, data } = (await req.json()) as SendPayload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com';

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Missing Supabase service key', { status: 500 });
    }
    if (!vapidPublic || !vapidPrivate) {
      return new Response('Missing VAPID keys', { status: 500 });
    }

    const origin = new URL(req.url).origin;
    const aud = 'https://fcm.googleapis.com'; // Most browsers use FCM for Web Push
    const vapidHeaders = await createVapidHeaders(origin, aud, vapidSubject, vapidPrivate);

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
    const sb = createClient(supabaseUrl, supabaseKey);

    // Resolve recipients
    let recipients: string[] = userIds ?? [];
    if (!recipients.length && role && organization_id) {
      const { data: profiles, error } = await sb
        .from('profiles')
        .select('id')
        .eq('role', role)
        .eq('organization_id', organization_id);
      if (error) throw error;
      recipients = profiles?.map((p: any) => p.id) ?? [];
    }

    if (!recipients.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

    // Fetch subscriptions
    const { data: subs, error: subsErr } = await sb
      .from('web_push_subscriptions')
      .select('endpoint, p256dh, auth, user_id')
      .in('user_id', recipients);
    if (subsErr) throw subsErr;

    let sent = 0, failed = 0;
    const payload = { title, body, url, data };
    for (const s of subs ?? []) {
      const record: PushSubscriptionRecord = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
      try {
        const res = await sendWebPush(record, payload, vapidHeaders);
        if (res.ok) sent++; else failed++;
        if (res.status === 410 || res.status === 404) {
          await sb.from('web_push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
      } catch (_e) {
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});


