// Delivery destinations offered per state on the order form.
//
// Yangon, Mandalay and Nay Pyi Taw list townships, since that is what matters
// for delivery there. Other states list towns. Each list also includes the
// region's main city name, because orders have historically been written both
// ways ("Yangon" as well as "Hlaing").
//
// This list is a convenience, NOT a constraint: the city field still accepts
// free text, so anywhere missing here can still be typed. Add entries as you
// come across them — keys must match src/data/common.js State_List exactly.

export const CITY_BY_STATE = {
  Ayeyarwady: [
    "Bogale", "Danubyu", "Einme", "Hinthada", "Kangyidaunt", "Kyaiklat", "Kyonpyaw",
    "Labutta", "Maubin", "Myaungmya", "Ngapudaw", "Ngathaingchaung", "Pathein",
    "Pyapon", "Thabaung", "Wakema", "Yegyi", "Zalun",
  ],
  Bago: [
    "Bago", "Daik-U", "Gyobingauk", "Kyaukkyi", "Kyauktaga", "Letpadan", "Minhla",
    "Nattalin", "Nyaunglebin", "Okpho", "Padaung", "Paukkaung", "Paungde", "Pyay",
    "Pyu", "Shwedaung", "Shwegyin", "Tharrawaddy", "Thanatpin", "Taungoo", "Waw",
    "Zigon",
  ],
  Chin: [
    "Falam", "Hakha", "Kanpetlet", "Matupi", "Mindat", "Paletwa", "Tedim",
    "Thantlang", "Tonzang",
  ],
  Kachin: [
    "Bhamo", "Chipwi", "Hpakant", "Injangyang", "Kawnglanghpu", "Machanbaw",
    "Mogaung", "Mohnyin", "Momauk", "Myitkyina", "Nogmung", "Putao", "Shwegu",
    "Sumprabum", "Tanai", "Waingmaw",
  ],
  Kayah: ["Bawlakhe", "Demoso", "Hpasawng", "Hpruso", "Loikaw", "Mese", "Shadaw"],
  Kayin: [
    "Hlaingbwe", "Hpa-An", "Kawkareik", "Kyainseikgyi", "Myawaddy", "Papun",
    "Thandaunggyi",
  ],
  Magway: [
    "Aunglan", "Chauk", "Gangaw", "Kamma", "Magway", "Mindon", "Minbu", "Myaing",
    "Myothit", "Natmauk", "Ngape", "Pakokku", "Pauk", "Salin", "Sidoktaya",
    "Sinbaungwe", "Taungdwingyi", "Thayet", "Yenangyaung", "Yesagyo",
  ],
  Mandalay: [
    "Mandalay",
    "Amarapura", "Aungmyethazan", "Chanayethazan", "Chanmyathazi", "Kyaukse",
    "Madaya", "Mahaaungmye", "Meiktila", "Myingyan", "Nyaung-U", "Patheingyi",
    "Pyawbwe", "Pyigyidagun", "Pyin Oo Lwin", "Singu", "Tada-U", "Thabeikkyin",
    "Wundwin", "Yamethin",
  ],
  Mon: [
    "Bilin", "Chaungzon", "Kyaikmaraw", "Kyaikto", "Mawlamyine", "Mudon", "Paung",
    "Thanbyuzayat", "Thaton", "Ye",
  ],
  "Nay Pyi Taw": [
    "Nay Pyi Taw",
    "Dekkhinathiri", "Lewe", "Ottarathiri", "Pobbathiri", "Pyinmana", "Tatkon",
    "Zabuthiri", "Zeyathiri",
  ],
  Rakhine: [
    "Ann", "Buthidaung", "Gwa", "Kyaukpyu", "Kyauktaw", "Maungdaw", "Minbya",
    "Mrauk-U", "Munaung", "Myebon", "Pauktaw", "Ponnagyun", "Ramree", "Rathedaung",
    "Sittwe", "Thandwe", "Toungup",
  ],
  Sagaing: [
    "Ayadaw", "Banmauk", "Budalin", "Chaung-U", "Depayin", "Hkamti", "Indaw",
    "Kalay", "Kanbalu", "Kani", "Katha", "Kawlin", "Khin-U", "Kyunhla", "Mawlaik",
    "Mingin", "Monywa", "Myaung", "Myinmu", "Pale", "Pinlebu", "Sagaing",
    "Salingyi", "Shwebo", "Tamu", "Taze", "Tigyaing", "Wetlet", "Wuntho",
    "Ye-U", "Yinmabin",
  ],
  Shan: [
    "Aungban", "Hopang", "Hopong", "Hsenwi", "Hsihseng", "Hsipaw", "Kalaw",
    "Kengtung", "Kutkai", "Kyaukme", "Langkho", "Lashio", "Laukkai", "Loilen",
    "Mongla", "Mongping", "Mongyai", "Mongyang", "Muse", "Namsang", "Namtu",
    "Nyaungshwe", "Pekon", "Pindaya", "Pinlaung", "Tachileik", "Taunggyi",
    "Ywangan",
  ],
  Tanintharyi: [
    "Bokpyin", "Dawei", "Kawthaung", "Kyunsu", "Launglon", "Myeik", "Palaw",
    "Tanintharyi", "Thayetchaung", "Yebyu",
  ],
  Yangon: [
    "Yangon",
    "Ahlone", "Bahan", "Botahtaung", "Dagon", "Dagon Seikkan", "Dala", "Dawbon",
    "East Dagon", "Hlaing", "Hlaingthaya", "Hlegu", "Htantabin", "Insein",
    "Kamayut", "Kawhmu", "Kayan", "Kungyangon", "Kyauktada", "Kyauktan",
    "Kyeemyindaing", "Lanmadaw", "Latha", "Mayangone", "Mingaladon",
    "Mingalar Taung Nyunt", "North Dagon", "North Okkalapa", "Pabedan",
    "Pazundaung", "Sanchaung", "Seikkan", "Seikkyi Kanaungto", "Shwepyithar",
    "South Dagon", "South Okkalapa", "Tamwe", "Thaketa", "Thanlyin", "Thingangyun",
    "Thongwa", "Twante", "Yankin",
  ],
};

