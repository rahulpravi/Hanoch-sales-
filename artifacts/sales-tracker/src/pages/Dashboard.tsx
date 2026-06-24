import { useState, useEffect } from "react";
import { Link } from "wouter";
import { loadSales, loadReturns } from "@/lib/storage";
import { PRODUCTS, Sale } from "@/lib/products";
import { Plus, Package, Box, Calendar, BarChart3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    setSales(loadSales());
    setReturns(loadReturns());
  }, []);

  const totalReturnBoxes = returns.reduce((acc, r) => acc + r.totalBoxes, 0);

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">SalesTrack Pro</h1>
            <p className="text-muted-foreground mt-1">High-velocity warehouse terminal</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/return" className="inline-flex">
              <Button size="lg" variant="destructive" className="shadow-lg gap-2">
                <AlertTriangle className="w-5 h-5" />
                Add Sales Return
              </Button>
            </Link>
            <Link href="/new" className="inline-flex">
              <Button size="lg" className="shadow-lg gap-2" data-testid="button-add-sale">
                <Plus className="w-5 h-5" />
                Add New Sale
              </Button>
            </Link>
          </div>
        </header>

        <main className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                <Package className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{sales.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-destructive/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Total Return Boxes (Damage)</CardTitle>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{totalReturnBoxes}</div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Total Boxes per Product */}
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-semibold text-white">Total Sales Boxes per Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {PRODUCTS.map(p => {
                  const totalBoxes = sales.reduce((sum, sale) => {
                    const matchedItem = sale.items.find(item => item.productName === p.name);
                    return sum + (matchedItem ? matchedItem.totalBoxes : 0);
                  }, 0);
                  return (
                    <div key={p.name} className="bg-background/40 border border-border/30 p-4 rounded-lg flex flex-col justify-between">
                      <div className="text-xs text-muted-foreground font-medium truncate">{p.name}</div>
                      <div className="text-2xl font-bold text-primary font-mono mt-2">
                        {totalBoxes} <span className="text-sm font-normal text-muted-foreground">boxes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Past Sales List Table */}
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Past Sales Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No sales recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Sale Name / Date</TableHead>
                        <TableHead className="text-muted-foreground">Items</TableHead>
                        <TableHead className="text-muted-foreground min-w-[220px]">Boxes Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-white">{sale.name}</TableCell>
                          <TableCell className="text-muted-foreground">{sale.items.length} products</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 max-w-[250px]">
                              {sale.items.map((item, idx) => (
                                <div key={idx} className="text-xs flex items-center justify-between bg-background/40 px-2 py-1 rounded border border-border/30">
                                  <span className="text-muted-foreground">{item.productName}</span>
                                  <span className="font-mono text-primary">{item.totalBoxes} boxes</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Returns List Table */}
          {returns.length > 0 && (
            <Card className="bg-card/50 backdrop-blur border-destructive/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" /> Past Sales Returns (Damage Logs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Return Log / Date</TableHead>
                        <TableHead className="text-muted-foreground">Total Return Boxes</TableHead>
                        <TableHead className="text-muted-foreground min-w-[220px]">Damage Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returns.map((ret) => (
                        <TableRow key={ret.id} className="border-border/50 hover:bg-destructive/5 transition-colors">
                          <TableCell className="font-medium text-white">{ret.name}</TableCell>
                          <TableCell className="text-destructive font-semibold">{ret.totalBoxes} boxes</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 max-w-[250px]">
                              {ret.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs flex items-center justify-between bg-background/40 px-2 py-1 rounded border border-border/30">
                                  <span className="text-muted-foreground">{item.productName}</span>
                                  <span className="font-mono text-destructive">{item.totalBoxes} boxes</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
