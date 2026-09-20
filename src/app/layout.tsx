import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftDeliver — Food & Package Delivery",
  description: "Reliable food and package delivery across the city.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
