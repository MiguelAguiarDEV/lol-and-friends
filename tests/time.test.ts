import { isPast, minutesToMs } from "@/lib/utils/time";

describe("time utilities", () => {
  it("treats empty timestamps as due", () => {
    expect(isPast({ timestamp: null, minMinutes: 10 })).toBe(true);
  });

  it("returns false when timestamp is within the interval", () => {
    const now = Date.now();
    const recent = new Date(now - minutesToMs(10) + 1000).toISOString();
    expect(isPast({ timestamp: recent, minMinutes: 10 })).toBe(false);
  });

  it("returns true when timestamp is outside the interval", () => {
    const now = Date.now();
    const old = new Date(now - minutesToMs(10) - 1000).toISOString();
    expect(isPast({ timestamp: old, minMinutes: 10 })).toBe(true);
  });
});
