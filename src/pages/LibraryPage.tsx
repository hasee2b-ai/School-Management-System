import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Book, BookLoan } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { Tabs } from '../components/common/Tabs.tsx';
import { Library, Plus, Search, BookCheck, Undo2, Clock, AlertCircle } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const { books, loans, students, addBook, issueBook, returnBook } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'loans'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);

  // Add Book Form
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
    category: 'Computer Science',
    edition: 'Standard Edition',
    totalCopies: 5,
    shelfLocation: 'Stack-B4',
  });

  // Issue Book Form
  const [issueForm, setIssueForm] = useState({
    bookId: books[0]?.id || '',
    studentId: students[0]?.id || '',
    dueDate: '2026-12-05',
  });

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim()) return;

    addBook({
      ...bookForm,
      copiesAvailable: bookForm.totalCopies,
    });
    setIsAddBookOpen(false);
    setBookForm({
      title: '',
      author: '',
      isbn: '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
      category: 'Computer Science',
      edition: 'Standard Edition',
      totalCopies: 5,
      shelfLocation: 'Stack-B4',
    });
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.studentId) return;

    issueBook(issueForm.bookId, issueForm.studentId, issueForm.dueDate);
    setIsIssueBookOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Media Center & Library Catalog
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Physical holdings, ISBN classification, circulation loans, and overdue fine management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<BookCheck className="w-4 h-4" />}
            onClick={() => setIsIssueBookOpen(true)}
          >
            Issue Book
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddBookOpen(true)}
          >
            Add New Title
          </Button>
        </div>
      </div>

      {/* Segmented Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          tabs={[
            { id: 'catalog', label: 'Catalog Volumes', count: books.length },
            { id: 'loans', label: 'Circulation & Loans', count: loans.length },
          ]}
        />

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, ISBN..."
            className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Catalog View */}
      {activeTab === 'catalog' && (
        <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Title & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Shelf Stack</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 light:divide-slate-200/70">
                {filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-100 light:text-slate-900">
                        {book.title}
                      </p>
                      <p className="text-[11px] text-slate-400 light:text-slate-600">
                        {book.author} · {book.edition}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                      {book.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 light:text-slate-600">
                      {book.isbn}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-400 light:text-indigo-600">
                      {book.shelfLocation}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={book.copiesAvailable > 0 ? 'success' : 'danger'}
                        size="sm"
                      >
                        {book.copiesAvailable} / {book.totalCopies} Available
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {book.copiesAvailable > 0 ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIssueForm({ ...issueForm, bookId: book.id });
                            setIsIssueBookOpen(true);
                          }}
                        >
                          Check Out
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Reserved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Circulation Loans View */}
      {activeTab === 'loans' && (
        <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrower Student</th>
                  <th className="py-3 px-4">Issued On</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 light:divide-slate-200/70">
                {loans.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  const student = students.find((s) => s.id === loan.studentId);

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-100 light:text-slate-900">
                        {book?.title || 'Unknown Title'}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200 light:text-slate-900">
                          {student ? `${student.firstName} ${student.lastName}` : 'Student'}
                        </p>
                        <p className="text-[10px] text-slate-400 light:text-slate-600 font-mono">
                          {student?.admissionNumber}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 light:text-slate-600">
                        {loan.issueDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 light:text-slate-800">
                        {loan.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            loan.status === 'borrowed'
                              ? 'default'
                              : loan.status === 'overdue'
                              ? 'danger'
                              : 'success'
                          }
                          size="sm"
                        >
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {loan.status !== 'returned' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Undo2 className="w-3.5 h-3.5" />}
                            onClick={() => returnBook(loan.id)}
                          >
                            Return Book
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueBookOpen}
        onClose={() => setIsIssueBookOpen(false)}
        title="Check Out Book Loan"
        subtitle="Issue volume from physical library catalog"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsIssueBookOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleIssueSubmit}>
              Confirm Checkout
            </Button>
          </div>
        }
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <Select
            label="Select Book Title *"
            value={issueForm.bookId}
            onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
            options={books
              .filter((b) => b.copiesAvailable > 0)
              .map((b) => ({
                value: b.id,
                label: `${b.title} (${b.copiesAvailable} in stack)`,
              }))}
          />

          <Select
            label="Borrowing Student *"
            value={issueForm.studentId}
            onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
            options={students.map((s) => ({
              value: s.id,
              label: `${s.firstName} ${s.lastName} (${s.admissionNumber})`,
            }))}
          />

          <Input
            label="Return Due Date *"
            type="date"
            value={issueForm.dueDate}
            onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
          />
        </form>
      </Modal>

      {/* Add Book Modal */}
      <Modal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        title="Register New Library Book"
        subtitle="Catalog volume into central inventory"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddBookOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddBookSubmit}>
              Save to Catalog
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddBookSubmit} className="space-y-4">
          <Input
            label="Book Title *"
            value={bookForm.title}
            onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
            placeholder="e.g. Modern Operating Systems"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Author *"
              value={bookForm.author}
              onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
              placeholder="e.g. Andrew S. Tanenbaum"
            />
            <Input
              label="ISBN *"
              value={bookForm.isbn}
              onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Genre / Category *"
              value={bookForm.category}
              onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
              options={[
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Literature', label: 'Literature' },
                { value: 'History', label: 'History' },
              ]}
            />
            <Input
              label="Total Copy Count *"
              type="number"
              value={bookForm.totalCopies}
              onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Shelf Stack Location"
            value={bookForm.shelfLocation}
            onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
            placeholder="e.g. Stack-B4-Row2"
          />
        </form>
      </Modal>
    </div>
  );
};
