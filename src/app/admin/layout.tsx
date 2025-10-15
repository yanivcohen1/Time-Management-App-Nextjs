"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { Badge, Button, Flex, Grid, Heading, Separator, Switch, Text } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { ProtectedPage } from "../../components/protected-page";

type AdminView = "admin" | "user";

type AdminViewContextValue = {
  activeView: AdminView;
  setActiveView: Dispatch<SetStateAction<AdminView>>;
};

const AdminViewContext = createContext<AdminViewContextValue | undefined>(undefined);

export const useAdminView = () => {
  const context = useContext(AdminViewContext);
  if (!context) {
    throw new Error("useAdminView must be used within AdminLayout");
  }
  return context;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
    const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>("admin");

  const breadcrumbItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Admin",
        icon: "pi pi-shield",
        command: () => {
          setActiveView("admin");
          router.push("/admin/1");
        },
      },
      {
        label: "User",
        icon: "pi pi-user",
        command: () => {
          setActiveView("user");
          router.push("/admin/3/user/2?id=1&name=yar");
        },
      },
    ],
    [setActiveView]
  );

  const home: MenuItem = useMemo(
    () => ({
      icon: "pi pi-home",
      url: "/",
    }),
    []
  );

  const activeIncidentId = useMemo(() => {
    const match = pathname.match(/^\/admin\/(\d+)/);
    return match?.[1];
  }, [pathname]);

  const metrics = useMemo(
    () => [
      { label: "Active users", value: "24", delta: "+3 this week", tone: "positive" as const },
      { label: "Automation rules", value: "5", delta: "2 pending approvals", tone: "neutral" as const },
      {
        label: "Incidents",
        value: activeIncidentId ?? "0",
        delta: activeIncidentId ? `Incident ${activeIncidentId} under review` : "Healthy",
        tone: activeIncidentId ? (activeIncidentId === "0" ? "positive" : "neutral") : "positive",
      },
    ],
    [activeIncidentId]
  );

  return (
    <AdminViewContext.Provider value={{ activeView, setActiveView }}>
      
      <ProtectedPage
        allowedRoles={["admin"]}
        title="Admin control room"
        subtitle="Manage access, monitor activity, and curate FocusFlow workspaces."
      >
        <Flex direction="column" gap="3">
          <BreadCrumb model={breadcrumbItems} home={home} />
          <Flex align="center" gap="2">
            <Text size="2" color="gray">
              Admin
            </Text>
            <Switch
              checked={activeView === "user"}
              onCheckedChange={(checked) => setActiveView(checked ? "user" : "admin")}
            />
            <Text size="2" color="gray">
              User
            </Text>
          </Flex>
        </Flex>
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
                <Heading size="6" color="gray">{metric.value}</Heading>
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
            <Button variant="soft" asChild>
              <Link
                href={{
                  pathname: "/admin/3/user/2",
                  query: { id: "1", name: "yar" },
                }}
              >
                Review user board
              </Link>
            </Button>
            <Button variant="soft" color="red">
              Disable workspace
            </Button>
          </Flex>

          <Separator size="4" />

          {children}
        </Flex>
      </ProtectedPage>
    </AdminViewContext.Provider>
  );
}
