import { describe, expect, it } from "vitest";
import { isMeaningfulOcrText } from "./ocr";

const ENGLISH_PARAGRAPH =
  "Please submit the quarterly report to the manager before Friday. " +
  "The design team needs the updated mockups reviewed and approved by tomorrow.";

const URDU_PARAGRAPH =
  "براہ کرم جمعہ سے پہلے کوارٹر رپورٹ مینیجر کو جمع کر دیں۔ " +
  "ڈیزین ٹیم کو تازہ تصاویر کا جائزہ لینا ہے اور آگے بڑھانا ہے۔";

const CHINESE_PARAGRAPH =
  "请在星期五之前把季度报告提交给经理审核，并且尽快完成设计团队的新方案确认和后续推进工作。";

const NUMBER_GARBAGE =
  "3849 20394 10293 84756 29384 10293 47586 29384 56291 04857 29384 61527";

describe("isMeaningfulOcrText", () => {
  it("accepts normal English OCR output", () => {
    expect(isMeaningfulOcrText(ENGLISH_PARAGRAPH)).toBe(true);
  });

  it("accepts Urdu text written in the Arabic script", () => {
    expect(isMeaningfulOcrText(URDU_PARAGRAPH)).toBe(true);
  });

  it("accepts Chinese text with no Latin letters at all", () => {
    expect(isMeaningfulOcrText(CHINESE_PARAGRAPH)).toBe(true);
  });

  it("rejects text shorter than the minimum length", () => {
    expect(isMeaningfulOcrText("too short")).toBe(false);
    expect(isMeaningfulOcrText("")).toBe(false);
    expect(isMeaningfulOcrText("   \n\t ")).toBe(false);
  });

  it("rejects digit and symbol noise above the length threshold", () => {
    expect(isMeaningfulOcrText(NUMBER_GARBAGE)).toBe(false);
    expect(
      isMeaningfulOcrText("!!! ??? --- ### $$$ %%% *** +++ === 42 99 81 73 20 66"),
    ).toBe(false);
  });

  it("rejects text where letters are below the ratio threshold", () => {
    const mostlyNumbers =
      "abc 12345678 90123456 78901234 56789012 34567890 12345678 90123";
    expect(isMeaningfulOcrText(mostlyNumbers)).toBe(false);
  });
});
