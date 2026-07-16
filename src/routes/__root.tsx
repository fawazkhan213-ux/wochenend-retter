import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { InstallPrompt } from "../components/InstallPrompt";
import { SplashScreen } from "../components/SplashScreen";
import { OfflineBanner } from "../components/OfflineBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wochenend-Retter — Einkauf & Sonntag in Deutschland" },
      {
        name: "description",
        content:
          "Wochenend-Retter: Ladenschluss-Countdown für Samstag, smarte Einkaufsliste und Läden, die sonntags in Deutschland offen haben. Kostenlos, ohne Werbung.",
      },
      { name: "keywords", content: "verkaufsoffener sonntag, ladenschluss samstag, einkaufsliste, sonntag offen, wochenende planen, bäckerei sonntag, tankstelle sonntag, deutschland" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "language", content: "de" },
      { httpEquiv: "content-language", content: "de-DE" },
      { name: "author", content: "Wochenend-Retter" },
      { property: "og:title", content: "Wochenend-Retter — Einkauf & Sonntag in Deutschland" },
      {
        property: "og:description",
        content:
          "Ladenschluss-Countdown, Einkaufsliste und was am Sonntag offen hat — dein Begleiter durchs deutsche Wochenende.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Wochenend-Retter" },
      { property: "og:locale", content: "de_DE" },
      { property: "og:url", content: "https://wochenend-retter.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "theme-color", content: "#1F4A3A" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Wochenend-Retter" },
      { name: "twitter:title", content: "Wochenend-Retter — Einkauf & Sonntag in Deutschland" },
      { name: "twitter:description", content: "Ladenschluss-Countdown, Einkaufsliste und was am Sonntag offen hat — dein Begleiter durchs deutsche Wochenende." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c55bcfc4-588a-4f31-b387-c9bdfb080a2b" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c55bcfc4-588a-4f31-b387-c9bdfb080a2b" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/app-icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Wochenend-Retter",
          url: "https://wochenend-retter.lovable.app/",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          inLanguage: "de-DE",
          description:
            "Ladenschluss-Countdown, Einkaufsliste und was am Sonntag offen hat — dein Begleiter durchs deutsche Wochenende.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <InstallPrompt />
      <SplashScreen />
      <OfflineBanner />
    </QueryClientProvider>
  );
}
