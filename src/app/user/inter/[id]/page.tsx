"use client";

import { notFound } from "next/navigation";
import { Button, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { ProtectedPage } from "../../../../components/protected-page";
import { getQuickLink } from "../../../../data/quick-links";
import { Role, useAuth } from "@/app/auth-context";

export default function UserInternalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const data = getQuickLink(params.id);
  const { authState, isHydrated } = useAuth();
  const isAuthenticated = authState.status === "authenticated";
  const role: Role | undefined = isAuthenticated ? authState.user.role : undefined;
  const queryIdRaw = searchParams?.id;
  const queryNameRaw = searchParams?.name;
  const queryId = Array.isArray(queryIdRaw) ? queryIdRaw[0] : queryIdRaw;
  const queryName = Array.isArray(queryNameRaw) ? queryNameRaw[0] : queryNameRaw;

  if (!data) {
    notFound();
  }

  return (
    <ProtectedPage
      allowedRoles={["user", "admin"]}
      title={`Quick link #${params.id}`}
      subtitle="Contextual resources surfaced inside the team workspace."
    >
      <Flex direction="column" gap="4">
        <Heading size="6">{data.title}</Heading>
        <Text size="3" color="gray">
          {data.description}
        </Text>

        <Separator size="4" />

        <Card variant="ghost">
          <Flex direction="column" gap="3">
            <Flex direction="row" gap="6" align="center" justify="between" wrap="wrap">
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Authenticated
                </Text>
                <Text size="4" weight="medium">
                  {isHydrated ? (isAuthenticated ? "Yes" : "No") : "Loading..."}
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Role
                </Text>
                <Text size="4" weight="medium">
                  {isHydrated ? role ?? "Unavailable" : "Loading..."}
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Link identifier
                </Text>
                <Text size="4" weight="medium">
                  {params.id}
                </Text>
              </Flex>
            </Flex>

            <Text size="2" color="gray">
              Use the ID to deep link specific quick-link entries or to sync with external docs.
            </Text>
          </Flex>
        </Card>

        <Flex gap="3" wrap="wrap">
          <Button variant="soft" asChild>
            <Link href="/user">Back to workspace</Link>
          </Button>
          <Button variant="soft" asChild>
            <Link href="/todo">Jump to todo board</Link>
          </Button>
        </Flex>

        <Separator size="4" />

        <Card variant="ghost">
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Query parameters
            </Text>
            <Flex direction="row" gap="6" wrap="wrap">
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  id
                </Text>
                <Text size="4" weight="medium">
                  {queryId ?? "Not provided"}
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  name
                </Text>
                <Text size="4" weight="medium">
                  {queryName ?? "Not provided"}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </ProtectedPage>
  );
}
