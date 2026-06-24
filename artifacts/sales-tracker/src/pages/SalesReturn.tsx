import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { PRODUCTS } from "@/lib/products";
import { addReturn } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Scan, Hash, Box, ShoppingCart, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import * as XLSX from "xlsx";

const uuidv4 = () => crypto.randomUUID();

export default function SalesReturn() {
  const [, setLocation] = useLocation();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const selectedProduct = PRODUCTS.find((p) => p.name === selectedProductName);
  
  const [serialInput, setSerialInput] = useState("");
  const [scannedSerials, setScannedSerials] = useState<string[]>([]);
  
  const [returnItems, setReturnItems] = useState<any[]>([]);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedProduct) {
      barcodeInputRef.current?.focus();
    }
  }, [selectedProduct]);

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = serialInput.trim();
      if (val) {
        if (scannedSerials.includes(val)) {
          toast.error("Duplicate serial number");
        } else {
          setScannedSerials((prev) => [...prev, val]);
        }
        setSerialInput("");
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 10);
      }
    }
  };

  const handleSubmitItem = () => {
    if (!selectedProduct) return;
    if (scannedSerials.length === 0) return;

    const totalBoxes = scannedSerials.length;
    const totalQty = totalBoxes * selectedProduct.qtyPerBox;

    const newItem = {
      productName: selectedProduct.name,
      qtyPerBox: selectedProduct.qtyPerBox,
      date,
      serialNumbers: [...scannedSerials],
      totalBoxes,
      totalQty
    };

    setReturnItems((prev) => [...prev, newItem]);
    toast.success(`Damage Item Count Saved: ${totalBoxes} boxes`);
    
    setSelectedProductName("");
    setScannedSerials([]);
    setSerialInput("");
  };

  const handleSaveReturn = () => {
    if (returnItems.length === 0) {
      toast.error("Add at least one damage item to save");
      return;
    }

    const totalBoxes = returnItems.reduce((acc, item) => acc + item.totalBoxes, 0);
    const returnLog = {
      id: uuidv4(),
      name: date + " Return",
      date,
      items: returnItems,
      totalBoxes,
      createdAt: new Date().toISOString()
    };

    addReturn(returnLog);

    try {
      const wb = XLSX.utils.book_new();
      for (const item of returnItems) {
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
      XLSX.writeFile(wb, date + " return.xlsx");
      
      toast.success("Sales Return saved and exported to Excel");
      setLocation("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel, but return log was saved");
    }
  };

  const canSubmitItem = !!selectedProduct && scannedSerials.length > 0;
  const canSaveReturn = returnItems.length > 0;

  const currentTotalBoxes = scannedSerials.length;
  const globalTotalBoxes = returnItems.reduce((acc, item) => acc + item.totalBoxes, 0);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <header className="border-b border-destructive/30 bg-destructive/10 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-medium text-destructive flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-5 h-5" /> Sales Return (Damage Entry)
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Return Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="bg-input/50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-destructive/20 shadow-lg ring-1 ring-destructive/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Scan className="w-5 h-5" /> Scan Damaged Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Product Name</Label>
                  <Select value={selectedProductName} onValueChange={setSelectedProductName}>
                    <SelectTrigger className="bg-input/50">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map(p => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qty/Box</Label>
                  <Input 
                    readOnly 
                    value={selectedProduct?.qtyPerBox || ""} 
                    className="bg-muted/50 font-mono text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-3">
                <Label htmlFor="barcode" className="text-lg font-medium text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-destructive" /> Scan / Type Damaged Serial Number
                </Label>
                <Input
                  id="barcode"
                  ref={barcodeInputRef}
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onKeyDown={handleBarcodeKeyDown}
                  placeholder="Focus here and scan return item..."
                  className="h-16 text-2xl font-mono bg-background border-destructive/30 focus-visible:ring-destructive shadow-inner"
                  disabled={!selectedProduct}
                />
                <p className="text-xs text-muted-foreground">Press Enter after each scan.</p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-destructive/20 flex items-center justify-center">
                    <Box className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Return Session</div>
                    <div className="text-xl font-medium text-white">
                      {currentTotalBoxes} <span className="text-sm font-normal text-muted-foreground">boxes</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmitItem} 
                disabled={!canSubmitItem} 
                variant="destructive"
                className="w-full h-12 text-base font-medium shadow-lg"
              >
                Submit Damaged Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md sticky top-24">
            <CardHeader className="bg-destructive/10 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5 text-destructive" /> Return Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {returnItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No return items added yet. Scan and submit damaged items.
                  </div>
                ) : (
                  returnItems.map((item, idx) => (
                    <div key={idx} className="bg-background/50 border border-border/50 p-3 rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{item.productName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.totalBoxes} damaged boxes
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 bg-muted/30 border-t border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-muted-foreground">Total Return Boxes</span>
                  <span className="font-mono text-xl font-bold text-destructive">{globalTotalBoxes}</span>
                </div>
                <Button 
                  onClick={handleSaveReturn} 
                  disabled={!canSaveReturn}
                  variant="destructive"
                  size="lg" 
                  className="w-full gap-2 font-semibold shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Return Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
