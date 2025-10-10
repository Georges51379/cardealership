import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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

interface ReceiptGeneratorProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReceiptGenerator({
  transaction,
  open,
  onOpenChange,
}: ReceiptGeneratorProps) {
  const { data: settings } = useSiteSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-2xl font-heading">Receipt</DialogTitle>
          <div className="flex gap-2 pt-4">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </DialogHeader>

        {/* Receipt Content */}
        <div className="receipt-content bg-white text-black p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            {settings?.logo_url && (
              <img
                src={settings.logo_url}
                alt="Company Logo"
                className="h-16 mx-auto"
              />
            )}
            <h1 className="text-3xl font-bold font-heading">
              {settings?.site_title || "Premium Car Dealership"}
            </h1>
            <p className="text-sm text-gray-600">Official Transaction Receipt</p>
          </div>

          <Separator className="border-gray-300" />

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Receipt Number</p>
              <p className="font-mono font-medium">{transaction.id.substring(0, 13).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Date</p>
              <p className="font-medium">
                {format(new Date(transaction.transaction_date), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>

          <Separator className="border-gray-300" />

          {/* Customer Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Name:</span>{" "}
                <span className="font-medium">{transaction.customer_name}</span>
              </p>
              <p>
                <span className="text-gray-600">Email:</span>{" "}
                <span className="font-medium">{transaction.customer_email}</span>
              </p>
            </div>
          </div>

          <Separator className="border-gray-300" />

          {/* Transaction Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Transaction Details</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <img
                  src={transaction.cars.image_url}
                  alt={transaction.cars.name}
                  className="w-24 h-24 object-cover rounded border border-gray-200"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{transaction.cars.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    <p>Year: {transaction.cars.year}</p>
                    <p>Category: {transaction.cars.category}</p>
                    <p>Mileage: {transaction.cars.mileage?.toLocaleString()} miles</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Type:</span>
                  <span className="font-medium capitalize">{transaction.sale_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle Price:</span>
                  <span className="font-medium">${Number(transaction.cars.price).toLocaleString()}</span>
                </div>
                <Separator className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>${Number(transaction.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="border-gray-300" />

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 space-y-2 pt-4">
            <p className="font-semibold">Thank you for your business!</p>
            <p>
              This receipt confirms your {transaction.sale_type} transaction.
              Please retain this for your records.
            </p>
            <p className="pt-2">
              For any inquiries, please contact us through our website.
            </p>
          </div>

          {/* Print timestamp */}
          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
            <p>Printed on {format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}</p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .receipt-content,
            .receipt-content * {
              visibility: visible;
            }
            .receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 2rem;
            }
            @page {
              margin: 1cm;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
