import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GradeProjector Demo",
  description: "GPPP × WeTheHobby closed-loop grading intelligence demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
