import { Poppins } from "next/font/google";
import "./globals.css";
import PreHeader from "@/components/layout/PreHeader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <AuthProvider>
          <CurrencyProvider>
            <PreHeader />
            <Header />
            <main className="min-h-screen pt-26">{children}</main>
            <Footer />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
