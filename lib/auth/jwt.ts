export interface UserTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

const SECRET_KEY =
  process.env.JWT_SECRET ||
  process.env.ENCRYPTION_KEY ||
  process.env.NEXTAUTH_SECRET ||
  "imobweb-super-secret-jwt-key-cloudflare-2026-production";

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

export async function signToken(payload: UserTokenPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 7 * 24 * 3600 };

  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const message = `${encHeader}.${encPayload}`;

  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return `${message}.${bufferToBase64Url(signature)}`;
}

export async function verifyToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encHeader, encPayload, encSig] = parts;
    const message = `${encHeader}.${encPayload}`;

    const key = await getKey();

    // Decode signature
    const sigStr = base64UrlDecode(encSig);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(message)
    );

    if (!isValid) return null;

    const payloadStr = base64UrlDecode(encPayload);
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return payload as UserTokenPayload;
  } catch {
    return null;
  }
}
