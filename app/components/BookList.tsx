'use client';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  quantity: number;
  status: 'available' | 'borrowed' | 'reserved';
}

interface BookListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export default function BookList({ books, onEdit, onDelete }: BookListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'borrowed':
        return 'bg-orange-100 text-orange-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '✓';
      case 'borrowed':
        return '📤';
      case 'reserved':
        return '📌';
      default:
        return '•';
    }
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No books in the library yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex-1 pr-2 line-clamp-2">
              {book.title}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                book.status
              )}`}
            >
              {getStatusIcon(book.status)} {book.status}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-1">
            <span className="font-semibold">By:</span> {book.author}
          </p>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p>
              <span className="font-semibold">ISBN:</span> {book.isbn}
            </p>
            <p>
              <span className="font-semibold">Published:</span> {book.publishedYear}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span>{' '}
              <span className="text-indigo-600 font-bold">{book.quantity}</span>
            </p>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => onEdit(book)}
              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition font-semibold"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(book.id)}
              className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
