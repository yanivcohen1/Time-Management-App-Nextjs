"use client";

import {
  useCallback,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
} from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  DropdownMenu,
  Flex,
  Grid,
  Heading,
  Select,
  Separator,
  Text,
  Popover,
} from "@radix-ui/themes";
import * as Collapsible from "@radix-ui/react-collapsible";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChartSimple,
  faListCheck,
  faRobot,
  faShieldHalved,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Toast } from "primereact/toast";
import { useAuth } from "./auth-context";
import Sticky from "react-sticky-el";

type MenuItem = {
  slug?: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  requiredRoles?: Array<"user" | "admin">;
  callout?: string;
  icon: IconDefinition;
};

const MENU_ITEMS: MenuItem[] = [
  {
    slug: "todo",
    title: "FocusFlow Todos",
    description: "Capture tasks, track progress, and clear completed work.",
    badge: "Productivity",
    icon: faListCheck,
  },
  {
    slug: "user",
    title: "Team workspace",
    description: "Coordinate sprints, share updates, and keep the squad aligned.",
    badge: "Collaboration",
    requiredRoles: ["user", "admin"],
    icon: faUsers,
  },
  {
    slug: "admin",
    title: "Admin control room",
    description: "Manage access, monitor metrics, and configure automation rules.",
    badge: "Admin",
    requiredRoles: ["admin"],
    callout: "Requires admin role",
    icon: faShieldHalved,
  },
  {
    title: "Insights (coming soon)",
    description: "Progress analytics and trend lines to keep your team aligned.",
    disabled: true,
    icon: faChartSimple,
  },
  {
    title: "Automation (coming soon)",
    description: "Automate routine task hygiene with smart rules.",
    disabled: true,
    icon: faRobot,
  },
];

// mock a 1.5s delay for GET /api/data
const mock = new MockAdapter(axios, {
  delayResponse: 1500,
  onNoMatch: "passthrough",
});
mock.onGet("/api/data").reply(200, { message: "Hello from in-memory API!" });

const STICKY_PROMPT = "Do you want to save changes?";

const ThemedPopoverTrigger = Popover.Trigger as unknown as (
  props: ComponentProps<typeof Popover.Trigger> & { asChild?: boolean }
) => ReactElement;

const ThemedPopoverClose = Popover.Close as unknown as (
  props: ComponentProps<typeof Popover.Close> & { asChild?: boolean }
) => ReactElement;

const ThemedDropdownTrigger = DropdownMenu.Trigger as unknown as (
  props: ComponentProps<typeof DropdownMenu.Trigger> & { asChild?: boolean }
) => ReactElement;

