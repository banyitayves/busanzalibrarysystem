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
      if (data.report) {
        setReports([data.report, ...reports]);
      }
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📊 Generate Library Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { type: 'daily', label: 'Daily Report' },
            { type: 'weekly', label: 'Weekly Report' },
            { type: 'monthly', label: 'Monthly Report' },
            { type: 'inventory', label: 'Inventory Report' },
          ].map(({ type, label }) => (
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> Use reports to track total books, borrow activity, overdue items, members, missing items, and class-level library usage.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Generated Reports</h3>
        {reports.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            No reports generated yet. Create one above to view library totals.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-4 rounded-lg shadow">
                <div
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                >
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-500">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-2xl text-gray-400">{expandedReport === report.id ? '▼' : '▶'}</div>
                </div>

                {expandedReport === report.id && (
                  <div className="mt-4 space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Total Books</p>
                        <p className="text-2xl font-bold text-slate-900">{report.data.totalBooks ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Available</p>
                        <p className="text-2xl font-bold text-green-700">{report.data.availableBooks ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Borrowed</p>
                        <p className="text-2xl font-bold text-orange-700">{report.data.borrowedBooks ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Overdue</p>
                        <p className="text-2xl font-bold text-red-700">{report.data.overdueBooks ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Missing</p>
                        <p className="text-2xl font-bold text-yellow-700">{report.data.missingBooks ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Total Members</p>
                        <p className="text-2xl font-bold text-purple-700">{report.data.totalMembers ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Students</p>
                        <p className="text-2xl font-bold text-slate-900">{report.data.studentCount ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-gray-600">Teachers</p>
                        <p className="text-2xl font-bold text-slate-900">{report.data.teacherCount ?? '—'}</p>
                      </div>
                    </div>

                    {report.data.classes && report.data.classes.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <h5 className="font-semibold mb-3">Class Student Counts</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {report.data.classes.map((cls: any) => (
                            <div key={cls.name} className="rounded-lg border p-3 bg-white">
                              <div className="font-semibold">{cls.name}</div>
                              <div className="text-gray-500">Students: {cls.studentCount}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {report.data.topBorrowedBooks && report.data.topBorrowedBooks.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-lg border">
                          <h5 className="font-semibold mb-3">Top Borrowed Books</h5>
                          <div className="text-sm space-y-2">
                            {report.data.topBorrowedBooks.map((book: any, idx: number) => (
                              <div key={idx} className="flex justify-between gap-3">
                                <span>{book.title}</span>
                                <span className="font-semibold">{book.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.data.mostActiveBorrowers && report.data.mostActiveBorrowers.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-lg border">
                          <h5 className="font-semibold mb-3">Most Active Borrowers</h5>
                          <div className="text-sm space-y-2">
                            {report.data.mostActiveBorrowers.map((borrower: any, idx: number) => (
                              <div key={idx} className="flex justify-between gap-3">
                                <span>{borrower.name}</span>
                                <span className="font-semibold">{borrower.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleExportCSV(report.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        📥 Export CSV
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        🗑️ Delete Report
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
