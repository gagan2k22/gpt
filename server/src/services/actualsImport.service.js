const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');
const monthNormaliser = require('../utils/monthNormaliser');

class ActualsImportService {
    /**
     * Process Excel file for actuals import
     */
    async processImport(fileBuffer, userId, dryRun = true) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1);

        const report = {
            totalRows: 0,
            accepted: [],
            rejected: []
        };

        // Header mapping
        const headerRow = worksheet.getRow(1).values;
        const headers = this.mapHeaders(headerRow);

        if (!headers.invoiceNo || !headers.amount || !headers.invoiceDate) {
            throw new Error('Missing required columns: Invoice No, Invoice Date, Amount');
        }

        // Process rows
        const rowsToProcess = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const rowData = {
                invoiceNo: this.getCellValue(row, headers.invoiceNo),
                invoiceDate: this.getCellValue(row, headers.invoiceDate),
                amount: this.getCellValue(row, headers.amount),
                currency: this.getCellValue(row, headers.currency) || 'INR',
                uid: this.getCellValue(row, headers.uid),
                vendorName: this.getCellValue(row, headers.vendorName),
                remarks: this.getCellValue(row, headers.remarks)
            };

            const validation = this.validateRow(rowData, rowNumber);
            if (validation.isValid) {
                rowsToProcess.push({ ...rowData, ...validation.data });
                report.accepted.push({ rowIndex: rowNumber, ...rowData });
            } else {
                report.rejected.push({ rowIndex: rowNumber, errors: validation.errors, ...rowData });
            }
        });

        report.totalRows = rowsToProcess.length + report.rejected.length;

        if (!dryRun && rowsToProcess.length > 0) {
            await this.commitImport(rowsToProcess, userId);
        }

        return { dryRun, report };
    }

    mapHeaders(rowValues) {
        const map = {};
        rowValues.forEach((val, index) => {
            if (!val) return;
            const header = val.toString().toLowerCase().trim();
            if (header.includes('invoice no')) map.invoiceNo = index;
            else if (header.includes('date')) map.invoiceDate = index;
            else if (header.includes('amount')) map.amount = index;
            else if (header.includes('currency')) map.currency = index;
            else if (header.includes('uid') || header.includes('line item')) map.uid = index;
            else if (header.includes('vendor')) map.vendorName = index;
            else if (header.includes('remark')) map.remarks = index;
        });
        return map;
    }

    getCellValue(row, index) {
        if (!index) return null;
        const cell = row.getCell(index);
        return cell.value ? cell.value.toString() : null;
    }

    validateRow(data, rowIndex) {
        const errors = [];
        const cleanData = {};

        // Date validation
        const date = new Date(data.invoiceDate);
        if (isNaN(date.getTime())) {
            errors.push('Invalid Invoice Date');
        } else {
            cleanData.invoiceDate = date;
            // Derive month
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            cleanData.month = months[date.getMonth()];
        }

        // Amount validation
        const amount = parseFloat(data.amount);
        if (isNaN(amount)) {
            errors.push('Invalid Amount');
        } else {
            cleanData.amount = amount;
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: cleanData
        };
    }

    async commitImport(rows, userId) {
        return await prisma.$transaction(async (tx) => {
            let importedCount = 0;

            for (const row of rows) {
                // Find Line Item
                let lineItemId = null;
                if (row.uid) {
                    const lineItem = await tx.lineItem.findUnique({ where: { uid: row.uid } });
                    if (lineItem) lineItemId = lineItem.id;
                }

                // Find Vendor
                let vendorId = null;
                if (row.vendorName) {
                    const vendor = await tx.vendor.findFirst({ where: { name: row.vendorName } });
                    if (vendor) vendorId = vendor.id;
                }

                // Create Actual
                await tx.actual.create({
                    data: {
                        invoiceNo: row.invoiceNo,
                        invoiceDate: row.invoiceDate,
                        amount: row.amount,
                        currency: row.currency,
                        convertedAmount: row.currency === 'INR' ? row.amount : null, // Todo: conversion
                        lineItemId,
                        vendorId,
                        month: row.month
                    }
                });
                importedCount++;
            }

            // Create Import Job record
            await tx.importJob.create({
                data: {
                    userId,
                    filename: 'Actuals Import',
                    fileSize: 0,
                    rowsTotal: rows.length, // Only accepted rows reach here in current logic
                    rowsAccepted: importedCount,
                    rowsRejected: 0, // Rejected are filtered out before commit
                    status: 'Completed',
                    importType: 'actuals'
                }
            });

            // Audit Log
            await tx.auditLog.create({
                data: {
                    entity: 'Actual',
                    action: 'IMPORT',
                    userId,
                    diff: JSON.stringify({ count: importedCount })
                }
            });

            return importedCount;
        });
    }
}

module.exports = new ActualsImportService();