export default function Home() {
  const { authState } = useAuth();
  const isAuthenticated = authState.status === "authenticated";
  const role = isAuthenticated ? authState.user.role : undefined;
  const toastRef = useRef<Toast | null>(null);
  const [showSelectBox, setShowSelectBox] = useState(false);
  const [selectedOption, setSelectedOption] = useState("one");
  const [confirmedOption, setConfirmedOption] = useState<string | null>(null);
  const [selectBoxOnTop, setSelectBoxOnTop] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(true);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [stickyAnswer, setStickyAnswer] = useState<string | null>(null);
  const [quickSaveChoice, setQuickSaveChoice] = useState<string | null>(null);
  const [savePopoverChoice, setSavePopoverChoice] = useState<string | null>(
    null
  );

  const handleMockRequest = useCallback(async () => {
    try {
      const { data } = await axios.get<{ message: string }>("/api/data");
      toastRef.current?.show({
        severity: "success",
        summary: "Mock response received",
        detail: data.message,
        life: 2000,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";
      toastRef.current?.show({
        severity: "error",
        summary: "Request failed",
        detail: message,
        life: 3000,
      });
    }
  }, []);

  const handleStickyAnswer = useCallback((answer: "Yes" | "No") => {
    setStickyAnswer(answer);
    setIsStickyVisible(false);
  }, []);

  return (
    <Container size="3" py={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="6">
        <Toast ref={toastRef} position="top-right" />
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

        {isStickyVisible && (
          <Box
            style={{
              marginTop: "calc(var(--space-6, 24px) * -1)",
              marginBottom: "calc(var(--space-6, 24px) * -1)",
            }}
          >
            <Sticky
              topOffset={-24}
              stickyStyle={{
                zIndex: 1,
              }}
            >
              <Card
                size="2"
                variant="surface"
                style={{
                  borderLeft: "4px solid var(--accent-9)",
                  width: "fit-content",
                  maxWidth: "100%",
                  margin: "0 auto",
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(59, 130, 246, 0.06))",
                  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.15)",
                }}
              >
                <Flex align="center" justify="center" gap="3" wrap="wrap">
                  <Text size="3" color="gray" style={{ flex: "0 1 auto", textAlign: "center" }}>
                    {STICKY_PROMPT}
                  </Text>
                  <Flex gap="2">
                    <Button variant="soft" size="2" onClick={() => handleStickyAnswer("Yes")}>
                      Yes
                    </Button>
                    <Button variant="soft" size="2" color="red" onClick={() => handleStickyAnswer("No")}>
                      No
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            </Sticky>
          </Box>
        )}

        <Card size="3" variant="surface">
          <Flex direction={{ initial: "column", sm: "row" }} gap="4" align="center" justify="between">
            <Flex direction="column" gap="2">
              <Heading size="4">Demo mock request</Heading>
              <Text size="3" color="gray">
                Trigger a simulated network call to see the loading bar hook in action.
              </Text>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Last selection: {confirmedOption ?? "None yet"}
                </Text>
                {stickyAnswer && (
                  <Text size="2" color="gray">
                    Answer: {stickyAnswer}
                  </Text>
                )}
                {savePopoverChoice && (
                  <Text size="2" color="gray">
                    Save popover choice: {savePopoverChoice}
                  </Text>
                )}
                <Text size="2" color="gray">
                  Quick save choice: {quickSaveChoice ?? "None yet"}
                </Text>
              </Flex>
            </Flex>
            <Flex direction="column" gap="2" align={{ initial: "stretch", sm: "end" }} width="100%" style={{ maxWidth: "260px" }}>
              <Button size="3" variant="solid" onClick={handleMockRequest}>
                Fetch mock data
              </Button>
              <Button
                size="3"
                variant="soft"
                onClick={() => setIsStickyVisible((prev) => !prev)}
              >
                {isStickyVisible ? "Hide sticky note" : "Show sticky note"}
              </Button>
              <Collapsible.Root
                open={isCollapsibleOpen}
                onOpenChange={setIsCollapsibleOpen}
                style={{ width: "100%", alignSelf: "stretch" }}
              >
                <Flex justify="end" style={{ width: "100%" }}>
                  <Collapsible.Trigger asChild>
                    <Button size="3" variant="soft" style={{ marginLeft: "auto" }}>
                      {isCollapsibleOpen
                        ? "Hide collapsible note"
                        : "Show collapsible note"}
                    </Button>
                  </Collapsible.Trigger>
                </Flex>
                <Collapsible.Content
                  className="collapsible-content"
                  style={{ marginTop: "var(--space-2)" }}
                >
                  <Card size="2" variant="surface">
                    <Text size="2" color="gray">
                      Keep quick reminders here while testing interactions—collapse it once you’re done.
                    </Text>
                  </Card>
                </Collapsible.Content>
              </Collapsible.Root>
              <Popover.Root>
                {/* Use the themed button as trigger even though typings omit asChild. */}
                <ThemedPopoverTrigger asChild>
                  <Button size="3" variant="soft">Show save popover</Button>
                </ThemedPopoverTrigger>
                <Popover.Content size="2" align="end">
                  <Flex direction="column" gap="3">
                    <Text size="3" weight="medium">
                      Save changes?
                    </Text>
                    <Flex justify="end" gap="2">
                      <ThemedPopoverClose asChild>
                        <Button
                          size="2"
                          variant="soft"
                          color="gray"
                          onClick={() => setSavePopoverChoice("No")}
                        >
                          No
                        </Button>
                      </ThemedPopoverClose>
                      <ThemedPopoverClose asChild>
                        <Button
                          size="2"
                          variant="solid"
                          onClick={() => setSavePopoverChoice("Yes")}
                        >
                          Yes
                        </Button>
                      </ThemedPopoverClose>
                    </Flex>
                  </Flex>
                </Popover.Content>
              </Popover.Root>
              <DropdownMenu.Root>
                <ThemedDropdownTrigger asChild>
                  <Button size="3" variant="soft">Quick save menu</Button>
                </ThemedDropdownTrigger>
                <DropdownMenu.Content align="end" loop>
                  <DropdownMenu.Item onSelect={() => setQuickSaveChoice("Save")}>
                    Save
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => setQuickSaveChoice("No Save")}>
                    No save
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <Button
                size="3"
                variant="soft"
                onClick={() => setShowSelectBox((prev) => !prev)}
              >
                {showSelectBox ? "Hide select box" : "Show select box"}
              </Button>
              <Flex align="center" gap="2">
                <Checkbox
                  checked={selectBoxOnTop}
                  onCheckedChange={(checked) =>
                    setSelectBoxOnTop(checked === true)
                  }
                  id="toggle-select-position"
                />
                <Text
                  asChild
                  size="2"
                  color="gray"
                  style={{ cursor: "pointer" }}
                >
                  <label htmlFor="toggle-select-position">Show select box at top</label>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>

        <Grid columns={{ initial: "1", sm: "2" }} gap="5">
          {MENU_ITEMS.map((item) => {
            const allowed = item.requiredRoles
              ? isAuthenticated && role && item.requiredRoles.includes(role)
              : true;
            const showLoginCta = item.requiredRoles && !isAuthenticated;

            return (
              <Card key={item.title} size="3" variant="surface">
              <Flex direction="column" gap="3" height="100%">
                <Flex align="center" gap="3">
                  <Box
                    aria-hidden="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "var(--radius-3)",
                      backgroundColor: "var(--accent-a3)",
                      color: "var(--accent-11)",
                    }}
                  >
                    <FontAwesomeIcon icon={item.icon} size="lg" />
                  </Box>
                  <Flex align="center" gap="2">
                    <Heading size="5">{item.title}</Heading>
                    {item.badge && <Badge color="blue">{item.badge}</Badge>}
                  </Flex>
                </Flex>
                <Text size="3" color="gray">
                  {item.description}
                </Text>
                {item.callout && (
                  <Text size="2" color="gray">
                    {item.callout}
                  </Text>
                )}
                <Separator size="4" />
                <Box mt="auto">
                  {item.disabled ? (
                    <Button variant="outline" size="3" color="gray" disabled>
                      Coming soon
                    </Button>
                  ) : showLoginCta ? (
                    <Button size="3" variant="soft" color="blue" asChild>
                      <Link href="/login">Log in to access</Link>
                    </Button>
                  ) : item.slug && allowed ? (
                    <Button size="3" variant="solid" asChild>
                      <Link href={`/${item.slug}`}>Open workspace</Link>
                    </Button>
                  ) : (
                    <Button size="3" variant="outline" color="gray" disabled>
                      Requires elevated access
                    </Button>
                  )}
                </Box>
              </Flex>
              </Card>
            );
          })}
        </Grid>
        {showSelectBox && (
          <div
            style={{
              position: "fixed",
              bottom: selectBoxOnTop ? "auto" : 0,
              top: selectBoxOnTop ? "16px" : "auto",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--color-surface)",
              padding: "16px",
              boxShadow: selectBoxOnTop
                ? "0 2px 5px rgba(0,0,0,0.3)"
                : "0 -2px 5px rgba(0,0,0,0.3)",
              marginTop: selectBoxOnTop ? "0" : "16px",
              textAlign: "center",
              zIndex: 1000,
              borderRadius: "var(--radius-4)",
              minWidth: "240px",
            }}
          >
            <Heading as="h6" size="2" style={{ marginBottom: "12px" }} color="gray">
              Select an option:
            </Heading>
            <Flex align="center" justify="center" gap="3">
              <Select.Root value={selectedOption} onValueChange={setSelectedOption}>
                <Select.Trigger
                  variant="surface"
                  placeholder="Choose"
                  aria-label="Select option"
                />
                <Select.Content position="popper">
                  <Select.Item value="one">One</Select.Item>
                  <Select.Item value="two">Two</Select.Item>
                  <Select.Item value="tree">Tree</Select.Item>
                </Select.Content>
              </Select.Root>
              <Button
                size="2"
                onClick={() => {
                  setConfirmedOption(selectedOption);
                  console.log("Selected:", selectedOption);
                  setShowSelectBox(false);
                }}
              >
                Accept
              </Button>
            </Flex>
          </div>
        )}
      </Flex>
    </Container>
  );
}
