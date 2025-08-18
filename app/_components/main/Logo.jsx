import { Cinzel } from "next/font/google";
import Image from "next/image";
import React from "react";

const cinzel = Cinzel({
  subsets: ["latin"], // Choose subsets
  weight: ["400", "700"], // Optional: specific weights
  variable: "--font-inter", // Optional: for CSS variables
});

const Logo = () => {
  return (
    <div className="text-white">
      <Image src={"/evidark.png"} alt="Evidark Logo" width={80} height={20} />
    </div>
  );
};

export default Logo;
