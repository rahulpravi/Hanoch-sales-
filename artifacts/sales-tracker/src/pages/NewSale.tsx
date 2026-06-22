import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { PRODUCTS, Product, SaleItem, Sale } from "@/lib/products";
import { addSale } from "@/lib/storage";
import { exportToExcel } from "@/lib/excel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Scan, Hash, Box, ShoppingCart, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const uuidv4 = () => crypto.randomUUID();

export default function NewSale() {
  const [, setLocation] = useLocation();
  const [saleName, setSaleName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const selectedProduct = PRODUCTS.find((p) => p.name === selectedProductName);
  
  const [serialInput, setSerialInput] = useState("");
  const [scannedSerials, setScannedSerials] = useState<string[]>([]);
  
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  
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
    if (!saleName.trim()) {
      toast.error("Please enter a Sale Name first");
      return;
    }

    const totalBoxes = scannedSerials.length;
    const totalQty = totalBoxes * selectedProduct.qtyPerBox;

    const newItem: SaleItem = {
      productName: selectedProduct.name,
      qtyPerBox: selectedProduct.qtyPerBox,
      date,
      serialNumbers: [...scannedSerials],
      totalBoxes,
      totalQty
    };

    setSaleItems((prev) => [...prev, newItem]);
    toast.success(`Item Count Saved: ${totalQty}`);
    
    // Reset item form
    setSelectedProductName("");
    setScannedSerials([]);
    setSerialInput("");
  };

  const handleSaveSale = () => {
    if (!saleName.trim()) {
      toast.error("Sale Name is required");
      return;
    }
    if (saleItems.length === 0) {
      toast.error("Add at least one item to save the sale");
      return;
    }

    const totalItems = saleItems.reduce((acc, item) => acc + item.totalQty, 0);
    const sale: Sale = {
      id: uuidv4(),
      name: saleName.trim(),
      date,
      items: saleItems,
      totalItems,
      createdAt: new Date().toISOString()
    };

    addSale(sale);
    try {
      exportToExcel(sale);
      toast.success("Sale saved and exported to Excel");
      setLocation("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel, but sale was saved");
    }
  };

  const canSubmitItem = !!selectedProduct && scannedSerials.length > 0 && !!saleName.trim();
  const canSaveSale = saleItems.length > 0 && !!saleName.trim();

  const currentTotalBoxes = scannedSerials.length;
  const currentTotalQty = selectedProduct ? currentTotalBoxes * selectedProduct.qtyPerBox : 0;
  
  const globalTotalBoxes = saleItems.reduce((acc, item) => acc + item.totalBoxes, 0);
  const globalTotalQty = saleItems.reduce((acc, item) => acc + item.totalQty, 0);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-medium text-white tracking-tight">New Sale</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saleName">Sale Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="saleName" 
                  value={saleName} 
                  onChange={(e) => setSaleName(e.target.value)} 
                  placeholder="e.g. Q3 Restock, Client XYZ..."
                  className="bg-input/50 border-border"
                  data-testid="input-sale-name"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-lg ring-1 ring-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" /> Product Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Product Name</Label>
                  <Select value={selectedProductName} onValueChange={setSelectedProductName}>
                    <SelectTrigger className="bg-input/50" data-testid="select-product">
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

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="bg-input/50"
                  data-testid="input-date"
                />
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-3">
                <Label htmlFor="barcode" className="text-lg font-medium text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" /> Scan / Type Serial Number
                </Label>
                <Input
                  id="barcode"
                  ref={barcodeInputRef}
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onKeyDown={handleBarcodeKeyDown}
                  placeholder="Focus here and scan..."
                  className="h-16 text-2xl font-mono bg-background border-primary/30 focus-visible:ring-primary shadow-inner"
                  data-testid="input-barcode"
                  disabled={!selectedProduct}
                />
                <p className="text-xs text-muted-foreground">Press Enter after each scan. Scanner should automatically send Enter.</p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                    <Box className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Scan Session</div>
                    <div className="text-xl font-medium text-white">
                      {currentTotalBoxes} <span className="text-sm font-normal text-muted-foreground">boxes</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Qty</div>
                  <div className="text-2xl font-bold text-primary font-mono">{currentTotalQty.toLocaleString()}</div>
                </div>
              </div>

              <Button 
                onClick={handleSubmitItem} 
                disabled={!canSubmitItem} 
                className="w-full h-12 text-base font-medium shadow-lg"
                data-testid="button-submit-item"
              >
                Submit Item
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md sticky top-24">
            <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Current Sale Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {saleItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm" data-testid="empty-summary">
                    No items added yet. Scan and submit items to build the sale.
                  </div>
                ) : (
                  saleItems.map((item, idx) => (
                    <div key={idx} className="bg-background/50 border border-border/50 p-3 rounded-md flex items-center justify-between group">
                      <div>
                        <div className="font-medium text-white">{item.productName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.totalBoxes} boxes × {item.qtyPerBox}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-medium text-white">{item.totalQty.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">qty</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 bg-muted/30 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Total Boxes</span>
                  <span className="font-mono text-white">{globalTotalBoxes}</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="text-xl font-bold text-primary font-mono">{globalTotalQty.toLocaleString()}</span>
                </div>
                <Button 
                  onClick={handleSaveSale} 
                  disabled={!canSaveSale}
                  size="lg" 
                  className="w-full gap-2 font-semibold shadow-lg"
                  data-testid="button-save-sale"
                >
                  <Save className="w-5 h-5" />
                  Save Sale Now
                </Button>
                {(!saleName.trim() && saleItems.length > 0) && (
                  <p className="text-xs text-destructive text-center mt-2">Sale Name is required to save</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}