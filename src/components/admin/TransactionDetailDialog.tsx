import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Car, User, DollarSign, Mail, Phone, FileText } from "lucide-react";

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

interface TransactionDetailDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{transaction.id}</p>
                </div>
                <Badge
                  className={
                    transaction.sale_type === "purchase"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-purple-500 hover:bg-purple-600"
                  }
                >
                  {transaction.sale_type === "purchase" ? "Purchase" : "Rental"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(transaction.transaction_date), "MMMM dd, yyyy 'at' HH:mm")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Car Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Car Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <img
                src={transaction.cars.image_url}
                alt={transaction.cars.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="space-y-2">
                <h4 className="text-xl font-semibold">{transaction.cars.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{transaction.cars.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year</p>
                    <p className="font-medium">{transaction.cars.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mileage</p>
                    <p className="font-medium">{transaction.cars.mileage?.toLocaleString()} miles</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Original Price</p>
                    <p className="font-medium">${Number(transaction.cars.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{transaction.customer_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{transaction.customer_email}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction Type</span>
                <span className="font-medium capitalize">{transaction.sale_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Original Car Price</span>
                <span className="font-medium">${Number(transaction.cars.price).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${Number(transaction.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
