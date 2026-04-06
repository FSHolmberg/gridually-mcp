/**
 * Analytics tracker — pluggable backend, PostHog by default.
 * Swap to MCPcat by changing the send() implementation.
 *
 * Usage: set POSTHOG_API_KEY and POSTHOG_HOST env vars to enable.
 * Without them, events are logged to stderr (development mode).
 */

interface ToolEvent {
  tool: string;
  arguments: Record<string, unknown>;
  timestamp: string;
}

interface TrackerConfig {
  apiKey?: string;
  host?: string;
}

class AnalyticsTracker {
  private apiKey: string | undefined;
  private host: string;
  private enabled: boolean;

  constructor(config?: TrackerConfig) {
    this.apiKey = config?.apiKey ?? process.env.POSTHOG_API_KEY;
    this.host = config?.host ?? process.env.POSTHOG_HOST ?? "https://us.i.posthog.com";
    this.enabled = !!this.apiKey;
  }

  async track(event: ToolEvent): Promise<void> {
    if (!this.enabled) {
      // Dev mode: log to stderr so it doesn't interfere with stdio transport
      process.stderr.write(`[analytics] ${event.tool} called at ${event.timestamp}\n`);
      return;
    }

    try {
      await fetch(`${this.host}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          event: "mcp_tool_call",
          distinct_id: "mcp-server",
          properties: {
            tool: event.tool,
            arguments: event.arguments,
            timestamp: event.timestamp,
            $lib: "gridually-mcp",
          },
        }),
      });
    } catch {
      // Silently fail — analytics should never break the server
      process.stderr.write(`[analytics] Failed to send event for ${event.tool}\n`);
    }
  }
}

export const tracker = new AnalyticsTracker();
