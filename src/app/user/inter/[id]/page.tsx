import { notFound } from "next/navigation";
import { Button, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { ProtectedPage } from "../../../../components/protected-page";
import { getQuickLink } from "../../../../data/quick-links";

export default function UserInternalPage({ params }: { params: { id: string } }) {
  const data = getQuickLink(params.id);

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
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Link identifier
            </Text>
            <Text size="4" weight="medium">
              {params.id}
            </Text>
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
      </Flex>
    </ProtectedPage>
  );
}
