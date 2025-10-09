"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faHouse,
  faListCheck,
  faRightFromBracket,
  faRightToBracket,
  faShieldHalved,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../app/auth-context";

const baseLinks: Array<{ href: string; label: string; icon: IconDefinition }> = [
  { href: "/", label: "Main", icon: faHouse },
  { href: "/todo", label: "Todo", icon: faListCheck },
  { href: "/user", label: "User", icon: faUser },
  { href: "/admin", label: "Admin", icon: faShieldHalved },
];

const navItemStyles = (
  isActive: boolean,
  disabled?: boolean
) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
  disabled
    ? "pointer-events-none opacity-40 text-slate-400"
    : isActive
    ? "bg-white/15 text-white shadow"
    : "text-slate-300 hover:bg-white/10 hover:text-white"
}`;

export function HeaderNav() {
  const { authState, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isAuthenticated = authState.status === "authenticated";
  const role = isAuthenticated ? authState.user.role : undefined;

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev);

  return (
    <>
      {!isMobileOpen ? (
        <button
          type="button"
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-slate-200 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
          aria-label="Open navigation"
          aria-expanded={isMobileOpen}
          onClick={toggleMobileNav}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-slate-950/95 text-slate-100 shadow-xl transition-transform duration-200 ease-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              FocusFlow
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
              aria-label="Close navigation"
              onClick={() => setIsMobileOpen(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-1" aria-label="Main navigation">
            {baseLinks.map((item) => {
              const isNested = item.href !== "/" && pathname.startsWith(`${item.href}/`);
              const isActive = pathname === item.href || isNested;
              const requiresAuth = item.href === "/user" || item.href === "/admin";
              const requiresAdmin = item.href === "/admin";

              const canAccess = !requiresAuth
                ? true
                : requiresAdmin
                ? role === "admin"
                : isAuthenticated;

              if (!canAccess) {
                return (
                  <div key={item.href} className={navItemStyles(false, true)}>
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemStyles(isActive)}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={logout}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Log out</span>
              </button>
            ) : (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => router.push("/login")}
              >
                <FontAwesomeIcon icon={faRightToBracket} />
                <span>Log in</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}
    </>
  );
}
