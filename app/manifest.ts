import type { MetadataRoute } from "next";

// Next.js file convention: this is served at /manifest.webmanifest and
// automatically linked into <head> by the framework — no manual <link> tag
// or metadata.manifest field needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Edu Loan",
    short_name: "Edu Loan",
    description:
      "Apply for and manage your education loan — track applications, disbursements, and repayments from Unnati Edu Loan.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    lang: "en",
    theme_color: "#15C35B",
    background_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
