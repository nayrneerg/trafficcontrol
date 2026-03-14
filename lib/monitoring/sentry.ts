// Sentry error monitoring setup
// Install: npm install @sentry/nextjs
// Then run: npx @sentry/wizard@latest -i nextjs

export function captureException(error: Error, context?: Record<string, any>) {
  // In production with Sentry installed:
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.captureException(error, { extra: context });
  console.error('[monitoring] Exception captured:', error.message, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  // In production: Sentry.captureMessage(message, level);
  console.log(`[monitoring] [${level}] ${message}`);
}

export function setUserContext(userId: string, email?: string, orgId?: string) {
  // In production: Sentry.setUser({ id: userId, email, org_id: orgId });
  console.log(`[monitoring] User context set: ${userId}`);
}
