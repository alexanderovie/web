"use client";

import React, { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const navLinks = [
    {
      label: "Features",
      href: "#features",
      dropdownItems: [
        {
          title: "Smart Productivity",
          href: "/#smart-productivity",
          description: "Boost your productivity with AI-powered insights",
        },
        {
          title: "Adaptive Workflows",
          href: "/#adaptive-workflows",
          description: "Customize and automate your work processes",
        },
        {
          title: "Optimized Scheduling",
          href: "/#optimized-scheduling",
          description: "Intelligent time management and scheduling",
        },
        {
          title: "Accelerate Planning",
          href: "/#accelerate-planning",
          description: "Strategic planning tools for faster execution",
        },
      ],
    },
    { label: "About us", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="relative z-50 border-b backdrop-blur-sm">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="text-2xl leading-0 font-semibold">Relative</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden items-center gap-8 lg:flex">
            <NavigationMenuList>
              {navLinks.map((link) =>
                link.dropdownItems ? (
                  <NavigationMenuItem key={link.label}>
                    <NavigationMenuTrigger className="text-primary lg:text-base">
                      {link.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-[400px] p-4">
                        {link.dropdownItems.map((item) => (
                          <li key={item.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                              >
                                <div>
                                  <div className="text-sm leading-none font-medium">
                                    {item.title}
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-primary lg:text-base",
                        pathname === link.href && "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2.5">
            <div
              className={`transition-opacity duration-300 ${isMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
              <ThemeToggle />
            </div>
            <Link href="/login" className="hidden lg:block">
              <Button variant="outline" className="gap-1">
                Login
                <ChevronRight className="size-4" />
              </Button>
            </Link>
            <Link
              href="/signup"
              className={`transition-opacity duration-300 ${isMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
              <Button className="gap-1">
                Sign up
                <ChevronRight className="size-4" />
              </Button>
            </Link>

            {/* Hamburger Menu Button (Mobile Only) */}
            <button
              className="text-muted-foreground relative flex h-8 w-8 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2 transform">
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full transform rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full transform rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full transform rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`bg-background fixed inset-0 top-full container flex h-[calc(100vh-64px)] flex-col transition-all duration-300 ease-in-out lg:hidden ${
          isMenuOpen
            ? "visible translate-x-0 opacity-100"
            : "invisible translate-x-full opacity-0"
        }`}
      >
        <div className="mt-8 space-y-2">
          <Link
            href="/signup"
            className="block"
            onClick={() => setIsMenuOpen(false)}
          >
            <Button size="sm" className="w-full">
              Sign up
            </Button>
          </Link>
          <Link
            href="/login"
            className="block"
            onClick={() => setIsMenuOpen(false)}
          >
            <Button size="sm" className="w-full" variant="outline">
              Login
            </Button>
          </Link>
        </div>
        <nav className="mt-3 flex flex-1 flex-col gap-6">
          {navLinks.map((link) =>
            link.dropdownItems ? (
              <div key={link.label} className="">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === link.label ? null : link.label,
                    )
                  }
                  className="text-primary flex w-full items-center justify-between text-lg font-medium tracking-[-0.36px]"
                >
                  {link.label}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openDropdown === link.label ? "rotate-90" : "",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "ml-4 space-y-3 overflow-hidden transition-all",
                    openDropdown === link.label
                      ? "mt-3 max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  {link.dropdownItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="hover:bg-accent flex items-start gap-3 rounded-md p-2"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      <div>
                        <div className="text-primary font-medium">
                          {item.title}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-primary text-lg tracking-[-0.36px]",
                  pathname === link.href && "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
