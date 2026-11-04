import crypto from 'crypto';

const secret = () => process.env.PDF_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const sign = (id, exp) => crypto.createHmac('sha256', secret()).update(`${id}.${exp}`).digest('hex');

export const hasSecret = () => secret().length > 0;

export function makeToken(id, ttlSeconds = 120) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return { exp, sig: sign(id, exp) };
}

export function verifyToken(id, exp, sig) {
  if (!hasSecret() || !id) return false;
  const expiry = Number(exp);
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(id, expiry), 'hex');
  const given = Buffer.from(String(sig || ''), 'hex');
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}