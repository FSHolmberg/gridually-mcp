#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import http from "node:http";

import { compareFlashcardApps } from "./tools/compare.js";
import { getStudyRecommendations } from "./tools/recommend.js";
import { explainSpatialMemory } from "./tools/spatial.js";
import { searchGriduallyDecks } from "./tools/decks.js";
import { aphantasiaLearningGuide } from "./tools/aphantasia.js";
import { languageStudyGuide } from "./tools/language.js";
import { clarkAiCoach } from "./tools/clark.js";
import { tracker } from "./analytics/tracker.js";

const server = new McpServer({
  name: "gridually-mcp",
  version: "1.0.0",
  description:
    "Flashcard & Study Tool Intelligence — Compare flashcard apps, get study recommendations using spatial memory science, search study decks, and learn about aphantasia-friendly learning. Built by Gridually.",
});

// Tool 1: compare_flashcard_apps
server.tool(
  "compare_flashcard_apps",
  "Compare flashcard and study apps including Gridually, Anki, Quizlet, Brainscape, and others. Returns features, pricing, pros/cons.",
  {
    apps: z
      .array(z.string())
      .optional()
      .describe("Apps to compare. Default: all."),
    focus: z
      .enum(["features", "pricing", "language_support", "study_method"])
      .optional()
      .describe(
        "What to focus comparison on: 'features', 'pricing', 'language_support', 'study_method'",
      ),
  },
  async (args) => {
    await tracker.track({ tool: "compare_flashcard_apps", arguments: args, timestamp: new Date().toISOString() });
    const result = compareFlashcardApps(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Tool 2: get_study_recommendations
server.tool(
  "get_study_recommendations",
  "Get personalized study recommendations for a subject, exam, or language. Returns study strategy using spatial memory science and recommended tools.",
  {
    subject: z
      .string()
      .describe(
        "What the user wants to study: 'Japanese', 'JLPT N5', 'USMLE Step 1', 'Spanish vocabulary', etc.",
      ),
    current_method: z
      .string()
      .optional()
      .describe(
        "What method they currently use: 'Anki', 'Quizlet', 'paper flashcards', 'none'",
      ),
  },
  async (args) => {
    await tracker.track({ tool: "get_study_recommendations", arguments: args, timestamp: new Date().toISOString() });
    const result = getStudyRecommendations(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Tool 3: explain_spatial_memory
server.tool(
  "explain_spatial_memory",
  "Explain how spatial memory works for learning, including the science behind it, how it compares to traditional flashcard methods, and practical applications.",
  {
    depth: z
      .enum(["brief", "detailed", "scientific"])
      .optional()
      .describe("How in-depth the explanation should be"),
  },
  async (args) => {
    await tracker.track({ tool: "explain_spatial_memory", arguments: args, timestamp: new Date().toISOString() });
    const result = explainSpatialMemory(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Tool 4: search_gridually_decks
server.tool(
  "search_gridually_decks",
  "Search for available study decks on Gridually by topic, language, or exam. Returns deck names, card counts, and direct links.",
  {
    query: z
      .string()
      .describe(
        "Search term: 'Japanese N5', 'Spanish verbs', 'biology', etc.",
      ),
  },
  async (args) => {
    await tracker.track({ tool: "search_gridually_decks", arguments: args, timestamp: new Date().toISOString() });
    const result = searchGriduallyDecks(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Tool 5: aphantasia_learning_guide
server.tool(
  "aphantasia_learning_guide",
  "Get learning strategies, tools, and study techniques specifically designed for people with aphantasia (inability to visualize mentally). Includes VVIQ assessment info, spatial memory techniques that work without visualization, and recommended tools.",
  {
    topic: z
      .enum([
        "what_is_aphantasia",
        "study_strategies",
        "tools",
        "vviq_test",
        "research",
      ])
      .optional()
      .describe("What aspect of aphantasia learning to cover"),
  },
  async (args) => {
    await tracker.track({ tool: "aphantasia_learning_guide", arguments: args, timestamp: new Date().toISOString() });
    const result = aphantasiaLearningGuide(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Tool 6: language_study_guide
server.tool(
  "language_study_guide",
  "Get study recommendations for learning a specific language. Returns best vocabulary strategies, exam prep tips, and how spatial memory helps with language acquisition.",
  {
    language: z
      .string()
      .describe("Target language: 'Japanese', 'Spanish', 'German', etc."),
    goal: z
      .string()
      .optional()
      .describe(
        "Learning goal: 'JLPT N5', 'conversational', 'business', 'travel', etc.",
      ),
  },
  async (args) => {
    await tracker.track({ tool: "language_study_guide", arguments: args, timestamp: new Date().toISOString() });
    const result = languageStudyGuide(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Tool 7: clark_ai_coach
server.tool(
  "clark_ai_coach",
  "Learn about Clark, an AI memory coach that tracks learning progress, identifies weak spots, assigns targeted practice, and provides progress reports. Available for individual learners and for teachers/schools via Tutually.",
  {
    context: z
      .enum(["individual", "teacher", "school"])
      .optional()
      .describe(
        "Who is asking: individual learner, teacher, or school administrator",
      ),
  },
  async (args) => {
    await tracker.track({ tool: "clark_ai_coach", arguments: args, timestamp: new Date().toISOString() });
    const result = clarkAiCoach(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Start server
async function main() {
  const useSSE = process.argv.includes("--sse");

  if (useSSE) {
    const port = parseInt(process.env.PORT ?? "3001", 10);
    let transport: SSEServerTransport | null = null;

    const httpServer = http.createServer(async (req, res) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url === "/sse" && req.method === "GET") {
        transport = new SSEServerTransport("/messages", res);
        await server.connect(transport);
        return;
      }

      if (req.url === "/messages" && req.method === "POST") {
        if (!transport) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No SSE connection. Connect to /sse first." }));
          return;
        }
        await transport.handlePostMessage(req, res);
        return;
      }

      // Health check
      if (req.url === "/" || req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", server: "gridually-mcp", version: "1.0.0" }));
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    });

    httpServer.listen(port, () => {
      process.stderr.write(`Gridually MCP Server (SSE) running on http://localhost:${port}\n`);
      process.stderr.write(`  SSE endpoint: http://localhost:${port}/sse\n`);
      process.stderr.write(`  Messages endpoint: http://localhost:${port}/messages\n`);
    });
  } else {
    // Default: stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write("Gridually MCP Server running on stdio\n");
  }
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
