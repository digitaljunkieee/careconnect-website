import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function normalizeHexSignature(signature: string) {
  return signature.trim().replace(/^sha256=/i, "");
}

export function hashSha256(input: string | Buffer) {
  return createHash("sha256").update(input).digest("hex");
}

export function signHmacSha256(secret: string, payload: string | Buffer) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyHmacSha256Signature(
  payload: string | Buffer,
  secret: string,
  signature: string
) {
  const expected = Buffer.from(signHmacSha256(secret, payload), "hex");
  const received = Buffer.from(normalizeHexSignature(signature), "hex");

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
