import { describe, expect, it } from "vitest";
import {
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
  sanitizeMoroccanPhoneInput,
} from "./moroccanPhone";

describe("moroccan phone utils", () => {
  it("sanitizes unexpected characters while keeping a leading plus", () => {
    expect(sanitizeMoroccanPhoneInput("+(212) 6a1b23@45-678")).toBe(
      "+(212) 612345-678",
    );
  });

  it("normalizes +212 numbers to local format", () => {
    expect(normalizeMoroccanPhone("+212612345678")).toBe("0612345678");
  });

  it("normalizes 9-digit mobile numbers to local format", () => {
    expect(normalizeMoroccanPhone("612345678")).toBe("0612345678");
  });

  it("validates supported Moroccan mobile numbers", () => {
    expect(isValidMoroccanPhone("+212612345678")).toBe(true);
    expect(isValidMoroccanPhone("0512345678")).toBe(true);
    expect(isValidMoroccanPhone("0412345678")).toBe(false);
  });
});
