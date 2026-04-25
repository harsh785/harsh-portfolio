import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Harsh Dixit — Senior Cloud & DevOps Engineer",
  description:
    "AWS SAA-C03 Certified Senior Cloud Engineer with 4+ years of expertise in cloud infrastructure, Terraform, Kubernetes, CI/CD, and DevOps automation.",
  keywords: ["DevOps", "Cloud Engineer", "AWS", "Terraform", "Kubernetes", "Harsh Dixit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full antialiased bg-[#0a0a0f] text-slate-200">
        {children}
      </body>
    </html>
  );
}
