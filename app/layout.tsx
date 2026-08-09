import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "World Spirit Hub — A spirited atlas",
      template: "%s · World Spirit Hub",
    },
    description:
      "Explore the world’s spirits by place, raw material, production, flavor and law through an interactive educational atlas.",
    icons: { icon: "/og.png", shortcut: "/og.png" },
    openGraph: {
      type: "website",
      url: origin,
      title: "World Spirit Hub",
      description: "Explore the world, one pour at a time.",
      siteName: "World Spirit Hub",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1792,
          height: 934,
          alt: "World Spirit Hub illustrated world map and spirits atlas",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "World Spirit Hub",
      description: "Explore the world, one pour at a time.",
      images: [`${origin}/og.png`],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#100F0E",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
