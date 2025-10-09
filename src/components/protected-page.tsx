"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Card, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { Role, useAuth } from "../app/auth-context";

interface ProtectedPageProps {
  allowedRoles: Role[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ProtectedPage({ allowedRoles, title, subtitle, children }: ProtectedPageProps) {
  const { authState } = useAuth();
  const router = useRouter();
  const isAuthenticated = authState.status === "authenticated";
  const role = isAuthenticated ? authState.user.role : undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      router.replace("/");
    }
  }, [allowedRoles, isAuthenticated, role, router]);

  const isAllowed = isAuthenticated && role ? allowedRoles.includes(role) : false;

  if (!isAllowed) {
    return null;
  }

  return (
    <Container size="3" py={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="6">
        <Box>
          <Heading size="7">{title}</Heading>
          {subtitle && (
            <Text size="3" color="gray">
              {subtitle}
            </Text>
          )}
        </Box>
        <Card size="3" variant="surface">
          {children}
        </Card>
      </Flex>
    </Container>
  );
}
