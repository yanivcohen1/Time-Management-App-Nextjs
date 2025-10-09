import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";

const MENU_ITEMS = [
  {
    slug: "todo",
    title: "FocusFlow Todos",
    description: "Capture tasks, track progress, and clear completed work.",
    badge: "Productivity",
  },
  {
    slug: "#",
    title: "Insights (coming soon)",
    description: "Progress analytics and trend lines to keep your team aligned.",
    disabled: true,
  },
  {
    slug: "#",
    title: "Automation (coming soon)",
    description: "Automate routine task hygiene with smart rules.",
    disabled: true,
  },
];

export default function Home() {
  return (
    <Container size="3" py={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="6">
        <Card size="3" variant="surface">
          <Flex
            direction={{ initial: "column", sm: "row" }}
            justify="between"
            align={{ sm: "center" }}
            gap="5"
          >
            <Flex direction="column" gap="2">
              <Heading size="7">Welcome to FocusFlow</Heading>
              <Text size="4" color="gray">
                Choose a workspace to jump right back into planning and execution.
              </Text>
            </Flex>
            <Flex direction="column" gap="2" align={{ sm: "end" }}>
              <Text size="2" color="gray">
                Tip
              </Text>
              <Text
                size="3"
                style={{ maxWidth: "32ch" }}
                color="gray"
              >
                Bookmark the Todo space for fast access or keep this menu as your command center.
              </Text>
            </Flex>
          </Flex>
        </Card>

        <Grid columns={{ initial: "1", sm: "2" }} gap="5">
          {MENU_ITEMS.map((item) => (
            <Card key={item.title} size="3" variant="surface">
              <Flex direction="column" gap="3" height="100%">
                <Flex align="center" gap="2">
                  <Heading size="5">{item.title}</Heading>
                  {item.badge && <Badge color="blue">{item.badge}</Badge>}
                </Flex>
                <Text size="3" color="gray">
                  {item.description}
                </Text>
                <Separator size="4" />
                <Box mt="auto">
                  {item.disabled ? (
                    <Button variant="outline" size="3" color="gray" disabled>
                      Coming soon
                    </Button>
                  ) : (
                    <Button size="3" variant="solid" asChild>
                      <Link href={`/${item.slug}`}>Open workspace</Link>
                    </Button>
                  )}
                </Box>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Container>
  );
}
