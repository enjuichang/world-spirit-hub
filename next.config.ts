import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/").at(-1) ?? "world-spirit-hub";
const basePath =
  isGitHubPagesBuild && !repositoryName.endsWith(".github.io")
    ? `/${repositoryName}`
    : "";

const nextConfig: NextConfig = {
  ...(isGitHubPagesBuild
    ? {
        output: "export" as const,
        trailingSlash: true,
        basePath,
        images: { unoptimized: true },
        typescript: { tsconfigPath: "tsconfig.pages.json" },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
