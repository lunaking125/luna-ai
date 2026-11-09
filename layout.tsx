import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luna AI — Your intelligent workspace",
  description: "An AI assistant for research, conversation and basketball intelligence."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
