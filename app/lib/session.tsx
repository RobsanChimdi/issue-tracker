import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from '@/app/lib/definitions'
import { cookies } from 'next/headers'
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('60second')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}
export async function createSession(userId: string, email: string) {
  const expiresAt = new Date(Date.now() + 60 * 1000); 
  const session = await encrypt({ userId, email })
  const cookieStore = await cookies()
 
  cookieStore.set('auth-token', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth-token")?.value;

  if (!session) return null;

  const payload = await decrypt(session);
  return payload as { userId: string; email: string } | null;
}
