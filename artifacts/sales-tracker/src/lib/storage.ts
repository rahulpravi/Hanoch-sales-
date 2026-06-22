import { Sale } from "./products";

const STORAGE_KEY = "sales-tracker-sales";

export function loadSales(): Sale[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse sales from localStorage", e);
    return [];
  }
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
}

export function addSale(sale: Sale) {
  const sales = loadSales();
  sales.unshift(sale); // Add to the top
  saveSales(sales);
}