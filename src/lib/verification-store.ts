// Temporary in-memory storage for verification codes
// This will be replaced by database storage once Supabase tables are set up

interface VerificationCode {
  email: string;
  code: string;
  userId: string;
  fullName: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// In-memory store (will reset when server restarts)
const verificationCodes = new Map<string, VerificationCode>();

export class VerificationStore {
  static store(data: {
    email: string;
    code: string;
    userId: string;
    fullName: string;
    expiresAt: Date;
  }) {
    const key = `${data.email}-${data.code}`;
    verificationCodes.set(key, {
      ...data,
      used: false,
      createdAt: new Date(),
    });
    
    console.log(`📝 Stored verification code for ${data.email}: ${data.code}`);
  }

  static verify(email: string, code: string): { success: boolean; userId?: string; error?: string } {
    console.log(`🔍 Verifying: email=${email}, code=${code}`);
    console.log(`🔍 Total stored codes: ${verificationCodes.size}`);
    
    // Debug: show all keys
    console.log(`🔍 All keys:`, Array.from(verificationCodes.keys()));
    
    const key = `${email}-${code}`;
    console.log(`🔍 Looking for key: ${key}`);
    
    const record = verificationCodes.get(key);
    console.log(`🔍 Found record:`, record);
    
    if (!record) {
      // Try to find by email and code separately
      for (const [storedKey, storedRecord] of verificationCodes.entries()) {
        console.log(`🔍 Checking stored: email=${storedRecord.email}, code=${storedRecord.code}`);
        if (storedRecord.email === email && storedRecord.code === code) {
          console.log(`✅ Found matching record with different key format`);
          return this.verifyRecord(storedRecord, storedKey);
        }
      }
      
      return { success: false, error: 'Invalid verification code' };
    }
    
    return this.verifyRecord(record, key);
  }

  private static verifyRecord(record: VerificationCode, key: string): { success: boolean; userId?: string; error?: string } {
    if (record.used) {
      return { success: false, error: 'Verification code already used' };
    }
    
    if (new Date() > record.expiresAt) {
      return { success: false, error: 'Verification code has expired' };
    }
    
    // Mark as used
    record.used = true;
    verificationCodes.set(key, record);
    
    console.log(`✅ Verified email ${record.email} with code ${record.code}`);
    return { success: true, userId: record.userId };
  }

  static getByEmail(email: string): VerificationCode | undefined {
    for (const [, record] of verificationCodes.entries()) {
      if (record.email === email && !record.used) {
        return record;
      }
    }
    return undefined;
  }

  static cleanup() {
    // Remove expired codes
    const now = new Date();
    for (const [key, record] of verificationCodes.entries()) {
      if (now > record.expiresAt) {
        verificationCodes.delete(key);
      }
    }
  }

  // For development - show all active codes
  static getAllActive(): VerificationCode[] {
    const active: VerificationCode[] = [];
    const now = new Date();
    
    for (const record of verificationCodes.values()) {
      if (!record.used && now <= record.expiresAt) {
        active.push(record);
      }
    }
    
    return active;
  }
}

// Cleanup expired codes every minute
setInterval(() => {
  VerificationStore.cleanup();
}, 60000);