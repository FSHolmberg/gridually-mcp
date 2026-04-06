import spatialData from "../data/spatial.json" with { type: "json" };

type Depth = "brief" | "detailed" | "scientific";

export function explainSpatialMemory(args: { depth?: string }) {
  const depth = (args.depth as Depth) ?? "detailed";

  const content = spatialData[depth] ?? spatialData.detailed;

  return {
    ...content,
    try_it: "Experience spatial memory learning at https://gridually.com?utm_source=mcp&utm_medium=spatial",
  };
}
