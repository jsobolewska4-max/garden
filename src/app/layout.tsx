import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garden Planner - Plan Your Vegetable Garden",
  description: "A free tool to help beginner gardeners plan their vegetable garden layout and planting schedule based on their location and growing space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
