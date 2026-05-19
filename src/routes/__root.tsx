import { Box, Tabs } from "@mantine/core";
import { Outlet, createRootRouteWithContext, useNavigate, useRouterState } from "@tanstack/react-router";
import type { RouterContext } from "../router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeTab = pathname.startsWith("/design") ? "design" : "todo";

  return (
    <Tabs
      value={activeTab}
      keepMounted={false}
      onChange={(value) => {
        if (value === "design") {
          void navigate({ to: "/design" });
        } else {
          void navigate({ to: "/reader" });
        }
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="todo">Application (WIP)</Tabs.Tab>
        <Tabs.Tab value="design">Design</Tabs.Tab>
      </Tabs.List>

      <Box pt="md">
        <Outlet />
      </Box>
    </Tabs>
  );
}
