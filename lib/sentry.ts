import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Inicializar Sentry apenas se o DSN estiver configurado
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Ajuste a amostragem para produção
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    // Desativar em desenvolvimento se necessário
    enabled: process.env.NODE_ENV === "production",
    // Configurações adicionais
    integrations: [
      new Sentry.BrowserTracing({
        // Definir o nome da transação para URLs
        routingInstrumentation: Sentry.reactRouterV6Instrumentation((history) => history.location),
      }),
    ],
  })
}

export { Sentry }
