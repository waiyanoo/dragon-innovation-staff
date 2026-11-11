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
  { label: "View", type: "view", group: "general", fulfilment: ["pending", "packed", "shipped", "cancelled"], roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"], allowSuper: false },
  { label: "Print waybill", type: "waybill", group: "general", fulfilment: ["pending", "packed", "shipped"], roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"], allowSuper: false },
  { label: "Create ad-hoc invoice", type: "adhoc_invoice", group: "general", fulfilment: ["pending", "packed", "shipped"], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: false },
  { label: "Edit", type: "edit", group: "general", fulfilment: ["pending"], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: false },
  { label: "Mark as packed", type: "packed", group: "lifecycle", fulfilment: ["pending"], roles: ["warehouse", "admin", "super_admin"], allowSuper: false },
  { label: "Mark as shipped", type: "shipped", group: "lifecycle", fulfilment: ["packed"], roles: ["warehouse", "admin", "super_admin"], allowSuper: false },
  { label: "Set official invoice no.", type: "invoice", group: "lifecycle", fulfilment: ["pending", "packed", "shipped"], roles: ["admin", "super_admin"], allowSuper: false },
  { label: "Report fulfilment issue", type: "exception", group: "lifecycle", fulfilment: ["pending", "packed"], roles: ["warehouse", "admin", "super_admin"], allowSuper: false },
  { label: "Cancel order", type: "cancel", group: "danger", fulfilment: ["pending", "packed"], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: false },
]

export const Order_Card_Action_Groups = ["general", "lifecycle", "danger"]