export const ALL_CITIES = [...new Set(Object.values(CITY_BY_STATE).flat())].sort((a, b) =>
  a.localeCompare(b)
);

export const citiesForState = (state) => CITY_BY_STATE[state] || ALL_CITIES;

// Spellings seen in existing orders that the key-based match below cannot
// resolve on its own. Keys must be normalised (see normaliseCityKey).
// Extend this as you spot variants in the Statistics city table.
const CITY_ALIASES = {
  ygn: "Yangon",
  yangoon: "Yangon",
  rangoon: "Yangon",
  mdy: "Mandalay",
  mandalary: "Mandalay",
  npt: "Nay Pyi Taw",
  naypyidaw: "Nay Pyi Taw",
  npw: "Nay Pyi Taw",
  hlaingtharyar: "Hlaingthaya",
  hlaingthayar: "Hlaingthaya",
  okkalapanorth: "North Okkalapa",
  okkalapasouth: "South Okkalapa",
  pyinoolwin: "Pyin Oo Lwin",
  maymyo: "Pyin Oo Lwin",
  moulmein: "Mawlamyine",
  bassein: "Pathein",
  akyab: "Sittwe",
  mergui: "Myeik",
  tavoy: "Dawei",
};

// Strip everything that varies between spellings of the same place, so
// "Hpa-An", "hpa an" and "HPAAN" collapse to one key.
export const normaliseCityKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const CANONICAL_BY_KEY = ALL_CITIES.reduce((acc, city) => {
  acc[normaliseCityKey(city)] = city;
  return acc;
}, {});

// No city name in the list belongs to two states, so a known city always
// implies exactly one state.
const STATE_BY_CITY = Object.entries(CITY_BY_STATE).reduce((acc, [state, cities]) => {
  cities.forEach((city) => {
    acc[normaliseCityKey(city)] = state;
  });
  return acc;
}, {});

const titleCase = (value) =>
  value
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");

/**
 * Map a typed city onto its canonical spelling for reporting.
 *
 * Returns null for a blank value. Anything not recognised is returned
 * tidied-up rather than discarded, so unknown places still show up in reports
 * instead of silently vanishing.
 */
export const canonicalCity = (value) => {
  const trimmed = String(value || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return null;

  const key = normaliseCityKey(trimmed);
  return CANONICAL_BY_KEY[key] || CITY_ALIASES[key] || titleCase(trimmed.toLowerCase());
};

/**
 * The state a city belongs to, or null if it is not a known city.
 *
 * Goes through canonicalCity first so aliases resolve too ("ygn" -> "Yangon"
 * -> "Yangon" state).
 */
export const stateForCity = (city) => {
  const canonical = canonicalCity(city);
  if (!canonical) return null;
  return STATE_BY_CITY[normaliseCityKey(canonical)] || null;
};
