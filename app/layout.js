import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";
import Header from "./_components/main/Header";

const dmSans = Rubik({
  subsets: ["latin"], // Choose subsets
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Optional: specific weights
  variable: "--font-inter", // Optional: for CSS variables
});

export const metadata = {
  title: "Evi Dark",
  description: "Evi Dark - Where Evidence Meets Darkness",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <div className="fixed z-50 w-full bg-white">
          <Header />
        </div>
        <p className="h-10 bg-white"></p>
        {children}
      </body>
    </html>
  );
}
