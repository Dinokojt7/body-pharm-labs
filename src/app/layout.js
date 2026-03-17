import { Poppins } from "next/font/google";
import "./globals.css";
import PreHeader from "@/components/layout/PreHeader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RouteLoader from "@/components/ui/RouteLoader";
import ServiceWorkerRegistration from "@/components/ui/ServiceWorkerRegistration";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import siteData from "@/lib/data/site-data.json";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: siteData.seo.title,
  description: siteData.seo.description,
  keywords: siteData.seo.keywords,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Body Pharm Labz",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <head>
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        {/* iOS splash / status bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Android nav bar */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CurrencyProvider>
            <RouteLoader />
            <ServiceWorkerRegistration />
            <PreHeader />
            <Header />
            <main className="min-h-screen pt-20 md:pt-24">{children}</main>
            <Footer />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
