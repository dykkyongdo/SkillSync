'use client';

import * as Sentry from '@sentry/nextjs';

// Test component to verify Sentry error tracking
export function SentryTestButton() {
  return (
    <button
      onClick={() => {
        // Send a log before throwing the error
        Sentry.addBreadcrumb({
          message: 'User triggered test error',
          level: 'info',
          data: {
            action: 'test_error_button_click',
          },
        });
        throw new Error('This is your first error!');
      }}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Break the world (Test Sentry)
    </button>
  );
}
