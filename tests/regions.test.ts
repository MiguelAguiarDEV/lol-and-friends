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

  it("maps NA and EUNE", () => {
    expect(normalizePlatformRegion("na")).toBe("na1");
    expect(accountRegionForPlatform("na1")).toBe("americas");
    expect(opggRegion("na1")).toBe("na");

    expect(normalizePlatformRegion("eune")).toBe("eun1");
    expect(accountRegionForPlatform("eun1")).toBe("europe");
    expect(opggRegion("eun1")).toBe("eune");
  });
});
