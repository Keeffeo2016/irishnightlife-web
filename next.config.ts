import type { NextConfig } from "next";

function supabaseImageRemotePattern():
  | { protocol: "https"; hostname: string; pathname: string }
  | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const { hostname, protocol } = new URL(raw);
    if (protocol !== "https:" && protocol !== "http:") return null;
    return {
      protocol: "https",
      hostname,
      // Public storage objects only (venue/event photos)
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseImageRemotePattern();

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Hostname is derived from NEXT_PUBLIC_SUPABASE_URL at config time.
    // If unset, no remote host is allowed — set the env before production builds.
    remotePatterns: supabasePattern ? [supabasePattern] : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
