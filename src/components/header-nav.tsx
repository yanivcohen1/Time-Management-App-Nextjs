"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Container, Flex, Separator, Text } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faHouse,
  faListCheck,
  faRightFromBracket,
  faRightToBracket,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../app/auth-context";

const baseLinks: Array<{ href: string; label: string; icon: IconDefinition }> = [
  { href: "/", label: "Main", icon: faHouse },
  { href: "/todo", label: "Todo", icon: faListCheck },
  { href: "/user", label: "User", icon: faUser },
  { href: "/admin", label: "Admin", icon: faShieldHalved },
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
                    <Flex align="center" gap="2">
                      <FontAwesomeIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Flex>
                  </Button>
                );
              }

              return (
                <Button key={item.href} variant={isActive ? "solid" : "ghost"} color="gray" asChild>
                  <Link href={item.href}>
                    <Flex align="center" gap="2">
                      <FontAwesomeIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Flex>
                  </Link>
                </Button>
              );
            })}
            {isAuthenticated ? (
              <Button color="red" variant="soft" onClick={logout}>
                <Flex align="center" gap="2">
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Log out</span>
                </Flex>
              </Button>
            ) : (
              <Button
                color="blue"
                variant={pathname === "/login" ? "solid" : "soft"}
                onClick={() => router.push("/login")}
              >
                <Flex align="center" gap="2">
                  <FontAwesomeIcon icon={faRightToBracket} />
                  <span>Log in</span>
                </Flex>
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
      <Separator size="4" />
    </header>
  );
}
