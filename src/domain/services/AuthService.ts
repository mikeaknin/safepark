export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'driver' | 'operator' | 'enterprise_admin';
  subscriptionTier: 'free' | 'premium_monthly' | 'premium_annual';
  authProvider: 'email' | 'apple' | 'google';
  accessToken: string;
}

const AUTH_STORAGE_KEY = 'safepark_auth_session_v1';

export class AuthService {
  private static currentUser: AuthUser | null = null;
  private static listeners: Array<(user: AuthUser | null) => void> = [];

  public static initialize(): AuthUser | null {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Auth session recovery failed:', e);
      }
    }

    if (!this.currentUser) {
      // Default initial guest driver session
      this.currentUser = {
        id: 'usr-guest-8821',
        email: 'alex.rivera@example.com',
        fullName: 'Alex Rivera',
        role: 'driver',
        subscriptionTier: 'free',
        authProvider: 'apple',
        accessToken: 'jwt_mock_safepark_token_2026',
      };
    }

    return this.currentUser;
  }

  public static getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      return this.initialize();
    }
    return this.currentUser;
  }

  public static subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public static async signInWithOAuth(provider: 'apple' | 'google'): Promise<AuthUser> {
    const user: AuthUser = {
      id: `usr-${provider}-${Date.now()}`,
      email: provider === 'apple' ? 'driver.apple@privaterelay.appleid.com' : 'driver.google@gmail.com',
      fullName: provider === 'apple' ? 'Apple Verified Driver' : 'Google Verified Driver',
      role: 'driver',
      subscriptionTier: 'free',
      authProvider: provider,
      accessToken: `jwt_${provider}_token_${Date.now()}`,
    };

    this.setUserSession(user);
    return user;
  }

  public static async signInWithEmail(email: string, fullName?: string): Promise<AuthUser> {
    const user: AuthUser = {
      id: `usr-email-${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      role: 'driver',
      subscriptionTier: 'free',
      authProvider: 'email',
      accessToken: `jwt_email_token_${Date.now()}`,
    };

    this.setUserSession(user);
    return user;
  }

  public static async upgradeSubscription(tier: 'premium_monthly' | 'premium_annual'): Promise<AuthUser> {
    if (!this.currentUser) {
      this.initialize();
    }
    const updated: AuthUser = {
      ...this.currentUser!,
      subscriptionTier: tier,
    };
    this.setUserSession(updated);
    return updated;
  }

  public static signOut(): void {
    this.currentUser = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  private static setUserSession(user: AuthUser): void {
    this.currentUser = user;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    this.notify();
  }

  private static notify(): void {
    this.listeners.forEach(fn => fn(this.currentUser));
  }
}
