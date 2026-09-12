import { describe, expect, it } from "vitest";
import { stripMarkdownToText } from "../lib/content/markdown-text";

describe("stripMarkdownToText", () => {
  it("strips fenced code blocks", () => {
    const input = "Before\n```js\nconst x = 1 < 2;\n```\nAfter";
    const output = stripMarkdownToText(input);
    expect(output).toContain("Before");
    expect(output).toContain("After");
    expect(output).not.toContain("const");
  });

  it("keeps link and image labels", () => {
    const input = "See [docs](https://example.com) and ![alt text](img.png)";
    const output = stripMarkdownToText(input);
    expect(output).toContain("docs");
    expect(output).toContain("alt text");
    expect(output).not.toContain("https://example.com");
  });

  it("strips headings, lists, and blockquotes", () => {
    const input = "## Title\n- one\n1. two\n> quote";
    const output = stripMarkdownToText(input);
    expect(output).toContain("Title");
    expect(output).toContain("one");
    expect(output).toContain("two");
    expect(output).toContain("quote");
    expect(output).not.toContain("#");
  });

  it("strips emphasis and collapses whitespace", () => {
    const input = "**bold** _italic_ \n\n    spaced";
    const output = stripMarkdownToText(input);
    expect(output).toContain("bold");
    expect(output).toContain("italic");
    expect(output).toContain("spaced");
    expect(output.trim()).toBe(output);
    expect(/\s{2,}/.test(output)).toBe(false);
  });

  it("preserves prose inside MDX component tags", () => {
    const input = "<Callout>\nKeep this prose\n</Callout>";
    const output = stripMarkdownToText(input);
    expect(output).toContain("Keep this prose");
  });
});
