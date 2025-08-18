import { Cinzel, Merriweather } from "next/font/google";
import React from "react";

const cinzel = Merriweather({
  subsets: ["latin"], // Choose subsets
  weight: ["400", "500", "600", "700", "800", "900"], // Optional: specific weights
  variable: "--font-inter", // Optional: for CSS variables
});

const Hero = () => {
  return (
    <div
      className={`bg-gradient-to-r from-orange-600 to-neutral-900 m-2 text-neutral-200 p-4`}
    >
      <p className="text-6xl text-center my-4 font-semibold">
        Where Evidence Meets Darkness
      </p>
      {/* <p className="text-center mt-2">Have eyes on you</p> */}
    </div>
  );
};

export default Hero;
