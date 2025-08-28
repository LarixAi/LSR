
// Rate limiting utility
export class RateLimit {
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkRateLimit(): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastRequestTime;

    // Reset counter if window has passed
    if (timeDiff > this.windowMs) {
      this.requestCount = 0;
    }

    // Check if limit exceeded
    if (this.requestCount >= this.maxRequests) {
      console.warn('Rate limit exceeded for API requests');
      return false;
    }

    this.requestCount++;
    this.lastRequestTime = now;
    return true;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.requestCount);
  }
}
