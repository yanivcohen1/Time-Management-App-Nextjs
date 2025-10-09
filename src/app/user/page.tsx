"use client";

import { useMemo, useState } from "react";
import { Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { ProtectedPage } from "../../components/protected-page";

export default function UserPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const breadcrumbItems: MenuItem[] = useMemo(
    () => [
      {
        label: "User",
        icon: "pi pi-home",
        command: () => {
          setIsVisible(true);
          router.push("/user");
        },
      },
      {
        label: "inter",
        command: () => {
          setIsVisible(false);
          router.push("/user/inter/2");
        },
      },
    ],
    [router]
  );

  const home: MenuItem = useMemo(
    () => ({
      icon: "pi pi-home",
      url: "/",
    }),
    []
  );

  return (
    <>
      <ProtectedPage
        allowedRoles={["user", "admin"]}
        title="Team workspace"
        subtitle="Plan your tasks, review progress, and share updates with your teammates."
      >
        <BreadCrumb model={breadcrumbItems} home={home} /> <br />
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

          {isVisible ? (
            <Flex direction="column" gap="3">
              <Heading size="4">Quick links</Heading>
              <Flex direction={{ initial: "column", sm: "row" }} gap="3" wrap="wrap">
                <Button variant="soft" asChild>
                  <Link href="/">Command center</Link>
                </Button>
                <Button variant="soft" asChild>
                  <Link href="/admin">Admin overview</Link>
                </Button>
                <Button variant="soft" color="blue" asChild>
                  <Link href="/user/inter/2">Handoff summary (ID 2)</Link>
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="2">
              <Heading size="4">Inter view active</Heading>
              <Text size="3" color="gray">
                You&apos;re exploring the handoff summary. Use the breadcrumb to jump back to the user
                workspace.
              </Text>
            </Flex>
          )}
        </Flex>
      </ProtectedPage>
    </>
  );
}
