let errorHandler = null;

function setupMonitoring(app) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return { sentryErrorHandler: (err, req, res, next) => next(err) };
  }

  // Lazy require to avoid installing Sentry when not needed in tests
  const Sentry = require('@sentry/node');
  const Tracing = require('@sentry/tracing');

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.2),
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  errorHandler = Sentry.Handlers.errorHandler();

  return { sentryErrorHandler: errorHandler };
}

module.exports = { setupMonitoring };
