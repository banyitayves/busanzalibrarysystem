import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, BorderStyle, WidthType, VerticalAlign } from 'docx';

interface Student {
  name: string;
  email: string;
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    const { className, students } = await request.json() as {
      className: string;
      students: Student[];
    };

    if (!className || !students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Missing className or students' },
        { status: 400 }
      );
    }

    // Create table rows
    const tableRows = [
      // Header row
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
      // Data rows
      ...students.map(
        (student, index) =>
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

    // Create the document
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
              children: [new TextRun({
                text: `Generated on: ${new Date().toLocaleString()}`,
                italics: true,
                color: '666666',
              })],
              spacing: { after: 400 },
            }),
            new Table({
              rows: tableRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
            new Paragraph({
              children: [new TextRun({
                text: `Total Students: ${students.length}`,
                bold: true,
              })],
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    // Generate the document
    const buffer = await Packer.toBuffer(doc);

    // Return the buffer as a file
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
