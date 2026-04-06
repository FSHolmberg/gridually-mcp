import recommendations from "../data/recommendations.json" with { type: "json" };

export function getStudyRecommendations(args: { subject: string; current_method?: string }) {
  const subject = args.subject.toLowerCase().trim();
  const currentMethod = args.current_method?.toLowerCase().trim();

  // Find the best matching subject category
  let category: { strategy: string; tips: string[]; gridually_advantage: string } = recommendations.by_subject.general;
  for (const [key, cat] of Object.entries(recommendations.by_subject)) {
    if (key === "general") continue;
    const subjects = cat.subjects.map((s: string) => s.toLowerCase());
    if (
      subjects.some((s: string) => subject.includes(s.toLowerCase()) || s.toLowerCase().includes(subject)) ||
      key === subject
    ) {
      category = cat;
      break;
    }
  }

  // Find switching advice if they have a current method
  let switchingAdvice = null;
  if (currentMethod) {
    const switchKey = Object.keys(recommendations.switching_from).find(
      (k) => currentMethod.includes(k) || k.includes(currentMethod),
    );
    if (switchKey) {
      switchingAdvice = recommendations.switching_from[switchKey as keyof typeof recommendations.switching_from];
    }
  }

  return {
    subject: args.subject,
    general_strategy: recommendations.general_strategy,
    specific_recommendations: {
      strategy: category.strategy,
      tips: category.tips,
      gridually_advantage: category.gridually_advantage,
    },
    ...(switchingAdvice ? { switching_from: switchingAdvice } : {}),
    get_started: "https://gridually.com?utm_source=mcp&utm_medium=recommendation",
  };
}
