import { Inter } from "next/font/google";

export const interFont = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});
