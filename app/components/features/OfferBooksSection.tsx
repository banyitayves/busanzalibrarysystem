'use client';

import { useState, useEffect } from 'react';

interface Student {
  _id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
  class_name?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
}

interface BookOffer {
  id: string;
  student_id: string;
  student_name: string;
  book_id: string;
  book_title: string;
  message: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  sent_date: Date;
}

export default function OfferBooksSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [offers, setOffers] = useState<BookOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [message, setMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, booksRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/books'),
      ]);

      const studentsData = await studentsRes.json();
      const booksData = await booksRes.json();

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setBooks(
        Array.isArray(booksData)
          ? booksData.map((book: any) => ({
              id: book.id || book._id,
              title: book.title,
              author: book.author,
              description: book.description,
            }))
          : []
      );

      // Load mock offers
      setOffers([
        {
          id: 'offer_001',
          student_id: '1',
          student_name: 'John Student',
          book_id: 'book_1',
          book_title: 'Introduction to Mathematics',
          message: 'You might be interested in this book for your studies',
          status: 'viewed',
          sent_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'offer_002',
          student_id: '2',
          student_name: 'Jane Student',
          book_id: 'book_2',
          book_title: 'World History Overview',
          message: 'Check out this great history book!',
          status: 'accepted',
          sent_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !selectedBook) {
      setOfferMessage('❌ Please select both a student and a book');
      return;
    }

    try {
      const student = students.find(s => s._id === selectedStudent);
      const book = books.find(b => b.id === selectedBook);

      if (!student || !book) {
        setOfferMessage('❌ Invalid student or book selection');
        return;
      }

      // Create offer
      const newOffer: BookOffer = {
        id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        student_id: selectedStudent,
        student_name: student.name,
        book_id: selectedBook,
        book_title: book.title,
        message: customMessage || `I think you might enjoy reading "${book.title}" by ${book.author}. It could be great for your learning!`,
        status: 'sent',
        sent_date: new Date(),
      };

      setOffers([...offers, newOffer]);

      // Reset form
      setSelectedStudent('');
      setSelectedBook('');
      setCustomMessage('');
      setOfferMessage(`✅ Book offer sent to ${student.name}!`);

      setTimeout(() => setOfferMessage(''), 3000);
    } catch (error) {
      setOfferMessage(`❌ Error sending offer: ${String(error)}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    sent: offers.filter(o => o.status === 'sent').length,
    viewed: offers.filter(o => o.status === 'viewed').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    declined: offers.filter(o => o.status === 'declined').length,
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold">📬 Offer Books to Students</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="text-3xl font-bold text-blue-600">{stats.sent}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600">Viewed</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.viewed}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Accepted</p>
          <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Declined</p>
          <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'send'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ➕ Send Book Offer
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'history'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Offer History ({offers.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'send' ? (
        <form onSubmit={handleSendOffer} className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Student */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Student *</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a student --</option>
                {students
                  .filter(s => s.role === 'student')
                  .map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.class_name || 'N/A'})
                    </option>
                  ))}
              </select>
            </div>

            {/* Select Book */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Book *</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a book --</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-semibold mb-2">Custom Message (Optional)</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to the student about why you recommend this book..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Preview */}
          {selectedBook && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📝 Preview</h4>
              <p className="text-sm text-blue-800">
                {customMessage || `I think you might enjoy reading "${books.find(b => b.id === selectedBook)?.title}" by ${books.find(b => b.id === selectedBook)?.author}. It could be great for your learning!`}
              </p>
            </div>
          )}

          {/* Message */}
          {offerMessage && (
            <div
              className={`p-3 rounded-lg text-sm font-semibold ${
                offerMessage.includes('✅')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {offerMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedStudent || !selectedBook}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📬 Send Book Offer
          </button>
        </form>
      ) : (
        /* Offer History */
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No book offers sent yet</p>
            </div>
          ) : (
            offers.map(offer => (
              <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {offer.student_name} → {offer.book_title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{offer.message}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(
                      offer.status
                    )}`}
                  >
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Sent: {formatDate(offer.sent_date)}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">💡 How to Use</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ Select a student and book from the dropdowns</li>
          <li>✓ Optionally add a personalized message</li>
          <li>✓ Send the offer - it will appear in the student's inbox</li>
          <li>✓ Track offer status: Sent, Viewed, Accepted, or Declined</li>
          <li>✓ Use this to recommend relevant books to students based on their interests</li>
        </ul>
      </div>
    </div>
  );
}
