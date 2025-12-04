const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');
const { normalizeToMMM } = require('../utils/monthNormaliser');

class BudgetImportService {
    async processImport(fileBuffer, userId, options = {}) {
        const { dryRun = true, createMissingMasters = false } = options;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1); // Assume first sheet

        const report = {
            totalRows: 0,
            accepted: [],
            rejected: []
        };
        const headerMapping = { rawHeaders: [], normalizedHeaders: [] };

        // Header processing
        const headerRow = worksheet.getRow(1);
        const headers = [];
        headerRow.eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value ? cell.value.toString() : '';
        });

        // Identify columns
        const columnMap = {};
        const monthColumns = {};

        headers.forEach((header, index) => {
            if (!header) return;
            headerMapping.rawHeaders.push(header);

            const lower = header.toLowerCase();
            if (lower === 'uid') columnMap.uid = index;
            else if (lower === 'description' || lower === 'service description') columnMap.description = index;
            else if (lower === 'tower') columnMap.tower = index;
            else if (lower === 'budget head') columnMap.budgetHead = index;
            else if (lower === 'total') columnMap.total = index;
            else {
                try {
                    const mmm = normalizeToMMM(header);
                    monthColumns[mmm] = index;
                    headerMapping.normalizedHeaders.push(mmm);
                } catch (e) {
                    headerMapping.normalizedHeaders.push(header); // Keep original if not a month
                }
            }
        });

        if (!columnMap.uid) {
            throw new Error('UID column is missing');
        }

        // Row processing
        const rowsToUpsert = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            report.totalRows++;

            const rowData = {};
            const errors = [];

            const uidCell = row.getCell(columnMap.uid);
            const uid = uidCell.value ? uidCell.value.toString() : null;

            if (!uid) {
                errors.push('Missing UID');
            } else {
                rowData.uid = uid;
            }

            rowData.description = columnMap.description ? (row.getCell(columnMap.description).value ? row.getCell(columnMap.description).value.toString() : '') : '';
            rowData.tower = columnMap.tower ? (row.getCell(columnMap.tower).value ? row.getCell(columnMap.tower).value.toString() : null) : null;
            rowData.budgetHead = columnMap.budgetHead ? (row.getCell(columnMap.budgetHead).value ? row.getCell(columnMap.budgetHead).value.toString() : null) : null;

            const computedMonths = {};
            let sumMonths = 0;

            for (const [mmm, colIndex] of Object.entries(monthColumns)) {
                const val = row.getCell(colIndex).value;
                const num = parseFloat(val) || 0;
                if (isNaN(num)) errors.push(`Invalid amount for ${mmm}`);
                computedMonths[mmm] = num;
                sumMonths += num;
            }

            rowData.computedMonths = computedMonths;
            rowData.sumMonths = sumMonths;

            const totalBudget = columnMap.total ? (parseFloat(row.getCell(columnMap.total).value) || 0) : 0;
            rowData.totalBudget = totalBudget;

            // Tolerance check
            if (Math.abs(sumMonths - totalBudget) > 0.5) {
                errors.push(`Total mismatch: Sum(${sumMonths}) != Total(${totalBudget})`);
            }

            if (errors.length > 0) {
                report.rejected.push({ rowIndex: rowNumber, uid: rowData.uid, errors });
            } else {
                report.accepted.push({ rowIndex: rowNumber, uid: rowData.uid, computedMonths, sumMonths, totalBudget, ...rowData });
                rowsToUpsert.push(rowData);
            }
        });

        if (dryRun) {
            return { dryRun: true, report, headerMapping };
        }

        // Commit logic
        const results = await prisma.$transaction(async (tx) => {
            const imported = [];
            for (const row of rowsToUpsert) {
                // Master Data Lookup/Create
                let towerId = null;
                if (row.tower) {
                    const t = await tx.tower.findFirst({ where: { name: row.tower } });
                    if (t) towerId = t.id;
                    // else create if createMissingMasters
                }

                let budgetHeadId = null;
                if (row.budgetHead) {
                    const bh = await tx.budgetHead.findFirst({ where: { name: row.budgetHead } });
                    if (bh) budgetHeadId = bh.id;
                }

                const lineItem = await tx.lineItem.upsert({
                    where: { uid: row.uid },
                    create: {
                        uid: row.uid,
                        description: row.description,
                        towerId,
                        budgetHeadId,
                        totalBudget: row.totalBudget,
                        createdBy: userId
                    },
                    update: {
                        description: row.description || undefined,
                        towerId: towerId || undefined,
                        budgetHeadId: budgetHeadId || undefined,
                        totalBudget: row.totalBudget,
                        updatedBy: userId
                    }
                });

                // Upsert months
                for (const [mmm, amount] of Object.entries(row.computedMonths)) {
                    await tx.budgetMonth.upsert({
                        where: { lineitem_month_unique: { lineItemId: lineItem.id, month: mmm } },
                        create: { lineItemId: lineItem.id, month: mmm, amount },
                        update: { amount }
                    });
                }

                // Audit Log
                await tx.auditLog.create({
                    data: {
                        entity: 'LineItem',
                        entityId: lineItem.id,
                        action: 'IMPORT_UPSERT',
                        userId: userId,
                        diff: JSON.stringify(row) // Simplified diff
                    }
                });

                imported.push({ uid: lineItem.uid, lineItemId: lineItem.id });
            }
            // Create Import Job record
            await tx.importJob.create({
                data: {
                    userId,
                    filename: 'Budget Import', // We might need to pass filename from controller
                    fileSize: 0, // Placeholder
                    rowsTotal: report.totalRows,
                    rowsAccepted: rowsToUpsert.length,
                    rowsRejected: report.rejected.length,
                    status: 'Completed',
                    importType: 'budgets',
                    metadata: JSON.stringify({ headerMapping })
                }
            });

            return imported;
        });

        return { success: true, imported: results.length, details: results };
    }
}

module.exports = new BudgetImportService();
