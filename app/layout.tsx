import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sculpt Gallery",
  description: "A public gallery of user-created 3D sculptures",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
