import {
  accountRegionForPlatform,
  normalizePlatformRegion,
  opggRegion,
} from "@/lib/riot/regions";

describe("riot regions", () => {
  it("normalizes EUW variations", () => {
    expect(normalizePlatformRegion("euw")).toBe("euw1");
    expect(normalizePlatformRegion("EUW1")).toBe("euw1");
  });

  it("maps to account region and op.gg region", () => {
    const platform = normalizePlatformRegion("euw1");
    expect(accountRegionForPlatform(platform)).toBe("europe");
    expect(opggRegion(platform)).toBe("euw");
  });
});
