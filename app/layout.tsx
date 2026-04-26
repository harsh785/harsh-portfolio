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

/* Injected before React hydrates — prevents flash of wrong theme */
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`min-h-full antialiased ${jetbrainsMono.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
