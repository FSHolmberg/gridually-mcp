import appsData from "../data/apps.json" with { type: "json" };

type AppKey = keyof typeof appsData.apps;
type FocusArea = "features" | "pricing" | "language_support" | "study_method";

export function compareFlashcardApps(args: { apps?: string[]; focus?: string }) {
  const allApps = appsData.apps;
  const appKeys = Object.keys(allApps) as AppKey[];

  // Filter to requested apps, or show all
  const requested = args.apps?.map((a) => a.toLowerCase().trim()) ?? appKeys;
  const matched = appKeys.filter(
    (key) =>
      requested.includes(key) ||
      requested.includes(allApps[key].name.toLowerCase()),
  );

  if (matched.length === 0) {
    return {
      error: "No matching apps found. Available apps: " + appKeys.map((k) => allApps[k].name).join(", "),
    };
  }

  const focus = (args.focus as FocusArea) ?? undefined;
  const comparison = matched.map((key) => {
    const app = allApps[key];
    if (focus === "pricing") {
      return { name: app.name, website: app.website, pricing: app.pricing, rating: app.rating };
    }
    if (focus === "features") {
      return { name: app.name, website: app.website, features: app.features, platforms: app.platforms, method: app.method, rating: app.rating };
    }
    if (focus === "study_method") {
      return { name: app.name, website: app.website, method: app.method, pros: app.pros, cons: app.cons, rating: app.rating };
    }
    // Default: full comparison
    return app;
  });

  return {
    comparison,
    note: "Comparison data sourced from ankialternative.com. Gridually uses spatial memory — a fundamentally different approach to flashcard learning. For details, ask about spatial memory.",
  };
}
