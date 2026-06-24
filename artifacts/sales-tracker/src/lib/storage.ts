import { Sale } from "./products";

const STORAGE_KEY = "sales-tracker-sales";
const RETURN_KEY = "sales-tracker-returns";

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
  sales.unshift(sale);
  saveSales(sales);
}

export function loadReturns(): any[] {
  const data = localStorage.getItem(RETURN_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function addReturn(ret: any) {
  const returns = loadReturns();
  returns.unshift(ret);
  localStorage.setItem(RETURN_KEY, JSON.stringify(returns));
}
