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

export const ROLES = {
  page_admin: "Page Admin",
  sales: "Wholesale",
  warehouse: "Warehouse",
  admin: "Admin",
  super_admin: "Super Admin",
}

export const Order_Card_Actions = [
  {label: "View", type: "view", statuses: [0,1,2,3], roles: ["page_admin", "warehouse", "sales", "admin", "super_admin"], allowSuper: false},
  {label: "Edit", type: "edit", statuses: [0], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: true},
  {label: "Packed", type: "packed", statuses: [0], roles: ["warehouse", "admin", "super_admin"], allowSuper: false},
  {label: "Shipped", type: "shipped", statuses: [1], roles: ["warehouse", "admin", "super_admin"], allowSuper: false},
  {label: "Set Invoice No.", type: "invoice", statuses: [2], roles: ["admin", "super_admin"], allowSuper: false},
  {label: "Delete", type: "delete", statuses: [0], roles: ["page_admin", "sales", "admin", "super_admin"], allowSuper: false},
]
