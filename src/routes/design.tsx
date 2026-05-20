import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/design")({
  component: DesignRoute,
});

function DesignRoute() {
  const designSrc = `${import.meta.env.BASE_URL}design/ClassiMed%20Translate.html`;

  return (
    <Box h="calc(100vh - 120px)">
      <iframe
        title="ClassiMed Translate Design"
        src={designSrc}
        style={{ width: "100%", height: "100%", border: 0, background: "white" }}
      />
    </Box>
  );
}
