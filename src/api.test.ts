import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FALLBACK_CONFIG,
  FALLBACK_PROJECTS,
  parseConfig,
  parseHealth,
  parseProjects,
  sameProjects,
} from "./api.ts";

describe("parseConfig", () => {
  it("reads the live shape", () => {
    assert.deepEqual(
      parseConfig({ name: "1know2see", tagline: "Think deeper, see further", theme: "dark" }),
      FALLBACK_CONFIG,
    );
  });

  it("fills a missing tagline and rejects empty payloads", () => {
    assert.deepEqual(parseConfig({ name: "1know2see" }), {
      name: "1know2see",
      tagline: FALLBACK_CONFIG.tagline,
      theme: "dark",
    });
    assert.equal(parseConfig({}), null);
    assert.equal(parseConfig(null), null);
    assert.equal(parseConfig("nope"), null);
  });
});

describe("parseProjects", () => {
  it("keeps the known project and drops nameless rows", () => {
    const parsed = parseProjects({
      projects: [
        {
          id: 1,
          name: "1know2see API",
          description: "My first Cloudflare Workers and D1 project",
          status: "active",
          created_at: "2026-10-25 09:18:15",
        },
        { id: 2, description: "missing name" },
        { name: "   " },
      ],
    });
    assert.deepEqual(parsed, [
      {
        id: "1",
        name: "1know2see API",
        description: "My first Cloudflare Workers and D1 project",
        status: "active",
        created_at: "2026-10-25 09:18:15",
      },
    ]);
  });

  it("returns an empty list for an empty live collection and null when the shape is wrong", () => {
    assert.deepEqual(parseProjects({ projects: [] }), []);
    assert.equal(parseProjects({ items: [] }), null);
    assert.equal(parseProjects(undefined), null);
  });
});

describe("parseHealth", () => {
  it("accepts the live health payload", () => {
    assert.deepEqual(parseHealth({ status: "ok", service: "1know2see-api", version: "1.0.0" }), {
      ok: true,
      version: "1.0.0",
    });
  });

  it("treats anything else as offline", () => {
    assert.deepEqual(parseHealth({ status: "down" }), { ok: false, version: "" });
    assert.deepEqual(parseHealth(null), { ok: false, version: "" });
  });
});

describe("sameProjects", () => {
  it("matches the fallback to the live timestamp by calendar day", () => {
    assert.equal(
      sameProjects(FALLBACK_PROJECTS, [
        {
          ...FALLBACK_PROJECTS[0],
          id: "99",
          created_at: "2026-10-25 09:18:15",
        },
      ]),
      true,
    );
  });

  it("notices a new or edited project", () => {
    assert.equal(
      sameProjects(FALLBACK_PROJECTS, [
        { ...FALLBACK_PROJECTS[0], description: "A different description" },
      ]),
      false,
    );
    assert.equal(sameProjects(FALLBACK_PROJECTS, []), false);
  });
});
