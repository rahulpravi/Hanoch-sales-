import { useState, useEffect } from "react";
import { Link } from "wouter";
import { loadSales } from "@/lib/storage";
import { Sale } from "@/lib/products";
import { Plus, Package, Box, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    setSales(loadSales());
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">SalesTrack Pro</h1>
            <p className="text-muted-foreground mt-1">High-velocity warehouse terminal</p>
          </div>
          <Link href="/new" className="inline-flex">
            <Button size="lg" className="shadow-lg gap-2" data-testid="button-add-sale">
              <Plus className="w-5 h-5" />
              Add New Sale
            </Button>
          </Link>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                <Package className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{sales.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Items Tracked</CardTitle>
                <Box className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {sales.reduce((acc, s) => acc + s.items.length, 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-border/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
                <Box className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {sales.reduce((acc, s) => acc + s.totalItems, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Past Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-sales">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No sales recorded yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your sales records will appear here once you create and save a new sale.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Sale Name</TableHead>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground">Items</TableHead>
                        <TableHead className="text-muted-foreground">Total Qty</TableHead>
                        <TableHead className="text-right text-muted-foreground"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id} className="border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer" data-testid={`row-sale-${sale.id}`}>
                          <TableCell className="font-medium text-white">{sale.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-secondary/50 font-normal">
                              {sale.date}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{sale.items.length} items</TableCell>
                          <TableCell className="text-muted-foreground font-mono">{sale.totalItems.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <ChevronRight className="w-4 h-4 text-muted-foreground inline-block group-hover:text-primary transition-colors" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}