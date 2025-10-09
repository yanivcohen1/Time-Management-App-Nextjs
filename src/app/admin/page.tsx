"use client";

import { Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import Link from "next/link";
import { QUICK_LINKS } from "../../data/quick-links";
import { useAdminView } from "./layout";

export default function AdminPage() {
  const { activeView } = useAdminView();

  return (
    <Flex direction="column" gap="3">
      {activeView === "admin" ? (
        <Flex direction="column" gap="3">
          <Heading size="5">Quick link directory</Heading>
          <Text size="2" color="gray">
            Preview the user-facing quick links and deep dive into specific entries.
          </Text>
          <Grid columns={{ initial: "1", md: "2" }} gap="3">
            {Object.entries(QUICK_LINKS).map(([id, link]) => (
              <Card key={id} variant="surface">
                <Flex direction="column" gap="2">
                  <Flex direction="column" gap="1">
                    <Text size="2" color="gray">
                      Quick link #{id}
                    </Text>
                    <Heading size="4">{link.title}</Heading>
                    <Text size="2" color="gray">
                      {link.description}
                    </Text>
                  </Flex>
                  <Flex>
                    <Button variant="soft" size="2" asChild>
                      <Link href={`/admin/user/${id}`}>Open admin view</Link>
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          <Heading size="5">User view active</Heading>
          <Text size="2" color="gray">
            You&apos;re reviewing content from the user workspace. Use the breadcrumb to return to the
            admin directory.
          </Text>
          <Flex gap="2" wrap="wrap">
            <Button variant="soft" asChild>
              <Link href="/user">Open user workspace</Link>
            </Button>
            <Button variant="soft" asChild>
              <Link href="/todo">Open todo board</Link>
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
