"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useAuth } from "../auth-context";

export default function LoginPage() {
  const { authState, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login({ username, password });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setUsername("");
    setPassword("");
    router.replace("/");
  }

  useEffect(() => {
    if (authState.status === "authenticated") {
      router.replace("/");
    }
  }, [authState, router]);

  return (
    <Container size="1" py={{ initial: "6", sm: "8" }}>
      <Flex direction="column" align="center" gap="6">
        <Box style={{ textAlign: "center" }}>
          <Heading size="7">Welcome back</Heading>
          <Text size="3" color="gray">
            Sign in to access your FocusFlow workspaces.
          </Text>
        </Box>

        <Card size="4" variant="surface" style={{ width: "100%", maxWidth: 420 }}>
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="medium" htmlFor="username">
                  Username
                </Text>
                <TextField.Root
                  id="username"
                  placeholder="user or admin"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  size="3"
                  required
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium" htmlFor="password">
                  Password
                </Text>
                <TextField.Root
                  id="password"
                  type="password"
                  placeholder="••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  size="3"
                  required
                />
              </Box>

              {error && (
                <Card variant="classic">
                  <Text color="red" size="2">
                    {error}
                  </Text>
                </Card>
              )}

              <Button type="submit" size="3" disabled={loading}>
                {loading ? (
                  <Flex align="center" gap="2">
                    <Spinner />
                    <span>Signing in…</span>
                  </Flex>
                ) : (
                  "Sign in"
                )}
              </Button>

              <Text size="2" color="gray">
                Demo credentials — user: <code>user/user123</code>, admin: <code>admin/admin123</code>.
              </Text>
            </Flex>
          </form>
        </Card>
      </Flex>
    </Container>
  );
}
