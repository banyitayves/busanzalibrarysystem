import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, BorderStyle, WidthType, VerticalAlign } from 'docx';
import * as XLSX from 'xlsx';

interface Student {
  name: string;
  email?: string;
  id?: string;
  role?: string;
  className?: string;
  class_name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { className, students, format = 'docx' } = (await request.json()) as {
      className: string;
      students: Student[];
      format?: 'docx' | 'xlsx' | 'csv';
    };

    if (!className || !students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Missing className or students' },
        { status: 400 }
      );
    }

    if (format === 'xlsx') {
      const rows: Array<Array<string>> = [
        ['Class Name', className],
        [],
        ['Student Name', 'Email', 'Student ID', 'Role', 'Class'],
        ...students.map((student) => [
          student.name || 'N/A',
          student.email || 'N/A',
          student.id || 'N/A',
          student.role || 'N/A',
          student.className || student.class_name || className,
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(Buffer.from(buffer), {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${className}_students.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    }

    if (format === 'csv') {
      const header = 'Student Name,Email,Student ID,Role,Class\n';
      const body = students
        .map((student) => {
          const safeName = (student.name || 'N/A').replace(/,/g, ' ');
          const safeEmail = (student.email || 'N/A').replace(/,/g, ' ');
          const safeId = (student.id || 'N/A').replace(/,/g, ' ');
          const safeRole = (student.role || 'N/A').replace(/,/g, ' ');
          const safeClass = (student.className || student.class_name || className).replace(/,/g, ' ');
          return `${safeName},${safeEmail},${safeId},${safeRole},${safeClass}`;
        })
        .join('\n');

      return new NextResponse(`${header}${body}`, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${className}_students.csv"`,
          'Content-Type': 'text/csv;charset=utf-8',
        },
      });
    }

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Student Name', bold: true })] })],
            shading: { fill: '4472C4' },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE },
              bottom: { style: BorderStyle.SINGLE },
              left: { style: BorderStyle.SINGLE },
              right: { style: BorderStyle.SINGLE },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })],
            shading: { fill: '4472C4' },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE },
              bottom: { style: BorderStyle.SINGLE },
              left: { style: BorderStyle.SINGLE },
              right: { style: BorderStyle.SINGLE },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Student ID', bold: true })] })],
            shading: { fill: '4472C4' },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE },
              bottom: { style: BorderStyle.SINGLE },
              left: { style: BorderStyle.SINGLE },
              right: { style: BorderStyle.SINGLE },
            },
          }),
        ],
        height: { value: 400, rule: 'auto' },
      }),
      ...students.map((student, index) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(student.name || 'N/A')] })],
              borders: {
                top: { style: BorderStyle.SINGLE },
                bottom: { style: BorderStyle.SINGLE },
                left: { style: BorderStyle.SINGLE },
                right: { style: BorderStyle.SINGLE },
              },
              shading: index % 2 === 0 ? { fill: 'F2F2F2' } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(student.email || 'N/A')] })],
              borders: {
                top: { style: BorderStyle.SINGLE },
                bottom: { style: BorderStyle.SINGLE },
                left: { style: BorderStyle.SINGLE },
                right: { style: BorderStyle.SINGLE },
              },
              shading: index % 2 === 0 ? { fill: 'F2F2F2' } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(student.id || 'N/A')] })],
              borders: {
                top: { style: BorderStyle.SINGLE },
                bottom: { style: BorderStyle.SINGLE },
                left: { style: BorderStyle.SINGLE },
                right: { style: BorderStyle.SINGLE },
              },
              shading: index % 2 === 0 ? { fill: 'F2F2F2' } : undefined,
            }),
          ],
        })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: `${className} - Student List`,
              heading: 'Heading1',
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on: ${new Date().toLocaleString()}`,
                  italics: true,
                  color: '666666',
                }),
              ],
              spacing: { after: 400 },
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Total Students: ${students.length}`, bold: true })],
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${className}_students.docx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    });
  } catch (error) {
    console.error('Error exporting students:', error);
    return NextResponse.json(
      { error: 'Failed to export students: ' + String(error) },
      { status: 500 }
    );
  }
}
