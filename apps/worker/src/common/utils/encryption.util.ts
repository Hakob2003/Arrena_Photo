import * as crypto from "crypto";

export class EncryptionUtil {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly PREFIX = "aes:";
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  private static getKey(): Buffer {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 32) {
      throw new Error(
        "ENCRYPTION_KEY must be exactly 32 characters long in environment variables.",
      );
    }
    return Buffer.from(keyString, "utf-8");
  }

  public static encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.getKey(), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${this.PREFIX}${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  public static decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    // Graceful degradation for legacy plain text tokens
    if (!encryptedText.startsWith(this.PREFIX)) {
      return encryptedText;
    }

    const parts = encryptedText.substring(this.PREFIX.length).split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
