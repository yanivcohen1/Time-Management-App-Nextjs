"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { ProtectedPage } from "../../components/protected-page";
import AddUserForm from "../AddUserForm";

type User = {
  id: number;
  name: string;
  email: string;
};

async function getUsers(): Promise<User[]> {
  const res = await axios.get<User[]>("/api/users", {
    headers: {
      "Cache-Control": "no-store",
    },
  });
  return res.data;
}

export default function UserPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const toastRef = useRef<Toast | null>(null);
  const usersRequestRef = useRef<Promise<User[]> | null>(null);

  useEffect(() => {
    if (!usersRequestRef.current) {
      usersRequestRef.current = getUsers();
    }

    let cancelled = false;

    usersRequestRef.current
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        usersRequestRef.current = null;

        const message =
          error instanceof Error ? error.message : "Unexpected error occurred";
        toastRef.current?.show({
          severity: "error",
          summary: "Failed to load users",
          detail: message,
          life: 3000,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
          router.push("/user/inter/2?id=3&name=tam");
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
        <Toast ref={toastRef} position="top-right" />
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
                  <Link
                    href={{
                      pathname: "/user/inter/2",
                      query: { id: "1", name: "yan" },
                    }}
                  >
                    Handoff summary (ID 2)
                  </Link>
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
        <Separator size="4" />
        <AddUserForm initialUsers={users} />
      </ProtectedPage>
    </>
  );
}
