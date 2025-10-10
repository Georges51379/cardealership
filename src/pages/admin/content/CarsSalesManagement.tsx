import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  Key, 
  TrendingUp, 
  DollarSign,
  Download,
  Eye,
  Printer,
  Trash2,
  Copy,
  Check,
  Car,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import TransactionDetailDialog from "@/components/admin/TransactionDetailDialog";
import ReceiptGenerator from "@/components/admin/ReceiptGenerator";
import { exportToCSV } from "@/lib/csvExport";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  id: string;
  transaction_date: string;
  sale_type: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  car_id: string;
  cars: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    year: number;
    mileage: number;
    category: string;
  };
}

const COLORS = {
  purchase: "#10b981",
  rental: "#8b5cf6",
};

export default function CarsSalesManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    setupRealtimeSubscription();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_transactions")
        .select(`
          *,
          cars:car_id (
            id,
            name,
            price,
            image_url,
            year,
            mileage,
            category
          )
        `)
        .in("sale_type", ["purchase", "rental"])
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("car-sales-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales_transactions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTransaction = payload.new as any;
            if (newTransaction.sale_type === "purchase") {
              toast.success("New car purchase recorded! 🎉");
            } else if (newTransaction.sale_type === "rental") {
              toast.success("New rental request received! 🚗");
            }
            fetchTransactions();
          } else if (payload.eventType === "DELETE") {
            toast.info("Transaction deleted");
            fetchTransactions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Sale type filter
    if (saleTypeFilter !== "all") {
      filtered = filtered.filter((t) => t.sale_type === saleTypeFilter);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case "7days":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(
        (t) => new Date(t.transaction_date) >= filterDate
      );
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.customer_name.toLowerCase().includes(search) ||
          t.customer_email.toLowerCase().includes(search) ||
          t.cars.name.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [transactions, saleTypeFilter, dateRange, searchTerm]);

  const stats = useMemo(() => {
    const purchases = filteredTransactions.filter((t) => t.sale_type === "purchase");
    const rentals = filteredTransactions.filter((t) => t.sale_type === "rental");

    const totalSalesRevenue = purchases.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalRentalsRevenue = rentals.reduce((sum, t) => sum + Number(t.amount), 0);
    const averageSalePrice = purchases.length > 0 ? totalSalesRevenue / purchases.length : 0;

    // Most popular car
    const carCounts = filteredTransactions.reduce((acc, t) => {
      acc[t.cars.name] = (acc[t.cars.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularCar = Object.entries(carCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSold: purchases.length,
      totalRented: rentals.length,
      totalSalesRevenue,
      totalRentalsRevenue,
      averageSalePrice,
      mostPopularCar: mostPopularCar ? mostPopularCar[0] : "N/A",
    };
  }, [filteredTransactions]);

  const pieChartData = [
    { name: "Purchases", value: stats.totalSalesRevenue, color: COLORS.purchase },
    { name: "Rentals", value: stats.totalRentalsRevenue, color: COLORS.rental },
  ];

  const topCarsByRevenue = useMemo(() => {
    const carRevenue = filteredTransactions.reduce((acc, t) => {
      if (!acc[t.cars.name]) {
        acc[t.cars.name] = 0;
      }
      acc[t.cars.name] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(carRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));
  }, [filteredTransactions]);

  const topCarsByCount = useMemo(() => {
    const carCounts = filteredTransactions.reduce((acc, t) => {
      acc[t.cars.name] = (acc[t.cars.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(carCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [filteredTransactions]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Transaction ID copied!");
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const { error } = await supabase
        .from("sales_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Transaction deleted successfully");
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredTransactions.map((t) => ({
      "Transaction ID": t.id.substring(0, 8),
      Date: format(new Date(t.transaction_date), "MMM dd, yyyy HH:mm"),
      "Car Name": t.cars.name,
      Type: t.sale_type,
      Amount: `$${Number(t.amount).toLocaleString()}`,
      "Customer Name": t.customer_name,
      "Customer Email": t.customer_email,
    }));

    exportToCSV(csvData, "car-sales-report.csv");
    toast.success("Report exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Cars Sales & Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Track purchases, rentals, and revenue analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
            <ShoppingBag className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSold}</div>
            <p className="text-xs opacity-80 mt-1">Total purchases</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cars Rented</CardTitle>
            <Key className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRented}</div>
            <p className="text-xs opacity-80 mt-1">Total rentals</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
            <DollarSign className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.totalSalesRevenue.toLocaleString()}
            </div>
            <p className="text-xs opacity-80 mt-1">From purchases</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rental Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.totalRentalsRevenue.toLocaleString()}
            </div>
            <p className="text-xs opacity-80 mt-1">From rentals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer, email, or car name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: $${value.toLocaleString()}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Cars by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCarsByRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill={COLORS.purchase} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
              <p className="text-muted-foreground mt-2">
                Car purchases and rentals will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {transaction.id.substring(0, 8)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyId(transaction.id)}
                          >
                            {copiedId === transaction.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(
                              new Date(transaction.transaction_date),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={transaction.cars.image_url}
                            alt={transaction.cars.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{transaction.cars.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ${Number(transaction.cars.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transaction.sale_type === "purchase"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          }
                        >
                          {transaction.sale_type === "purchase" ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Purchase
                            </>
                          ) : (
                            <>
                              <Key className="h-3 w-3 mr-1" />
                              Rental
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customer_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.customer_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowReceiptDialog(true);
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Dialogs */}
      {selectedTransaction && (
        <>
          <TransactionDetailDialog
            transaction={selectedTransaction}
            open={showDetailDialog}
            onOpenChange={setShowDetailDialog}
          />
          <ReceiptGenerator
            transaction={selectedTransaction}
            open={showReceiptDialog}
            onOpenChange={setShowReceiptDialog}
          />
        </>
      )}
    </div>
  );
}
