"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Container, Flex, Separator, Text } from "@radix-ui/themes";
import { useAuth } from "../app/auth-context";

const baseLinks = [
  { href: "/", label: "Menu" },
  { href: "/todo", label: "Todo" },
  { href: "/user", label: "User" },
  { href: "/admin", label: "Admin" },
];

export function HeaderNav() {
  const { authState, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = authState.status === "authenticated";
  const role = isAuthenticated ? authState.user.role : undefined;

  return (
    <header>
      <Container size="3" py="3">
        <Flex justify="between" align="center" gap="4" wrap="wrap">
          <Text weight="bold" size="5">
            <Link href="/">FocusFlow</Link>
          </Text>
          <Flex align="center" gap="2" wrap="wrap">
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
                  <Button key={item.href} variant="soft" color="gray" disabled>
                    {item.label}
                  </Button>
                );
              }

              return (
                <Button key={item.href} variant={isActive ? "solid" : "ghost"} color="gray" asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
            {isAuthenticated ? (
              <Button color="red" variant="soft" onClick={logout}>
                Log out
              </Button>
            ) : (
              <Button
                color="blue"
                variant={pathname === "/login" ? "solid" : "soft"}
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
      <Separator size="4" />
    </header>
  );
}
