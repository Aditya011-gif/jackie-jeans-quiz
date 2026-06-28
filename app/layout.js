import "./globals.css";
import { QuizProvider } from "@/context/QuizContext";

export const metadata = {
  title: "Jackie Jeans — Find Your Perfect Fit",
  description:
    "Take the Jackie Jeans Fit Quiz to find jeans that fit perfectly — the first time. Answer a few quick questions and get your personalized denim recommendation.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <QuizProvider>{children}</QuizProvider>
      </body>
    </html>
  );
}
