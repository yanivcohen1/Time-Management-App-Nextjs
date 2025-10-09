import { notFound } from "next/navigation";
import { Button, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { ProtectedPage } from "../../../../components/protected-page";

const QUICK_LINKS = {
  "1": {
    title: "Sprint kickoff checklist",
    description: "Prep stories, confirm owners, and align sprint goals.",
  },
  "2": {
    title: "Handoff summary",
    description: "Gather context, blockers, and deliverables before handoff.",
  },
  "3": {
    title: "Retrospective notes",
    description: "Capture wins, pain points, and experiments for the next cycle.",
  },
} as const;

type QuickLinkId = keyof typeof QUICK_LINKS;

export default function UserInternalPage({ params }: { params: { id: string } }) {
  const data = QUICK_LINKS[params.id as QuickLinkId];

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
