"use client";

import { useCallback, useRef, useState } from "react";
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
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";
import MockAdapter from "axios-mock-adapter";
import { useAxiosLoadingBar } from "../hooks/useAxiosLoadingBar";
import { useAuth } from "./auth-context";

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
const mock = new MockAdapter(axios, { delayResponse: 1500 });
mock.onGet("/api/data").reply(200, { message: "Hello from in-memory API!" });

export default function Home() {
  const { authState } = useAuth();
  const isAuthenticated = authState.status === "authenticated";
  const role = isAuthenticated ? authState.user.role : undefined;
  const loadingBarRef = useRef<LoadingBarRef | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useAxiosLoadingBar(loadingBarRef);

  const handleMockRequest = useCallback(async () => {
    setResponseMessage(null);
    setErrorMessage(null);

    try {
      const { data } = await axios.get<{ message: string }>("/api/data");
      setResponseMessage(data.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";
      setErrorMessage(message);
    }
  }, []);

  return (
    <Container size="3" py={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="6">
        <LoadingBar color="var(--accent-9)" ref={loadingBarRef} shadow={true} />
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

        <Card size="3" variant="surface">
          <Flex direction={{ initial: "column", sm: "row" }} gap="4" align="center" justify="between">
            <Flex direction="column" gap="2">
              <Heading size="4">Demo mock request</Heading>
              <Text size="3" color="gray">
                Trigger a simulated network call to see the loading bar hook in action.
              </Text>
            </Flex>
            <Flex direction="column" gap="2" align={{ initial: "stretch", sm: "end" }} width="100%" style={{ maxWidth: "260px" }}>
              <Button size="3" variant="solid" onClick={handleMockRequest}>
                Fetch mock data
              </Button>
              {responseMessage && (
                <Text size="2" color="green">
                  {responseMessage}
                </Text>
              )}
              {errorMessage && (
                <Text size="2" color="red">
                  {errorMessage}
                </Text>
              )}
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
      </Flex>
    </Container>
  );
}
