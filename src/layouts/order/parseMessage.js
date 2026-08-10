// Pulls what can be recognised reliably out of a pasted Messenger message.
//
// Deliberately conservative. Phone numbers are regular enough to extract with
// confidence, and city names can be matched against the known list. Names and
// addresses in mixed Burmese and English are not something to guess at, so the
// leftover text is handed back for a human to sort out rather than split up.

import { ALL_CITIES } from "../../data/cityList";
import { normalizeMyanmarPhone } from "../../functions/phone";

// Digits with the separators people actually type between them.
const PHONE_CANDIDATE = /\+?\d[\d\s\-().]{6,17}\d/g;

// Reduce to lowercase words so "Hpa-An", "hpa an" and "HPA AN" all compare equal.
const toWords = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Myanmar mobile numbers are 09 followed by 7-9 digits, written variously as
// 09..., 959... or +959...
export const extractPhones = (text) => {
  const found = [];
  (String(text || "").match(PHONE_CANDIDATE) || []).forEach((candidate) => {
    const phone = normalizeMyanmarPhone(candidate);
    if (phone && !found.includes(phone)) found.push(phone);
  });
  return found;
};

/**
 * The one city named in the text, or null.
 *
 * Matches whole space-delimited phrases so a name cannot be found inside a
 * longer word. Where several match, the longest wins ("North Dagon" beats
 * "Dagon"); if two unrelated cities appear it gives up rather than guess.
 */
export const detectCity = (text) => {
  const haystack = ` ${toWords(text)} `;
  const matches = ALL_CITIES.filter((city) => haystack.includes(` ${toWords(city)} `));
  if (matches.length === 0) return null;

  const byLength = [...matches].sort((a, b) => toWords(b).length - toWords(a).length);
  const longest = byLength[0];
  const unrelated = byLength
    .slice(1)
    .filter((city) => !` ${toWords(longest)} `.includes(` ${toWords(city)} `));

  return unrelated.length === 0 ? longest : null;
};

// The message minus its phone numbers — a starting point for the address.
export const stripPhones = (text) => {
  let remaining = String(text || "");
  (String(text || "").match(PHONE_CANDIDATE) || []).forEach((candidate) => {
    if (normalizeMyanmarPhone(candidate)) remaining = remaining.replace(candidate, " ");
  });
  return remaining
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
};

export const parseMessengerText = (text) => ({
  phones: extractPhones(text),
  city: detectCity(text),
  address: stripPhones(text),
});
