// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.SENTRY_RELEASE || 'web@1.0.0',

  // Additional configuration
  beforeSend(event, _hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;

      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }

    // Filter out database connection strings
    if (event.extra) {
      const sensitiveKeys = ['DB_PASSWORD', 'JWT_SECRET', 'connectionString'];
      sensitiveKeys.forEach(key => {
        if (event.extra && event.extra[key]) {
          event.extra[key] = '[Filtered]';
        }
      });
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
});
