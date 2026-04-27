'use client';

import { useState } from 'react';

interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
}

export default function CSVImportSection() {
  const [importType, setImportType] = useState<'books' | 'members'>('books');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('importType', importType);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Import failed');
        return;
      }

      setResult(data.result);
      setFile(null);
      // Reset file input
      const input = document.getElementById('fileInput') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err) {
      setError('Error importing file. Please try again.');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleFile = importType === 'books' ? 'books_sample.csv' : 'members_sample.csv';
    const element = document.createElement('a');
    element.href = `/samples/${sampleFile}`;
    element.download = sampleFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Import Type Selection and Upload */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📤 Bulk Import</h3>

        <div className="space-y-4">
          {/* Import Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to import?
            </label>
            <div className="flex gap-4">
              {[
                { type: 'books', label: '📚 Books', desc: 'Import book collection' },
                { type: 'members', label: '👥 Members', desc: 'Import library members' },
              ].map(({ type, label, desc }) => (
                <button
                  key={type}
                  onClick={() => {
                    setImportType(type as any);
                    setResult(null);
                    setError('');
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition text-left ${
                    importType === type
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CSV Upload */}
          <form onSubmit={handleImport} className="space-y-4">
            <div className="border-2 border-dashed border-indigo-300 p-6 rounded-lg text-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                disabled={loading}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-3xl mb-2">📁</span>
                <span className="font-semibold text-gray-700">
                  Click to upload CSV or drag & drop
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  CSV format only (Max 10MB)
                </span>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                  ✓ File selected: {file.name}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!file || loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
              >
                {loading ? '⏳ Importing...' : '📤 Import CSV'}
              </button>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                📥 Download Sample
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Import Result */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-bold text-lg mb-4">Import Results</h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Successfully Imported</p>
              <p className="text-3xl font-bold text-green-600">
                {result.importedCount}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">
                {result.failedCount}
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h5 className="font-semibold text-red-900 mb-2">Errors</h5>
              <div className="text-sm text-red-700 space-y-1">
                {result.errors.slice(0, 5).map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
                {result.errors.length > 5 && (
                  <p>... and {result.errors.length - 5} more errors</p>
                )}
              </div>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
              <h5 className="font-semibold text-yellow-900 mb-2">Warnings</h5>
              <div className="text-sm text-yellow-700 space-y-1">
                {result.warnings.map((warn, idx) => (
                  <p key={idx}>• {warn}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Format Info */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-3">CSV Format Requirements</h4>
        <div className="text-sm text-blue-800 space-y-2">
          {importType === 'books' ? (
            <>
              <p>
                <strong>Required columns:</strong> title, author, isbn, category, quantity
              </p>
              <p>
                <strong>Example:</strong> "The Great Gatsby,F. Scott Fitzgerald,978-0-7432-7356-5,Fiction,5"
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Required columns:</strong> name, role, joindate
              </p>
              <p>
                <strong>Example:</strong> "Alice Johnson,student,2024-01-15"
              </p>
              <p>
                <strong>Valid roles:</strong> student, teacher, librarian
              </p>
            </>
          )}
          <p className="mt-3">
            📥 <strong>Download a sample CSV</strong> to see the exact format.
          </p>
        </div>
      </div>
    </div>
  );
}
