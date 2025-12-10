import {
  __name,
  init_esm
} from "./chunk-3R76H35D.mjs";

// src/lib/helpers.ts
init_esm();
function nullifyEmptyString(value) {
  if (!value || value === "-" || value.trim() === "") {
    return null;
  }
  return value;
}
__name(nullifyEmptyString, "nullifyEmptyString");
function removeNullValues(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== void 0) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
__name(removeNullValues, "removeNullValues");
function parsePercentileRange(value) {
  if (!value || value === "-") {
    return { min: null, max: null };
  }
  const parts = value.split("-").map((p) => p.trim());
  if (parts.length !== 2) {
    return { min: null, max: null };
  }
  const min = Number.parseInt(parts[0], 10);
  const max = Number.parseInt(parts[1], 10);
  return {
    min: Number.isNaN(min) ? null : min,
    max: Number.isNaN(max) ? null : max
  };
}
__name(parsePercentileRange, "parsePercentileRange");
function parsePercentage(value) {
  if (!value || value === "-") return null;
  const cleaned = value.replace("%", "").trim();
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) return null;
  if (num <= 1) return num;
  return num / 100;
}
__name(parsePercentage, "parsePercentage");
function parseInteger(value) {
  if (!value || value === "-") return null;
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number.parseInt(cleaned, 10);
  return Number.isNaN(num) ? null : num;
}
__name(parseInteger, "parseInteger");
function parseFloat(value) {
  if (!value || value === "-") return null;
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
}
__name(parseFloat, "parseFloat");
function mapDivisionCode(sheetName) {
  const mapping = {
    DI: "DI",
    DII: "DII",
    DIII: "DIII",
    JuCo: "JuCo",
    NAIA: "NAIA"
  };
  return mapping[sheetName] || sheetName;
}
__name(mapDivisionCode, "mapDivisionCode");
function parseEventGroups(responsibilities) {
  if (!responsibilities) return [];
  const text = responsibilities.toLowerCase();
  const groups = /* @__PURE__ */ new Set();
  if (text.includes("sprint") || text.includes("100") || text.includes("200") || text.includes("400")) {
    groups.add("sprints");
  }
  if (text.includes("distance") || text.includes("800") || text.includes("1500") || text.includes("mile") || text.includes("3000") || text.includes("5000") || text.includes("10000") || text.includes("xc") || text.includes("cross country")) {
    groups.add("distance");
  }
  if (text.includes("throw") || text.includes("shot") || text.includes("discus") || text.includes("javelin") || text.includes("hammer")) {
    groups.add("throws");
  }
  if (text.includes("jump") || text.includes("long jump") || text.includes("triple") || text.includes("high jump") || text.includes("pole vault")) {
    groups.add("jumps");
  }
  if (text.includes("hurdle") || text.includes("110h") || text.includes("400h") || text.includes("100h")) {
    groups.add("hurdles");
  }
  if (text.includes("relay") || text.includes("4x1") || text.includes("4x4")) {
    groups.add("relays");
  }
  if (text.includes("multi") || text.includes("heptathlon") || text.includes("decathlon") || text.includes("pentathlon") || text.includes("combined") || text.includes("all events")) {
    groups.add("combined");
  }
  return Array.from(groups);
}
__name(parseEventGroups, "parseEventGroups");
function derivePrimarySpecialty(responsibilities) {
  const groups = parseEventGroups(responsibilities);
  return groups.length > 0 ? groups[0] : null;
}
__name(derivePrimarySpecialty, "derivePrimarySpecialty");
function parseSpecificEvents(responsibilities) {
  if (!responsibilities) return [];
  const text = responsibilities.toLowerCase();
  const events = [];
  if (text.includes("100m") || text.includes("100 m")) events.push("100m");
  if (text.includes("200m") || text.includes("200 m")) events.push("200m");
  if (text.includes("400m") || text.includes("400 m")) events.push("400m");
  if (text.includes("800m") || text.includes("800 m")) events.push("800m");
  if (text.includes("1500m") || text.includes("1500 m") || text.includes("mile")) events.push("1500m");
  if (text.includes("3000m") || text.includes("3000 m") || text.includes("steeplechase")) events.push("3000m Steeplechase");
  if (text.includes("5000m") || text.includes("5000 m") || text.includes("5k")) events.push("5000m");
  if (text.includes("10000m") || text.includes("10000 m") || text.includes("10k")) events.push("10000m");
  if (text.includes("110h") || text.includes("110m hurdles")) events.push("110m Hurdles");
  if (text.includes("100h") || text.includes("100m hurdles")) events.push("100m Hurdles");
  if (text.includes("400h") || text.includes("400m hurdles")) events.push("400m Hurdles");
  if (text.includes("long jump")) events.push("Long Jump");
  if (text.includes("triple jump")) events.push("Triple Jump");
  if (text.includes("high jump")) events.push("High Jump");
  if (text.includes("pole vault")) events.push("Pole Vault");
  if (text.includes("shot put") || text.includes("shot")) events.push("Shot Put");
  if (text.includes("discus")) events.push("Discus");
  if (text.includes("javelin")) events.push("Javelin");
  if (text.includes("hammer")) events.push("Hammer Throw");
  if (text.includes("decathlon")) events.push("Decathlon");
  if (text.includes("heptathlon")) events.push("Heptathlon");
  if (text.includes("pentathlon")) events.push("Pentathlon");
  if (text.includes("4x100") || text.includes("4x1")) events.push("4x100m Relay");
  if (text.includes("4x400") || text.includes("4x4")) events.push("4x400m Relay");
  return events;
}
__name(parseSpecificEvents, "parseSpecificEvents");

export {
  nullifyEmptyString,
  removeNullValues,
  parsePercentileRange,
  parsePercentage,
  parseInteger,
  parseFloat,
  mapDivisionCode,
  parseEventGroups,
  derivePrimarySpecialty,
  parseSpecificEvents
};
//# sourceMappingURL=chunk-YVHYT274.mjs.map
