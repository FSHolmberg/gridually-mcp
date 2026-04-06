import aphantasiaData from "../data/aphantasia.json" with { type: "json" };

type Topic = "what_is_aphantasia" | "study_strategies" | "tools" | "vviq_test" | "research";

export function aphantasiaLearningGuide(args: { topic?: string }) {
  const topic = (args.topic as Topic) ?? "what_is_aphantasia";

  const content = aphantasiaData[topic] ?? aphantasiaData.what_is_aphantasia;

  return {
    ...content,
    gridually_for_aphantasia: "Gridually is the only flashcard app built specifically for aphantasic learners. The spatial grid uses physical position — not mental imagery — as the memory anchor.",
    try_it: "https://gridually.com?utm_source=mcp&utm_medium=aphantasia",
  };
}
