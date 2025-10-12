"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faChevronDown,
  faChevronRight,
  faFileLines,
  faHouse,
  faListCheck,
  faRightFromBracket,
  faRightToBracket,
  faShieldHalved,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../app/auth-context";

type BaseLink = {
  href: string;
  label: string;
  icon: IconDefinition;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  children?: Array<{ href: string; label: string; icon: IconDefinition }>;
};

const baseLinks: BaseLink[] = [
  { href: "/", label: "Main", icon: faHouse },
  { href: "/todo", label: "Todo", icon: faListCheck },
  {
    href: "/user",
    label: "User",
    icon: faUser,
    requiresAuth: true,
    children: [{ href: "/user/inter/2", label: "Inter", icon: faFileLines }],
  },
  {
    href: "/admin",
    label: "Admin",
    icon: faShieldHalved,
    requiresAuth: true,
    requiresAdmin: true,
  },
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};

    baseLinks.forEach((item) => {
      if (item.children?.length) {
        initial[item.href] = pathname.startsWith(`${item.href}/`);
      } else {
        initial[item.href] = false;
      }
    });

    return initial;
  });

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setExpandedSections((prev) => {
      let didMutate = false;
      const next = { ...prev };

      baseLinks.forEach((item) => {
        if (!item.children?.length) {
          return;
        }

        const shouldBeOpen = pathname.startsWith(`${item.href}/`);
        if (next[item.href] !== shouldBeOpen) {
          next[item.href] = shouldBeOpen;
          didMutate = true;
        }
      });

      return didMutate ? next : prev;
    });
  }, [pathname]);

  const isAuthenticated = authState.status === "authenticated";
  const role = isAuthenticated ? authState.user.role : undefined;

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev);
  const toggleSection = (href: string) => {
    setExpandedSections((prev) => ({ ...prev, [href]: !(prev[href] ?? false) }));
  };

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
        className={`fixed inset-y-0 left-0 z-40 flex w-56 transform flex-col bg-slate-950/95 text-slate-100 shadow-xl transition-transform duration-200 ease-out md:translate-x-0 ${
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
              const requiresAuth = item.requiresAuth ?? false;
              const requiresAdmin = item.requiresAdmin ?? false;

              const canAccess = !requiresAuth
                ? true
                : requiresAdmin
                ? role === "admin"
                : isAuthenticated;

              const hasChildren = Boolean(item.children?.length);
              const isExpanded = hasChildren ? expandedSections[item.href] : false;

              if (!canAccess) {
                return (
                  <div key={item.href} className={navItemStyles(false, true)}>
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                );
              }

              if (hasChildren) {
                return (
                  <div key={item.href} className="space-y-1">
                    <div className={navItemStyles(isActive)}>
                      <Link
                        href={item.href}
                        className="flex flex-1 items-center gap-3 text-inherit focus-visible:outline-none"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <FontAwesomeIcon icon={item.icon} />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                      <button
                        type="button"
                        className="rounded-md p-1 text-slate-200/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        aria-label={`Toggle ${item.label} submenu`}
                        aria-expanded={isExpanded}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSection(item.href);
                        }}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                      </button>
                    </div>

                    <div
                      className={`pl-6 overflow-hidden transition-all duration-200 ease-out ${
                        isExpanded
                          ? "max-h-48 opacity-100 translate-y-0 pointer-events-auto"
                          : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                      }`}
                      aria-hidden={!isExpanded}
                    >
                      <div className="space-y-1 pt-1">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={navItemStyles(isChildActive)}
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <FontAwesomeIcon icon={child.icon} />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
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
