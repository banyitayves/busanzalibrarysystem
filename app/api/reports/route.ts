import { NextResponse } from 'next/server';

interface LibraryReport {
  id: string;
  title: string;
  generatedAt: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'inventory';
  data: {
    totalBooks?: number;
    availableBooks?: number;
    borrowedBooks?: number;
    reservedBooks?: number;
    overdueBooks?: number;
    totalMembers?: number;
    activeMembers?: number;
    studentCount?: number;
    teacherCount?: number;
    librarianCount?: number;
    topBorrowedBooks?: Array<{ title: string; count: number }>;
    mostActiveBorrowers?: Array<{ name: string; count: number }>;
    monthlyStats?: Array<{ month: string; borrowCount: number }>;
  };
}

// In-memory storage
let reports: LibraryReport[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get('reportType');

  if (reportType) {
    const typeReports = reports.filter((r) => r.reportType === reportType);
    return NextResponse.json(typeReports);
  }

  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const { reportType } = await request.json();

  if (!reportType) {
    return NextResponse.json({ error: 'reportType required' }, { status: 400 });
  }

  // Generate mock report data
  const reportData = {
    totalBooks: 4250,
    availableBooks: 2890,
    borrowedBooks: 1200,
    reservedBooks: 160,
    overdueBooks: 45,
    totalMembers: 856,
    activeMembers: 612,
    studentCount: 534,
    teacherCount: 189,
    librarianCount: 5,
    topBorrowedBooks: [
      { title: 'The Great Gatsby', count: 245 },
      { title: 'Python Crash Course', count: 198 },
      { title: 'Atomic Habits', count: 176 },
      { title: 'To Kill a Mockingbird', count: 154 },
      { title: '1984', count: 142 },
    ],
    mostActiveBorrowers: [
      { name: 'Alice Johnson', count: 34 },
      { name: 'Bob Smith', count: 28 },
      { name: 'Carol Williams', count: 25 },
      { name: 'David Brown', count: 22 },
      { name: 'Emma Davis', count: 19 },
    ],
    monthlyStats: [
      { month: 'January', borrowCount: 456 },
      { month: 'February', borrowCount: 523 },
      { month: 'March', borrowCount: 587 },
      { month: 'April', borrowCount: 612 },
      { month: 'May', borrowCount: 578 },
      { month: 'June', borrowCount: 634 },
    ],
  };

  const newReport: LibraryReport = {
    id: `report_${Date.now()}`,
    title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
    generatedAt: new Date().toISOString(),
    reportType: reportType as 'daily' | 'weekly' | 'monthly' | 'inventory',
    data: reportData,
  };

  reports.push(newReport);

  return NextResponse.json({
    success: true,
    report: newReport,
    message: `${reportType} report generated successfully`,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    return NextResponse.json({ error: 'reportId required' }, { status: 400 });
  }

  reports = reports.filter((r) => r.id !== reportId);

  return NextResponse.json({ success: true, message: 'Report deleted' });
}

// Export report as CSV
export async function PUT(request: Request) {
  const { reportId } = await request.json();

  if (!reportId) {
    return NextResponse.json({ error: 'reportId required' }, { status: 400 });
  }

  const report = reports.find((r) => r.id === reportId);

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Generate CSV content
  const csvContent = generateCSV(report);

  return NextResponse.json({
    success: true,
    csv: csvContent,
    fileName: `library_report_${report.reportType}_${new Date().toISOString().split('T')[0]}.csv`,
  });
}

function generateCSV(report: LibraryReport): string {
  let csv = `Library Report - ${report.reportType}\n`;
  csv += `Generated: ${report.generatedAt}\n\n`;

  const data = report.data;

  if (data.totalBooks !== undefined) {
    csv += `Total Books,${data.totalBooks}\n`;
    csv += `Available Books,${data.availableBooks}\n`;
    csv += `Borrowed Books,${data.borrowedBooks}\n`;
    csv += `Reserved Books,${data.reservedBooks}\n`;
    csv += `Overdue Books,${data.overdueBooks}\n\n`;
  }

  if (data.totalMembers !== undefined) {
    csv += `Total Members,${data.totalMembers}\n`;
    csv += `Active Members,${data.activeMembers}\n`;
    csv += `Students,${data.studentCount}\n`;
    csv += `Teachers,${data.teacherCount}\n`;
    csv += `Librarians,${data.librarianCount}\n\n`;
  }

  if (data.topBorrowedBooks) {
    csv += `\nTop Borrowed Books\n`;
    csv += `Title,Borrows\n`;
    data.topBorrowedBooks.forEach((book) => {
      csv += `"${book.title}",${book.count}\n`;
    });
  }

  if (data.mostActiveBorrowers) {
    csv += `\nMost Active Borrowers\n`;
    csv += `Name,Borrows\n`;
    data.mostActiveBorrowers.forEach((borrower) => {
      csv += `"${borrower.name}",${borrower.count}\n`;
    });
  }

  return csv;
}
