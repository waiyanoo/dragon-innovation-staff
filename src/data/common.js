export const State_List = [
  "Ayeyarwady",
  "Bago",
  "Chin",
  "Kachin",
  "Kayah",
  "Kayin",
  "Magway",
  "Mandalay",
  "Mon",
  "Nay Pyi Taw",
  "Rakhine",
  "Sagaing",
  "Shan",
  "Tanintharyi",
  "Yangon"
]

// Brand ids as stored on orders, with their display labels and the palette
// colour each one is drawn in. Colours match the dashboard cards so a brand
// reads the same everywhere.
export const BRANDS = [
  { id: "hanskin", label: "Hanskin", color: "info" },
  { id: "sugarbear", label: "SugarBear", color: "primary" },
  { id: "mongdies", label: "Mongdies", color: "success" },
];

export const BRAND_COLORS = BRANDS.reduce((acc, brand) => {
  acc[brand.id] = brand.color;
  return acc;
}, {});

export const BRAND_LABELS = BRANDS.reduce((acc, brand) => {
  acc[brand.id] = brand.label;
  return acc;
}, {});

export const ROLES = {
  page_admin: "Page Admin",
  sales: "Wholesale",
  warehouse: "Warehouse",
  admin: "Admin",
  super_admin: "Super Admin",
}

export const Order_Card_Actions = [
  {label: "View", type: "view", group: "general", statuses: [0,1,2,3], roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"], allowSuper: false},
  {label: "Print waybill", type: "waybill", group: "general", statuses: [0,1,2,3], roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"], allowSuper: false},
  {label: "Create ad-hoc invoice", type: "adhoc_invoice", group: "general", statuses: [0,1,2,3], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: false},
  {label: "Edit", type: "edit", group: "general", statuses: [0], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: true},
  {label: "Packed", type: "packed", group: "lifecycle", statuses: [0], roles: ["warehouse", "admin", "super_admin"], allowSuper: false},
  {label: "Shipped", type: "shipped", group: "lifecycle", statuses: [1], roles: ["warehouse", "admin", "super_admin"], allowSuper: false},
  {label: "Set Invoice No.", type: "invoice", group: "lifecycle", statuses: [2], roles: ["admin", "super_admin"], allowSuper: false},
  {label: "Delete", type: "delete", group: "danger", statuses: [0], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: true},
]

export const Order_Card_Action_Groups = ["general", "lifecycle", "danger"]
