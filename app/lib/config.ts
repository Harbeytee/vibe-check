const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

const config = {
  socketUrl,
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
};

export default config;
