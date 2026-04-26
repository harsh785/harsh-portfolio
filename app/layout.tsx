import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harsh Dixit — Senior Cloud & DevOps Engineer",
  description:
    "AWS SAA-C03 Certified Senior Cloud Engineer with 5+ years of expertise in cloud infrastructure, Terraform, Kubernetes, CI/CD, and DevOps automation.",
  keywords: ["DevOps", "Cloud Engineer", "AWS", "Terraform", "Kubernetes", "Harsh Dixit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`} style={{ colorScheme: "dark" }}>
      <body className={`min-h-full antialiased bg-[#0d0d14] text-slate-200 ${jetbrainsMono.className}`}>
        {children}
      </body>
    </html>
  );
}
