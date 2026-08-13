import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { withBasePath } from "./publicPath";
import "./globals.css";

function siteMetadata(origin: string): Metadata {
  const ogImage = `${origin}${withBasePath("/og.png")}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "World Spirit Hub — A spirited atlas",
      template: "%s · World Spirit Hub",
    },
    description:
      "Explore the world’s spirits by place, raw material, production, flavor and law through an interactive educational atlas.",
    icons: { icon: withBasePath("/og.png"), shortcut: withBasePath("/og.png") },
    openGraph: {
      type: "website",
      url: `${origin}${withBasePath("/")}`,
      title: "World Spirit Hub",
      description: "Explore the world, one pour at a time.",
      siteName: "World Spirit Hub",
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.GITHUB_PAGES === "true") {
    return siteMetadata(
      process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://localhost",
    );
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return siteMetadata(origin);
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
