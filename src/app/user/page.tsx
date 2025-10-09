import { Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { ProtectedPage } from "../../components/protected-page";

export default function UserPage() {
  return (
    <ProtectedPage
      allowedRoles={["user", "admin"]}
      title="Team workspace"
      subtitle="Plan your tasks, review progress, and share updates with your teammates."
    >
      <Flex direction="column" gap="4">
        <Flex direction={{ initial: "column", sm: "row" }} justify="between" gap="3">
          <Heading size="5">Daily focus</Heading>
          <Button size="3" asChild>
            <Link href="/todo">Open todo board</Link>
          </Button>
        </Flex>
        <Text size="3" color="gray">
          Keep your team aligned by reviewing the todo board and assigning next actions.
        </Text>

        <Separator size="4" />

        <Flex direction="column" gap="3">
          <Heading size="4">Quick links</Heading>
          <Flex direction={{ initial: "column", sm: "row" }} gap="3">
            <Button variant="soft" asChild>
              <Link href="/">Command center</Link>
            </Button>
            <Button variant="soft" asChild>
              <Link href="/admin">Admin overview</Link>
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </ProtectedPage>
  );
}
