/** @jest-environment node */

import { hasAdminAllowlist, isAdminEmail } from "@/lib/auth/admin";

describe("admin allowlist", () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  afterAll(() => {
    if (originalAdminEmails === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = originalAdminEmails;
    }
  });

  it("fails closed when ADMIN_EMAILS is not configured", () => {
    expect(hasAdminAllowlist()).toBe(false);
    expect(isAdminEmail("anyone@example.com")).toBe(false);
  });

  it("matches emails case-insensitively when allowlist exists", () => {
    process.env.ADMIN_EMAILS = "admin@example.com, owner@example.com";

    expect(hasAdminAllowlist()).toBe(true);
    expect(isAdminEmail("ADMIN@example.com")).toBe(true);
    expect(isAdminEmail("owner@example.com")).toBe(true);
    expect(isAdminEmail("other@example.com")).toBe(false);
  });

  it("ignores empty and spaced entries in allowlist", () => {
    process.env.ADMIN_EMAILS = "  admin@example.com, , OWNER@example.com ,  ,";

    expect(hasAdminAllowlist()).toBe(true);
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail("owner@example.com")).toBe(true);
    expect(isAdminEmail("missing@example.com")).toBe(false);
  });

  it("rejects empty input even when allowlist exists", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";

    expect(isAdminEmail("")).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });
});
