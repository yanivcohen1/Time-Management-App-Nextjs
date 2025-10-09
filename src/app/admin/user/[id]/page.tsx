import { notFound } from "next/navigation";
import { Badge, Button, Card, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { getQuickLink, QUICK_LINKS } from "../../../../data/quick-links";

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const quickLink = getQuickLink(params.id);

  if (!quickLink) {
    notFound();
  }

  const totalLinks = Object.keys(QUICK_LINKS).length;

  return (
    <Flex direction="column" gap="5">
      <Flex direction="column" gap="2">
        <Heading size="6">{quickLink.title}</Heading>
        <Text size="3" color="gray">
          {quickLink.description}
        </Text>
      </Flex>

      <Grid columns={{ initial: "1", sm: "3" }} gap="3">
        <Card>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              Total quick links
            </Text>
            <Heading size="5" color="gray">{totalLinks}</Heading>
            <Text size="2" color="gray">
              Use this page to audit which entries are available to users.
            </Text>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              Link identifier
            </Text>
            <Heading size="5" color="gray">{params.id}</Heading>
            <Text size="2" color="gray">
              Cross-reference the ID with change logs or external systems.
            </Text>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Status
            </Text>
            <Badge color="green">Active</Badge>
            <Text size="2" color="gray">
              All quick links are currently visible to workspace members.
            </Text>
          </Flex>
        </Card>
      </Grid>

      <Separator size="4" />

      <Flex gap="3" wrap="wrap">
        <Button variant="soft" asChild>
          <Link href="/admin">Back to admin overview</Link>
        </Button>
        <Button variant="soft" asChild>
          <Link href="/todo">Open todo board</Link>
        </Button>
        <Button variant="soft" color="orange">
          Impersonate user
        </Button>
      </Flex>
    </Flex>
  );
}
