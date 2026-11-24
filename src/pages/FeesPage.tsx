import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Invoice, InvoiceStatus, FeeCategory } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { StatCard } from '../components/common/StatCard.tsx';
import {
  DollarSign,
  Receipt,
  Search,
  Plus,
  CreditCard,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { calculateFeeMetrics } from '../utils/academicCalculations.ts';

export const FeesPage: React.FC = () => {
  const { invoices, students, addInvoice, recordPayment, settings } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);

  // New Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: students[0]?.id || '',
    category: 'Tuition' as FeeCategory,
    description: '',
    amount: 1000,
    discount: 0,
    dueDate: '2026-12-15',
  });

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash' | 'Cheque'>('Card');

  const metrics = calculateFeeMetrics(invoices);

  const filteredInvoices = invoices.filter((inv) => {
    const student = students.find((s) => s.id === inv.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || inv.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = Math.max(0, invoiceForm.amount - invoiceForm.discount);
    addInvoice({
      invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      studentId: invoiceForm.studentId,
      category: invoiceForm.category,
      description: invoiceForm.description || `${invoiceForm.category} Fee Assessment`,
      amount: invoiceForm.amount,
      discount: invoiceForm.discount,
      lateFee: 0,
      totalAmount,
      dueDate: invoiceForm.dueDate,
      issueDate: new Date().toISOString().split('T')[0],
    });
    setIsInvoiceModalOpen(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || paymentAmount <= 0) return;

    recordPayment(
      selectedInvoiceForPayment.id,
      paymentAmount,
      paymentMethod,
      currentUser.name
    );
    setSelectedInvoiceForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Student Billing & Fee Accounting
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Tuition ledger, auxiliary charges, payment receipts, and collection tracking.
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsInvoiceModalOpen(true)}
        >
          Generate Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed"
          value={`$${metrics.totalBilled.toLocaleString()}`}
          subtitle="Cumulative fee assessments"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Total Collected"
          value={`$${metrics.totalCollected.toLocaleString()}`}
          subtitle={`${metrics.collectionRate}% clearance rate`}
          icon={<Receipt className="w-5 h-5" />}
          trend={{ value: `${metrics.collectionRate}%`, isPositive: true }}
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${metrics.totalOutstanding.toLocaleString()}`}
          subtitle="Receivables across students"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: 'Pending', isPositive: false }}
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length}
          subtitle={`${invoices.filter((i) => i.status === 'paid').length} settled in full`}
          icon={<CreditCard className="w-5 h-5" />}
        />
      </div>

      {/* Filters & Search */}
      <div className="glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number or student name..."
            className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="Tuition">Tuition</option>
            <option value="Transport">Transport</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Extracurricular">Extracurricular</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 light:divide-slate-200/70 text-xs">
              {filteredInvoices.map((inv) => {
                const student = students.find((s) => s.id === inv.studentId);
                const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200 light:text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-100 light:text-slate-900">
                        {student ? `${student.firstName} ${student.lastName}` : 'Student N/A'}
                      </p>
                      <p className="text-[11px] text-slate-400 light:text-slate-600 font-mono">
                        {student?.admissionNumber}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 light:text-slate-700">{inv.category}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200 light:text-slate-900">
                      ${inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 light:text-emerald-700 font-semibold">
                      ${inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 light:text-slate-600">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'success'
                            : inv.status === 'partial'
                            ? 'warning'
                            : inv.status === 'overdue'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {remaining > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedInvoiceForPayment(inv);
                              setPaymentAmount(remaining);
                            }}
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          title="View Official Receipt"
                          onClick={() => setSelectedInvoiceForReceipt(inv)}
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <Modal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          title={`Record Fee Payment: ${selectedInvoiceForPayment.invoiceNumber}`}
          subtitle={`Student: ${students.find((s) => s.id === selectedInvoiceForPayment.studentId)?.firstName || 'Student'}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoiceForPayment(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handlePaymentSubmit}>
                Confirm & Generate Receipt
              </Button>
            </div>
          }
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-xs space-y-1 font-mono text-slate-200 light:text-slate-900">
              <div className="flex justify-between">
                <span className="text-slate-400 light:text-slate-600">Total Assessment:</span>
                <span>${selectedInvoiceForPayment.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 light:text-slate-600">Already Credited:</span>
                <span className="text-emerald-400 light:text-emerald-700">${selectedInvoiceForPayment.paidAmount}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-800 light:border-slate-200 pt-1 text-slate-200 light:text-slate-900">
                <span>Remaining Due:</span>
                <span>${selectedInvoiceForPayment.totalAmount - selectedInvoiceForPayment.paidAmount}</span>
              </div>
            </div>

            <Input
              label="Payment Amount (USD) *"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              max={selectedInvoiceForPayment.totalAmount - selectedInvoiceForPayment.paidAmount}
              min={1}
            />

            <Select
              label="Payment Method *"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              options={[
                { value: 'Card', label: 'Credit / Debit Card' },
                { value: 'Bank Transfer', label: 'ACH / Wire Transfer' },
                { value: 'Cash', label: 'Cash at Counter' },
                { value: 'Cheque', label: 'Cashier Cheque' },
              ]}
            />
          </form>
        </Modal>
      )}

      {/* Official Receipt Modal */}
      {selectedInvoiceForReceipt && (
        <Modal
          isOpen={!!selectedInvoiceForReceipt}
          onClose={() => setSelectedInvoiceForReceipt(null)}
          title="Official Fee Payment Receipt"
          subtitle="Tax Compliant Institutional Document"
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button size="sm" onClick={() => setSelectedInvoiceForReceipt(null)}>
                Done
              </Button>
            </div>
          }
        >
          <div className="p-6 rounded-xl glass-panel border border-slate-800 light:border-slate-200 light:bg-white text-xs space-y-5 text-slate-200 light:text-slate-900">
            {/* School Header */}
            <div className="text-center pb-4 border-b border-slate-800 light:border-slate-200">
              <h3 className="text-base font-bold text-slate-100 light:text-slate-900">{settings.schoolName}</h3>
              <p className="text-[11px] text-slate-400 light:text-slate-600">{settings.address}</p>
              <p className="text-[10px] text-slate-400 light:text-slate-500 font-mono mt-1">AFFILIATION: {settings.affiliationNumber}</p>
            </div>

            {/* Receipt Metadata */}
            <div className="grid grid-cols-2 gap-4 text-slate-300 light:text-slate-700">
              <div>
                <p className="text-slate-400 light:text-slate-500 text-[10px]">STUDENT NAME</p>
                <p className="font-semibold text-slate-100 light:text-slate-900">
                  {students.find((s) => s.id === selectedInvoiceForReceipt.studentId)?.firstName}{' '}
                  {students.find((s) => s.id === selectedInvoiceForReceipt.studentId)?.lastName}
                </p>
                <p className="text-[11px] text-slate-400 light:text-slate-600 font-mono">
                  {students.find((s) => s.id === selectedInvoiceForReceipt.studentId)?.admissionNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 light:text-slate-500 text-[10px]">INVOICE NUMBER</p>
                <p className="font-mono font-semibold text-slate-100 light:text-slate-900">{selectedInvoiceForReceipt.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 light:text-slate-600 font-mono">DATE: {selectedInvoiceForReceipt.issueDate}</p>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-800 light:border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-900/80 light:bg-slate-100 px-3 py-2 flex justify-between font-semibold text-slate-400 light:text-slate-600 text-[11px]">
                <span>DESCRIPTION</span>
                <span>AMOUNT</span>
              </div>
              <div className="p-3 flex justify-between border-t border-slate-800/60 light:border-slate-200">
                <span>{selectedInvoiceForReceipt.description} ({selectedInvoiceForReceipt.category})</span>
                <span className="font-mono font-semibold">${selectedInvoiceForReceipt.totalAmount}</span>
              </div>
              <div className="bg-slate-900/40 light:bg-slate-50 p-3 border-t border-slate-800 light:border-slate-200 flex justify-between font-bold text-slate-100 light:text-slate-900">
                <span>Total Paid</span>
                <span className="font-mono text-emerald-400 light:text-emerald-700">${selectedInvoiceForReceipt.paidAmount}</span>
              </div>
            </div>

            {/* Transaction record */}
            {selectedInvoiceForReceipt.transactions.length > 0 && (
              <div className="text-[11px] text-slate-400 light:text-slate-600 space-y-1">
                <p className="font-semibold text-slate-300 light:text-slate-800">Transaction History:</p>
                {selectedInvoiceForReceipt.transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between font-mono">
                    <span>{tx.receiptNumber} ({tx.method}) - {tx.date}</span>
                    <span>${tx.amount}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center pt-4 border-t border-slate-800 light:border-slate-200 text-[10px] text-slate-400 light:text-slate-500">
              This is a computer generated official fee voucher. No signature required.
            </div>
          </div>
        </Modal>
      )}

      {/* Add Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Student Fee Assessment"
        subtitle="Issue an invoice to a registered student account"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <Select
            label="Target Student *"
            value={invoiceForm.studentId}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
            options={students.map((s) => ({
              value: s.id,
              label: `${s.firstName} ${s.lastName} (${s.admissionNumber})`,
            }))}
          />

          <Select
            label="Fee Category *"
            value={invoiceForm.category}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, category: e.target.value as any })}
            options={[
              { value: 'Tuition', label: 'Academic Tuition' },
              { value: 'Transport', label: 'Bus Transport Service' },
              { value: 'Laboratory', label: 'Science / Computing Lab Fee' },
              { value: 'Extracurricular', label: 'Extracurricular & Athletics' },
            ]}
          />

          <Input
            label="Description"
            value={invoiceForm.description}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
            placeholder="e.g. Semester 2 Comprehensive Tuition"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Billed Amount ($) *"
              type="number"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
            />
            <Input
              label="Waiver / Scholarship ($)"
              type="number"
              value={invoiceForm.discount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Payment Due Date *"
            type="date"
            value={invoiceForm.dueDate}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
