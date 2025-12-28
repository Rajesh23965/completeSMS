// controllers/BaseExportController.js
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import { ExportUtils } from '../utils/exportUtils.js';

export class BaseExportController {
    /*
     * Common export handler for all entities
     */
    static async handleExport(req, res, getDataFunction, columns, entityName = 'data') {
        try {
            const { format } = req.query;
            const data = await getDataFunction();

            switch (format) {
                case 'csv': {
                    const fields = columns.map(col => ({
                        label: col.header,
                        value: col.field
                    }));

                    const csv = await ExportUtils.generateCSV(data, fields);

                    res.header('Content-Type', 'text/csv');
                    res.attachment(`${entityName}.csv`);
                    return res.send(csv);
                }


                case 'excel': {
                    const title = entityName;

                    const excelResult = await ExportUtils.generateExcel(
                        data,
                        title
                    );

                    res.setHeader('Content-Type', excelResult.contentType);
                    res.setHeader(
                        'Content-Disposition',
                        `attachment; filename="${title}.xlsx"`
                    );

                    return res.send(excelResult.buffer);
                }



                case 'pdf': {
                    const title = entityName;

                    const pdfBuffer = await this.generatePDF(
                        data,
                        columns,
                        title
                    );

                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader(
                        'Content-Disposition',
                        `attachment; filename="${title}.pdf"`
                    );

                    return res.send(pdfBuffer);
                }


                case 'copy': {
                    const copyData = ExportUtils.getCopyData(
                        data,
                        req.query.copyFormat
                    );

                    return res.json({
                        success: true,
                        data: copyData,
                        format: req.query.copyFormat || 'text'
                    });
                }


                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid export format'
                    });
            }
        } catch (error) {
            console.error(`Export error for ${entityName}:`, error);
            return res.status(500).json({
                success: false,
                message: 'Export failed',
                error: error.message
            });
        }
    }

    /*
     * Generate CSV data
     */
    static async generateCSV(data, fields) {
        try {
            const json2csvParser = new Parser({ fields });
            return json2csvParser.parse(data);
        } catch (error) {
            throw new Error(`CSV generation failed: ${error.message}`);
        }
    }

    /**
     * Generate Excel file
     */
    static async generateExcel(data, columns, sheetName = 'Sheet1') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        if (columns.length > 0) {
            worksheet.addRow(columns.map(c => c.header));
            worksheet.getRow(1).font = { bold: true };

            data.forEach(row => {
                worksheet.addRow(
                    columns.map(col => row[col.field] ?? '')
                );
            });

            worksheet.columns = columns.map(col => ({
                width: col.width ? col.width / 7 : 20
            }));
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            buffer,
            contentType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    }


    /*
     * Generate PDF file
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
     * Get copy data
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

    /**
     * Get columns configuration
     */
    static getColumnsConfig(req, columns) {
        let hiddenColumns = {};

        try {
            hiddenColumns = req.cookies?.hiddenColumns
                ? JSON.parse(req.cookies.hiddenColumns)
                : {};
        } catch {
            hiddenColumns = {};
        }

        return {
            visibleColumns: columns.filter(col => !hiddenColumns[col.field]),
            hiddenColumns: columns.filter(col => hiddenColumns[col.field])
        };
    }

    /*
     * Save column visibility
     */
    static saveColumnVisibility(req, res) {
        try {
            const { hiddenColumns } = req.body;
            res.cookie('hiddenColumns', JSON.stringify(hiddenColumns || {}), {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });

            return res.json({
                success: true,
                message: 'Column visibility saved'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to save column visibility'
            });
        }
    }
}