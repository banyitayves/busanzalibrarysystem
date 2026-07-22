'use client';

import { useEffect, useState } from 'react';

interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
}

interface DatabaseStatus {
  provider: 'mongodb' | 'memory';
  mongodbConfigured: boolean;
  mysqlConfigured: boolean;
  message: string;
}

export default function CSVImportSection() {
  const [importType, setImportType] = useState<'books' | 'members'>('books');
  const [file, setFile] = useState<File | null>(null);
  const [className, setClassName] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDatabaseStatus = async () => {
      try {
        const response = await fetch('/api/import');
        const data = await response.json();
        setDatabaseStatus(data.databaseStatus || null);
      } catch (err) {
        console.error('Failed to load database status', err);
      }
    };

    loadDatabaseStatus();
  }, []);

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
      if (importType === 'members' && className.trim()) {
        formData.append('className', className.trim().toUpperCase());
      }

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
      setDatabaseStatus(data.databaseStatus || null);
      setFile(null);
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📤 Bulk Import</h3>

        <div className="space-y-4">
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

          <form onSubmit={handleImport} className="space-y-4">
            {importType === 'members' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target class for imported students
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Example: S1B"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Use this for all imported students. If your CSV has a class_name column, that value will be used first.
                </p>
              </div>
            )}

            <div className="border-2 border-dashed border-indigo-300 p-6 rounded-lg text-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                disabled={loading}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <span className="text-3xl mb-2">📁</span>
                <span className="font-semibold text-gray-700">Click to upload CSV or drag & drop</span>
                <span className="text-sm text-gray-500 mt-2">CSV format only (Max 10MB)</span>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                  ✓ File selected: {file.name}
                </div>
              )}
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 rounded">⚠️ {error}</div>}

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

      {databaseStatus && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-2">Database status</h4>
          <p className="text-sm text-slate-700">
            Storage layer: <span className="font-semibold">{databaseStatus.provider === 'mongodb' ? 'MongoDB' : 'In-memory fallback'}</span>
          </p>
          <p className="text-sm text-slate-700">
            MySQL env vars: <span className="font-semibold">{databaseStatus.mysqlConfigured ? 'configured' : 'not configured'}</span>
          </p>
          <p className="text-sm text-slate-700">
            MongoDB env vars: <span className="font-semibold">{databaseStatus.mongodbConfigured ? 'configured' : 'not configured'}</span>
          </p>
          <p className="text-sm text-slate-600 mt-2">{databaseStatus.message}</p>
        </div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-bold text-lg mb-4">Import Results</h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Successfully Imported</p>
              <p className="text-3xl font-bold text-green-600">{result.importedCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">{result.failedCount}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h5 className="font-semibold text-red-900 mb-2">Errors</h5>
              <div className="text-sm text-red-700 space-y-1">
                {result.errors.slice(0, 5).map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
                {result.errors.length > 5 && <p>... and {result.errors.length - 5} more errors</p>}
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
                <strong>Optional column:</strong> class_name (or class) to assign a class per row
              </p>
              <p>
                <strong>Example:</strong> "Alice Johnson,student,2024-01-15,S1B"
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
