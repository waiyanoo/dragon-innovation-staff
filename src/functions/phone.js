const MYANMAR_DIGITS = "၀၁၂၃၄၅၆၇၈၉";

const toAsciiDigits = (value) =>
  String(value || "").replace(/[၀-၉]/g, (digit) => String(MYANMAR_DIGITS.indexOf(digit)));

// Canonical local Myanmar mobile format: 09 followed by 7-9 digits.
export const normalizeMyanmarPhone = (value) => {
  const original = String(value || "").trim();
  if (!original) return "";

  let digits = toAsciiDigits(original).replace(/\D/g, "");
  if (digits.startsWith("0095")) digits = digits.slice(2);
  if (digits.startsWith("95")) {
    digits = `0${digits.slice(2)}`;
  } else if (digits.startsWith("9")) {
    digits = `0${digits}`;
  }

  return /^09\d{7,9}$/.test(digits) ? digits : null;
};
