import { Badge, Button, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { ProtectedPage } from "../../components/protected-page";

const metrics = [
  { label: "Active users", value: "24", delta: "+3 this week", tone: "positive" },
  { label: "Automation rules", value: "5", delta: "2 pending approvals", tone: "neutral" },
  { label: "Incidents", value: "0", delta: "Healthy", tone: "positive" },
];

export default function AdminPage() {
  return (
    <ProtectedPage
      allowedRoles={["admin"]}
      title="Admin control room"
      subtitle="Manage access, monitor activity, and curate FocusFlow workspaces."
    >
      <Flex direction="column" gap="4">
        <Heading size="5">Key metrics</Heading>
        <Grid columns={{ initial: "1", sm: "3" }} gap="3">
          {metrics.map((metric) => (
            <Flex
              key={metric.label}
              direction="column"
              gap="2"
              p="3"
              style={{ borderRadius: "var(--radius-4)", background: "var(--slate-2)" }}
            >
              <Text size="2" color="gray">
                {metric.label}
              </Text>
              <Heading size="6">{metric.value}</Heading>
              <Badge color={metric.tone === "positive" ? "green" : "gray"}>{metric.delta}</Badge>
            </Flex>
          ))}
        </Grid>

        <Separator size="4" />

        <Flex direction={{ initial: "column", sm: "row" }} gap="3">
          <Button variant="soft" asChild>
            <Link href="/user">Switch to user view</Link>
          </Button>
          <Button variant="soft" asChild>
            <Link href="/todo">Review todo board</Link>
          </Button>
          <Button variant="soft" color="red">
            Disable workspace
          </Button>
        </Flex>
      </Flex>
    </ProtectedPage>
  );
}
