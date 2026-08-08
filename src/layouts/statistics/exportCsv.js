// Builds a CSV from statistics rows and hands it to the browser as a download.
// Deliberately dependency-free: a Blob and an anchor click is all this needs.

const escapeField = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  // Quote whenever the value could otherwise break the row apart, and double
  // any quotes inside it.
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (headers, rows) =>
  [headers, ...rows].map((row) => row.map(escapeField).join(",")).join("\r\n");

export const downloadCsv = (filename, headers, rows) => {
  // The BOM keeps Excel from mangling non-ASCII place names.
  const blob = new Blob([`﻿${toCsv(headers, rows)}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// "statistics-city-hanskin-2026-08-01.csv"
export const csvFilename = (section, brand, startDate) =>
  ["statistics", section, brand, startDate].filter(Boolean).join("-").concat(".csv");
