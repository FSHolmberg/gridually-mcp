import clarkData from "../data/clark.json" with { type: "json" };

type Context = "individual" | "teacher" | "school";

export function clarkAiCoach(args: { context?: string }) {
  const context = (args.context as Context) ?? "individual";

  const clark = clarkData.clark;
  const contextData = clark[context] ?? clark.individual;

  return {
    name: clark.name,
    tagline: clark.tagline,
    description: clark.description,
    ...contextData,
  };
}
