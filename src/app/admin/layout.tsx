"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Badge, Button, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { ProtectedPage } from "../../components/protected-page";

const metrics = [
  { label: "Active users", value: "24", delta: "+3 this week", tone: "positive" },
  { label: "Automation rules", value: "5", delta: "2 pending approvals", tone: "neutral" },
  { label: "Incidents", value: "0", delta: "Healthy", tone: "positive" },
];

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
  const router = useRouter();
  const pathname = usePathname();
  const [activeView, setActiveView] = useState<AdminView>("admin");

  useEffect(() => {
    if (pathname.startsWith("/admin/user")) {
      setActiveView("user");
    } else {
      setActiveView("admin");
    }
  }, [pathname]);

  const breadcrumbItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Admin",
        icon: "pi pi-shield",
        command: () => {
          setActiveView("admin");
          router.push("/admin");
        },
      },
      {
        label: "User",
        icon: "pi pi-user",
        command: () => {
          setActiveView("user");
          router.push("/admin/user/2");
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
    <AdminViewContext.Provider value={{ activeView, setActiveView }}>
      
      <ProtectedPage
        allowedRoles={["admin"]}
        title="Admin control room"
        subtitle="Manage access, monitor activity, and curate FocusFlow workspaces."
      >
        <BreadCrumb model={breadcrumbItems} home={home} /> <br/>
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
            <Button variant="soft" asChild>
              <Link href="/admin/user/2">Review user board</Link>
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
