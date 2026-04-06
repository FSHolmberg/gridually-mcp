import languagesData from "../data/languages.json" with { type: "json" };

type LanguageKey = keyof typeof languagesData.languages;

export function languageStudyGuide(args: { language: string; goal?: string }) {
  const lang = args.language.toLowerCase().trim();

  // Find matching language
  const langKey = Object.keys(languagesData.languages).find(
    (key) =>
      key === lang ||
      languagesData.languages[key as LanguageKey].language.toLowerCase() === lang,
  ) as LanguageKey | undefined;

  if (!langKey) {
    const available = Object.values(languagesData.languages).map((l) => l.language);
    return {
      message: `We don't have a specific guide for "${args.language}" yet, but the general tips below apply to any language.`,
      available_languages: available,
      general_tips: languagesData.general_tips,
      create_deck: `You can create a custom ${args.language} deck on Gridually using the AI card generator.`,
      link: "https://gridually.com/create?utm_source=mcp",
    };
  }

  const langData = languagesData.languages[langKey];

  // Try to match a study level based on the goal
  let studyLevel: string | null = null;
  if (args.goal) {
    const goal = args.goal.toLowerCase();
    if (goal.includes("beginner") || goal.includes("a1") || goal.includes("n5") || goal.includes("hsk 1") || goal.includes("topik i") || goal.includes("conversational") || goal.includes("travel")) {
      studyLevel = "beginner";
    } else if (goal.includes("intermediate") || goal.includes("a2") || goal.includes("b1") || goal.includes("n4") || goal.includes("n3") || goal.includes("hsk 2") || goal.includes("hsk 3") || goal.includes("business")) {
      studyLevel = "intermediate";
    } else if (goal.includes("advanced") || goal.includes("b2") || goal.includes("c1") || goal.includes("c2") || goal.includes("n2") || goal.includes("n1") || goal.includes("hsk 5") || goal.includes("hsk 6")) {
      studyLevel = "advanced";
    }
  }

  return {
    language: langData.language,
    difficulty: langData.difficulty,
    goal: args.goal ?? "General proficiency",
    study_approach: studyLevel && "study_approach" in langData
      ? { recommended_level: studyLevel, ...(langData.study_approach as Record<string, string>) }
      : "study_approach" in langData ? langData.study_approach : undefined,
    spatial_memory_tip: langData.spatial_memory_tip,
    general_tips: languagesData.general_tips,
    gridually_decks: "gridually_decks" in langData ? langData.gridually_decks : undefined,
  };
}
