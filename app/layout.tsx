import type { Metadata } from "next";
import {ClerkProvider } from "@clerk/nextjs"
import { Lato } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "sonner";
//import { Toaster } from "@/components/ui/sonner";

const lato = Lato(
  { weight: '400'}
);

export const metadata: Metadata = {
  title: "Debbit",
  description: "One stop finance platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${lato.className}`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Toaster richColors />
        {/* footer */}
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Made with 	&#10084; by me</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
