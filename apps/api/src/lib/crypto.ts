import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM field encryption for sensitive free text and amounts.
 * Format: v1.<iv>.<tag>.<ciphertext> (base64url). Key rotation: bump the
 * version prefix and keep old keys for decryption.
 */
export class FieldCipher {
  private key: Buffer;
  constructor(secret: string) {
    const decoded = Buffer.from(secret, "base64");
    // Use a base64 32-byte key directly; otherwise derive a 32-byte key from the secret.
    this.key = decoded.length === 32 && /^[A-Za-z0-9+/=]+$/.test(secret) ? decoded : createHash("sha256").update(secret, "utf8").digest();
  }
  encrypt(plain: string | null | undefined): string | null {
    if (plain === null || plain === undefined || plain === "") return null;
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return ["v1", iv.toString("base64url"), tag.toString("base64url"), ct.toString("base64url")].join(".");
  }
  decrypt(token: string | null | undefined): string | null {
    if (!token) return null;
    const [v, iv, tag, ct] = token.split(".");
    if (v !== "v1" || !iv || !tag || !ct) return null;
    try {
      const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(iv, "base64url"));
      decipher.setAuthTag(Buffer.from(tag, "base64url"));
      return Buffer.concat([decipher.update(Buffer.from(ct, "base64url")), decipher.final()]).toString("utf8");
    } catch {
      return null;
    }
  }
  encryptNumber(n: number | null | undefined): string | null {
    return n === null || n === undefined ? null : this.encrypt(String(n));
  }
  decryptNumber(token: string | null | undefined): number | null {
    const s = this.decrypt(token);
    if (s === null) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
