import "./globals.css";

export const metadata = {
  title: "SwiftDeliver — Food & Package Delivery",
  description: "Reliable food and package delivery across the city.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
