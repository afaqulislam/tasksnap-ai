import { afterEach, describe, expect, it, vi } from "vitest";
import { extractTasksFromInput } from "./ai";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function groqOk(content: string, finishReason = "stop") {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => ({
      choices: [{ message: { content }, finish_reason: finishReason }],
    }),
    text: async () => "",
  } as unknown as Response;
}

describe("extractTasksFromInput provider edge cases", () => {
  it("treats an empty 2xx completion as a provider failure, not 'no tasks'", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue(groqOk(""));
    vi.stubGlobal("fetch", fetchMock);

    await expect(extractTasksFromInput({ text: "anything" })).rejects.toMatchObject(
      {
        name: "ApiError",
        status: 502,
      },
    );
  });

  it("accepts an explicit empty task list as a legitimate result", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue(groqOk('{"tasks":[]}'));
    vi.stubGlobal("fetch", fetchMock);

    await expect(extractTasksFromInput({ text: "anything" })).resolves.toEqual([]);
  });
});