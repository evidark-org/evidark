import { signInAction, signInGithub } from "@/lib/actions";
import { Github, LogIn } from "lucide-react";
import { Lora } from "next/font/google";
import React from "react";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const page = () => {
  return (
    <div className="mt-24 flex flex-col items-center">
      <div className="w-full shadow-sm max-w-[600px] flex flex-col items-center gap-4 p-6">
        <p className={`${lora.className} font-medium text-xl mb-10`}>
          Join Somana Org.
        </p>
        <form action={signInAction}>
          <button className="p-1.5 cursor-pointer px-5 font-medium rounded-full border bg-stone-50 flex items-center gap-2">
            <LogIn size={16} />
            Login with Google
          </button>
        </form>
        <form action={signInGithub}>
          <button className="p-1.5 cursor-pointer px-5 font-medium rounded-full border bg-stone-50 flex items-center gap-2">
            <Github size={16} />
            Login with GitHub
          </button>
        </form>
        <p className={`text-center font-medium text-sm mt-20`}>
          Click Login to agree to Somana’s{" "}
          <span className="underline">Terms of Service</span> and acknowledge
          that Somana’s <span className="underline">Privacy Policy</span>{" "}
          applies to you.
        </p>
      </div>
    </div>
  );
};

export default page;
