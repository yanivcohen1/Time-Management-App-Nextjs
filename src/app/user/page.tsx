"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import axios from "axios";
import Link from "next/link";
import { Toast } from "primereact/toast";
import { readJwtToken } from "@/lib-fe/jwt-storage";
import { ProtectedPage } from "../../components/protected-page";
import AddUserForm from "../AddUserForm";
import { useAuth } from "../auth-context";

type User = {
  id: number;
  name: string;
  email: string;
};

type UsersResponse = {
  users: User[];
};

async function getUsers(token: string): Promise<User[]> {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    Authorization: `Bearer ${token}`,
  };

  const res = await axios.get<UsersResponse>("/api/users", {
    headers,
  });
  return Array.isArray(res.data.users) ? res.data.users : [];
}

export default function UserPage() {
  const [isVisible] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const toastRef = useRef<Toast | null>(null);
  const usersRequestRef = useRef<Promise<User[]> | null>(null);
  const { authState, isHydrated } = useAuth();
  const isAuthenticated = authState.status === "authenticated";

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      return;
    }

    const token = readJwtToken();
    if (!token) {
      return;
    }

    if (!usersRequestRef.current) {
      usersRequestRef.current = getUsers(token);
    }

    let cancelled = false;

    usersRequestRef.current
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHydrated]);

  return (
    <>
      <ProtectedPage
        allowedRoles={["user", "admin"]}
        title="Team workspace"
        subtitle="Plan your tasks, review progress, and share updates with your teammates."
      >
        <Toast ref={toastRef} position="top-right" />
        {/* <BreadCrumb model={breadcrumbItems} home={home} /> <br /> */}
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
                  <Link href="/admin/1">Admin overview</Link>
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
