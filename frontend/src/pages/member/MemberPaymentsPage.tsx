import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Receipt, Eye, Printer, DollarSign, Calendar } from 'lucide-react';

export const MemberPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/payments/my-history');
      setPayments(res.data || []);
    } catch (err) {
      console.error('Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  const openReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const totalSpent = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Payment History & Receipts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all your membership payments, renewal dues, and download official invoices.
        </p>
      </div>

      {/* Summary Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase font-bold text-slate-400">Total Membership Investment</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            ${totalSpent.toFixed(2)} USD
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {payments.length} Lifetime Transactions
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      {p.subscription?.plan?.name || p.notes || 'Membership Dues'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {p.method}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReceipt(p)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Official Payment Receipt"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-black text-lg text-slate-900">ClubHub Membership</h4>
                  <p className="text-xs text-slate-500">Official Receipt</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-sky-700">
                    {selectedPayment.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedPayment.paidAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase">Item Description:</p>
                  <p className="font-bold text-slate-800 mt-1">
                    {selectedPayment.subscription?.plan?.name || selectedPayment.notes || 'Membership Dues'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase">Status:</p>
                  <div className="mt-1">
                    <Badge status={selectedPayment.status} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Total Paid</span>
                  <span>${selectedPayment.amount.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
