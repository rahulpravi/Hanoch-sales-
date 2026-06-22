import * as XLSX from "xlsx";
import { Sale } from "./products";

export function exportToExcel(sale: Sale) {
  const wb = XLSX.utils.book_new();
  for (const item of sale.items) {
    const rows = item.serialNumbers.map((sn, idx) => ({
      "Date": item.date,
      "Sl. No": idx + 1,
      "Item Name": item.productName,
      "Serial Number": sn,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const sheetName = item.productName.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }
  XLSX.writeFile(wb, sale.date + " sale.xlsx");
}