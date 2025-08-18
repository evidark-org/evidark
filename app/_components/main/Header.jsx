import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { auth } from "@/lib/auth";
import Search from "./Search";

const Header = async () => {
  const session = await auth();
  // console.log(session);
  return (
    <div className="px-4 py-1.5 text-neutral-800 top-0 w-full z-50 bg-white flex items-center gap-6">
      <div className="justify-items-center self-center">
        <Logo />
      </div>
      {/* <div className="font-medium text-sm flex items-center gap-6">
        <Link href="/">Home</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/community">Community</Link>
        <Link href="/about">About</Link>
      </div> */}
      <div className="ml-auto flex items-center gap-2">
        {/* <div className="flex items-center gap-2">
          <input
            className="border-neutral-300 w-72 max-w-96 text-sm border rounded-xs px-4 py-1.5 font-medium placeholder:font-medium focus:outline-none focus:bg-orange-50 hover:bg-orange-50 placeholder:text-neutral-800"
            placeholder="Search"
          />
        </div> */}
        <Search />
        {session?.user ? (
          <div className="flex items-center gap-3">
            {session?.user?.role === "author" && (
              <Link
                href="/create"
                className="px-5 py-2 text-xs font-bold rounded-xs border border-green-900 text-green-900 transition-all duration-200 hover:bg-green-50 hover:shadow-sm"
              >
                CREATE
              </Link>
            )}
            <Link href={`/user/${session.user.username}`}>
              <img
                className="w-8.5 h-8.5 rounded-xs border border-orange-900"
                alt="profile"
                src={session?.user?.image}
                width={20}
                height={20}
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-xs font-bold rounded-xs border border-orange-900 text-orange-900 transition-all duration-200 hover:bg-orange-50 hover:shadow-sm"
            >
              LOG IN
            </Link>
            <Link
              href="#"
              className="px-5 py-2 text-xs font-bold rounded-xs border border-orange-900 bg-orange-900 text-white transition-all duration-200 hover:bg-orange-800 hover:shadow-md"
            >
              REGISTER
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
