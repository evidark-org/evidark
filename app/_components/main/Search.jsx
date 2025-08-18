"use client";

import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Search() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const items = [
    "Next.js",
    "React",
    "TailwindCSS",
    "shadcn/ui",
    "MongoDB",
    "Mongoose",
  ];

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-72 max-w-96">
      {/* Input Field */}
      <input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        className="border border-neutral-300 w-full text-sm px-4 py-1.5 font-medium 
                   placeholder:font-medium placeholder:text-neutral-800 
                   focus:outline-none 
                   rounded-t-xs rounded-b-xs focus:rounded-b-none"
      />
      {/* Dropdown */}
      {(focused || query.length > 0) && (
        <div className="absolute top-full left-0 w-full z-50">
          <Command className="border border-t-0 rounded-b-xs rounded-t-none">
            <CommandList>
              {filteredItems.length === 0 ? (
                <CommandEmpty className="px-4 py-2 text-sm text-neutral-500">
                  No results found.
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Suggestions">
                  {filteredItems.map((item, idx) => (
                    <CommandItem
                      key={idx}
                      onSelect={() => {
                        setQuery(item);
                        setFocused(false);
                      }}
                      className="cursor-pointer px-4 py-2 text-sm hover:bg-orange-50"
                    >
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
