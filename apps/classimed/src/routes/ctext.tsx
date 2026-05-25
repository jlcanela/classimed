import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ctext")({
  component: DesignRoute,
});

function DesignRoute() {
  const designSrc = 'https://ctext.org/huangdi-neijing/yin-yang-ying-xiang-da-lun/zhs';

  return (
    <Box h="calc(100vh - 120px)">
      <iframe
        title="ctext.org - Huangdi Neijing: Yin Yang Ying Xiang Da Lun"
        src={designSrc}
        style={{ width: "100%", height: "100%", border: 0, background: "white" }}
      />
    </Box>
  );
}

// https://github.com/garychowcmu/daizhigev20
// https://github.com/NiuTrans/Classical-Modern/tree/main
// https://github.com/direct-phonology/ect-krp/tree/main
// https://huggingface.co/datasets/astra77/huaxia-lib
// https://huggingface.co/datasets/KaifengGGG/WenYanWen_English_Parallel
