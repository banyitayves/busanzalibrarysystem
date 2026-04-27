'use client';

import { useState } from 'react';

interface Report {
  id: string;
  title: string;
  generatedAt: string;
  reportType: string;
  data: any;
}

export default function LibraryReportsSection() {
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const handleGenerateReport = async (reportType: 'daily' | 'weekly' | 'monthly' | 'inventory') => {
    try {
      setGenerating(true);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });
      const data = await response.json();
      setReports([data.report, ...reports]);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = async (reportId: string) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      const data = await response.json();

      // Create and download CSV file
      const element = document.createElement('a');
      const file = new Blob([data.csv], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = data.fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await fetch(`/api/reports?reportId=${reportId}`, { method: 'DELETE' });
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📊 Generate Reports</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'daily', label: '📅 Daily Report', icon: '📆' },
            { type: 'weekly', label: '📊 Weekly Report', icon: '📈' },
            { type: 'monthly', label: '📉 Monthly Report', icon: '📊' },
            { type: 'inventory', label: '📚 Inventory Report', icon: '📋' },
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => handleGenerateReport(type as any)}
              disabled={generating}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold text-sm"
            >
              {generating ? '⏳ Generating...' : label}
            </button>
          ))}
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
          <p className="text-xs text-blue-900">
            <strong>💡 Tip:</strong> Generate reports to analyze library activities, book usage, and member engagement. Export as CSV for further analysis.
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Generated Reports</h3>
        {reports.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            No reports generated yet. Create one above!
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-4 rounded-lg shadow">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() =>
                    setExpandedReport(
                      expandedReport === report.id ? null : report.id
                    )
                  }
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-600">
                      Generated: {new Date(report.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {expandedReport === report.id ? '▼' : '▶'}
                  </div>
                </div>

                {expandedReport === report.id && (
                  <div className="mt-4 space-y-3 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {report.data.totalBooks !== undefined && (
                        <>
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-gray-600">Total Books</p>
                            <p className="font-bold text-lg">
                              {report.data.totalBooks}
                            </p>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-gray-600">Available</p>
                            <p className="font-bold text-lg">
                              {report.data.availableBooks}
                            </p>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <p className="text-gray-600">Borrowed</p>
                            <p className="font-bold text-lg">
                              {report.data.borrowedBooks}
                            </p>
                          </div>
                          <div className="bg-red-50 p-2 rounded">
                            <p className="text-gray-600">Overdue</p>
                            <p className="font-bold text-lg">
                              {report.data.overdueBooks}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {report.data.topBorrowedBooks && (
                      <div>
                        <h5 className="font-semibold mb-2">Top Borrowed Books</h5>
                        <div className="text-sm space-y-1">
                          {report.data.topBorrowedBooks.map((book: any, idx: number) => (
                            <p key={idx} className="flex justify-between">
                              <span>{book.title}</span>
                              <span className="font-bold">{book.count}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportCSV(report.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                      >
                        📥 Export CSV
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
