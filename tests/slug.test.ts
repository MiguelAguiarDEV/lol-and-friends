import { slugify, withSlugSuffix } from "@/lib/utils/slug";

describe("slug utilities", () => {
  it("normalizes text into a url-safe slug", () => {
    expect(slugify("Reto EUW")).toBe("reto-euw");
  });

  it("removes accents and extra separators", () => {
    expect(slugify("Árbol Ñandú 2026")).toBe("arbol-nandu-2026");
  });

  it("adds numeric suffixes", () => {
    expect(withSlugSuffix("reto", 2)).toBe("reto-2");
  });
});
