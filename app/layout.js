export const metadata = {
  title: "Agentic Chat",
  description: "A lightweight ChatGPT-like app",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
