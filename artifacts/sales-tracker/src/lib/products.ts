export const PRODUCTS = [
  { name: "48 Way",  qtyPerBox: 168  },
  { name: "OBC",    qtyPerBox: 300  },
  { name: "4 Way",  qtyPerBox: 2200 },
  { name: "Shourd", qtyPerBox: 110  },
  { name: "Ford",   qtyPerBox: 2000 },
];

export type Product = typeof PRODUCTS[number];

export type SerialEntry = { serialNumber: string };

export type SaleItem = {
  productName: string;
  qtyPerBox: number;
  date: string; // ISO date string YYYY-MM-DD
  serialNumbers: string[]; // list of scanned serial numbers (each = 1 box)
  totalBoxes: number;
  totalQty: number; // totalBoxes * qtyPerBox
};

export type Sale = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  items: SaleItem[];
  totalItems: number; // sum of all totalQty across items
  createdAt: string;
};