
// CSRF Protection utilities
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';

  // Generate a cryptographically secure CSRF token
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Store CSRF token in session storage
  static storeToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  // Retrieve CSRF token from session storage
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Initialize CSRF protection (call on app startup)
  static initialize(): string {
    let token = this.getToken();
    if (!token) {
      token = this.generateToken();
      this.storeToken(token);
    }
    return token;
  }

  // Validate CSRF token
  static validateToken(providedToken: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === providedToken;
  }

  // Get headers with CSRF token for API requests
  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { [this.TOKEN_HEADER]: token } : {};
  }

  // Add CSRF token to form data
  static addTokenToFormData(formData: FormData): void {
    const token = this.getToken();
    if (token) {
      formData.append('csrf_token', token);
    }
  }

  // Clear CSRF token (call on logout)
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}
