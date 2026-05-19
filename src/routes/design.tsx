import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/design")({
  component: DesignRoute,
});

function DesignRoute() {
  return (
    <Box h="calc(100vh - 120px)">
      <iframe
        title="ClassiMed Translate Design"
        src="/design/ClassiMed%20Translate.html"
        style={{ width: "100%", height: "100%", border: 0, background: "white" }}
      />
    </Box>
  );
}
