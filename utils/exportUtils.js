// utils/exportUtils.js
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export class ExportUtils {
    /*
     * Get CSV data from array of objects
     */
    static async generateCSV(data, fields) {
        try {
            const json2csvParser = new Parser({ fields });
            return json2csvParser.parse(data);
        } catch (error) {
            throw new Error(`CSV generation failed: ${error.message}`);
        }
    }

    /*
     * Generate Excel file from data
     */
    static async generateExcel(data, sheetName = 'Sheet1', filename = 'export.xlsx') {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);

            // Add headers
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                worksheet.addRow(headers);

                // Add data rows
                data.forEach(row => {
                    const rowData = headers.map(header => row[header] || '');
                    worksheet.addRow(rowData);
                });

                // Style header row
                worksheet.getRow(1).font = { bold: true };
                worksheet.columns.forEach(column => {
                    column.width = 20;
                });
            }

            const buffer = await workbook.xlsx.writeBuffer();
            return {
                buffer,
                filename,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        } catch (error) {
            throw new Error(`Excel generation failed: ${error.message}`);
        }
    }

    /*
     * Generate PDF from data
     */
static async generatePDF(data, columns, title = 'Export') {
    return new Promise((resolve, reject) => {
        try {
            const chunks = [];
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 30
            });

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const rowHeightPadding = 6;
            const headerHeight = 28;
            let y = doc.y;

            /* ---------------- HEADER ---------------- */
            const drawHeader = () => {
                doc
                    .fontSize(16)
                    .font('Helvetica-Bold')
                    .text(title, {
                        align: 'center'
                    });

                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#555')
                    .text(`Generated on: ${new Date().toLocaleString()}`, {
                        align: 'right'
                    });

                doc.moveDown(1.5);
                y = doc.y;
            };

            /* ---------------- TABLE HEADER ---------------- */
            const drawTableHeader = () => {
                let x = doc.page.margins.left;

                doc
                    .rect(x, y, pageWidth, headerHeight)
                    .fill('#F0F0F0');

                doc.fillColor('#000').font('Helvetica-Bold').fontSize(10);

                columns.forEach(col => {
                    const width = col.width || pageWidth / columns.length;
                    doc.text(col.header, x + 5, y + 8, {
                        width: width - 10,
                        align: col.align || 'left'
                    });
                    x += width;
                });

                y += headerHeight;
            };

            /* ---------------- FOOTER ---------------- */
            const drawFooter = () => {
                const pageNumber = doc.page.number;
                doc.fontSize(9)
                    .fillColor('#666')
                    .text(`Page ${pageNumber}`, 0, doc.page.height - 25, {
                        align: 'center'
                    });
            };

            drawHeader();
            drawTableHeader();

            /* ---------------- TABLE BODY ---------------- */
            doc.font('Helvetica').fontSize(9);

            data.forEach((row, rowIndex) => {
                let x = doc.page.margins.left;
                let rowHeight = 0;

                // Calculate max row height
                columns.forEach(col => {
                    const text = String(row[col.field] ?? '');
                    const width = col.width || pageWidth / columns.length;
                    const height = doc.heightOfString(text, {
                        width: width - 10
                    });
                    rowHeight = Math.max(rowHeight, height);
                });

                rowHeight += rowHeightPadding * 2;

                // Page break
                if (y + rowHeight > doc.page.height - 50) {
                    drawFooter();
                    doc.addPage();
                    drawHeader();
                    drawTableHeader();
                }

                // Zebra striping
                if (rowIndex % 2 === 0) {
                    doc
                        .rect(doc.page.margins.left, y, pageWidth, rowHeight)
                        .fill('#FAFAFA');
                }

                doc.fillColor('#000');

                // Draw row content
                columns.forEach(col => {
                    const width = col.width || pageWidth / columns.length;
                    doc.text(
                        String(row[col.field] ?? ''),
                        x + 5,
                        y + rowHeightPadding,
                        {
                            width: width - 10,
                            align: col.align || 'left'
                        }
                    );
                    x += width;
                });

                // Row divider
                doc
                    .strokeColor('#DDD')
                    .moveTo(doc.page.margins.left, y + rowHeight)
                    .lineTo(doc.page.margins.left + pageWidth, y + rowHeight)
                    .stroke();

                y += rowHeight;
            });

            drawFooter();
            doc.end();
        } catch (error) {
            reject(new Error(`PDF generation failed: ${error.message}`));
        }
    });
}


    /*
     * Get formatted data for clipboard copy
     */
    static getCopyData(data, format = 'text') {
        if (format === 'html') {
            let html = '<table><thead><tr>';
            const headers = Object.keys(data[0] || {});

            headers.forEach(header => {
                html += `<th>${header}</th>`;
            });

            html += '</tr></thead><tbody>';

            data.forEach(row => {
                html += '<tr>';
                headers.forEach(header => {
                    html += `<td>${row[header] || ''}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        }

        // Default: tab-separated text
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        let text = headers.join('\t') + '\n';

        data.forEach(row => {
            text += headers.map(header => row[header] || '').join('\t') + '\n';
        });

        return text;
    }

    /*
     * Get columns configuration with visibility
     */
    static getColumnsWithVisibility(columns, hiddenColumns = {}) {
        return {
            visibleColumns: columns.filter(col => !hiddenColumns[col.field]),
            hiddenColumns: columns.filter(col => hiddenColumns[col.field])
        };
    }
}