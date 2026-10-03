import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TaskSnap AI — Turn messy messages into actionable tasks",
    template: "%s · TaskSnap AI",
  },
  description:
    "Upload a screenshot from WhatsApp, email, Discord, or any announcement. TaskSnap AI reads the text in your browser and extracts tasks, deadlines, priorities, and assignees automatically.",
  keywords: [
    "AI task extraction",
    "screenshot to tasks",
    "local OCR",
    "Tesseract OCR",
    "task manager",
    "deadline tracking",
    "productivity",
    "WhatsApp tasks",
    "open source Next.js app",
  ],
  applicationName: "TaskSnap AI",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "TaskSnap AI — Turn messy messages into actionable tasks",
    description:
      "Upload a screenshot. Text is read locally in your browser, then AI extracts tasks, deadlines, priorities, and assignees.",
    type: "website",
    siteName: "TaskSnap AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskSnap AI — Turn messy messages into actionable tasks",
    description:
      "Upload a screenshot from WhatsApp, email, Discord, or any announcement. In-browser OCR plus AI turns it into a prioritized task list.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
