import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DJADULS | Khairul Baharuddin — Portfolio",
    short_name: "DJADULS",
    description:
      "Khairul Baharuddin (DJADULS) — Full-Stack Software Engineer portfolio.",
    start_url: "/",
    display: "standalone",
    background_color: "#010a13",
    theme_color: "#010a13",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
