import type { Metadata } from "next";
import "@fontsource/pixelify-sans/400.css";
import "@fontsource/pixelify-sans/500.css";
import "@fontsource/pixelify-sans/600.css";
import "@fontsource/pixelify-sans/700.css";
import "@fontsource/press-start-2p/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habitat — grow a habit, grow a garden",
  description:
    "Habitat turns your habits into a garden. Keep your streak alive, watch each habit grow, and harvest it when it's fully bloomed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
