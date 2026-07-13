"use client";

/** COMPONENTS */
import Link from "next/link";
import { LinksDesktop } from "./LinksDesktop";
import { SearchInput } from "./SearchInput";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartLink } from "./CartLink";
/** ICONS */
import { FiMenu, FiBookOpen } from "react-icons/fi";

import { useQuery } from "@tanstack/react-query";
import { getShopifyCollections } from "@/app/actions";

export const Navbar = () => {
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => getShopifyCollections(),
  });

  const linksData = [
    { path: "/products", name: "ALL PRODUCTS" },
    ...collections.map((col) => ({
      path: `/${col.handle}`,
      name: col.title.toUpperCase(),
    })),
  ];

  return (
    <header className="sticky top-0 z-50 pointer-events-auto w-full px-3.5 gap-4 xs:px-6 sm:px-12 py-6 flex items-center justify-between bg-background-secondary border-b border-solid border-border-primary">
      {/* Mobile Menu Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex px-4 py-2 lg:hidden hover:opacity-75 transition-opacity">
            <FiMenu size={24} />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-full sm:w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-primary">
              <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-2 p-4">
                {/* Category Links */}
                {linksData.map((link, index) => (
                  <li key={index}>
                    <SheetClose asChild>
                      <Link
                        href={link.path}
                        className="flex items-center px-4 py-2 rounded-md hover:bg-color-secondary transition-colors text-sm font-medium"
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <ul className="justify-between hidden gap-2 text-sm lg:flex">
        <li>
          <LinksDesktop />
        </li>
      </ul>

      {/* Brand logo / Home link */}
      <div className="flex items-center">
        <Link href="/" className="text-lg font-bold tracking-widest hover:opacity-85 transition-opacity">
          Loopgro
        </Link>
      </div>

      {/* Search Input */}
      <SearchInput />

      <ul className="flex gap-2">
        <li className="flex items-center justify-center">
          <Link
            href="/blogs"
            className="text-sm py-2 px-3 rounded-md font-semibold transition-all text-color-tertiary hover:bg-background-tertiary"
          >
            Blogs
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <CartLink />
        </li>
      </ul>
    </header>
  );
};
