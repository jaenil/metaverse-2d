export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly limit: number,    // max messages in window
    private readonly windowMs: number  // window size in ms
  ) {}

  isAllowed(): boolean {
    const now = Date.now();
    // Evict timestamps outside the sliding window
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.limit) return false;
    this.timestamps.push(now);
    return true;
  }
}
