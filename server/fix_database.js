/**
 * server/fix_database.js
 *
 * Run: node server/fix_database.js
 *
 * This script:
 *  - ensures there is at least one FiscalYear (creates sensible FYs if none)
 *  - ensures 'Unassigned' master rows exist for Tower, BudgetHead, CostCentre
 *  - assigns defaults to LineItem rows missing towerId / budgetHeadId / costCentreId / fiscalYearId
 *  - fills missing relationships on budgetBOA records by assigning defaults if required
 *
 * IMPORTANT:
 *  - It is written to be idempotent (safe to run multiple times).
 *  - It will not delete rows, only create or update missing FK references.
 *
 * Adapt prisma import path if your prisma client is exported elsewhere.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function makeFiscalYearName(startDate) {
    // given a Date object (start of FY), produce 'FY25-26' like names
    const startYear = startDate.getFullYear();
    const nextYear = startYear + 1;
    const short = (y) => String(y).slice(-2);
    return `FY${short(startYear)}-${short(nextYear)}`;
}

async function ensureFiscalYears() {
    const count = await prisma.fiscalYear.count();
    if (count > 0) {
        console.log(`FiscalYears exist (count: ${count}) — nothing to create.`);
        return;
    }

    console.log('No FiscalYears found — creating default FYs...');

    // Common corporate FY: Apr 1 to Mar 31 — create a couple of sensible FYs around today
    const today = new Date();
    // make FYs for last two fiscal years and current one
    const yearsToCreate = [];
    const year = today.getFullYear();
    // determine FY start: if today >= Apr 1, FY start is April 1 of current year; else previous year
    const currentFYStartYear = (today.getMonth() + 1) >= 4 ? year : year - 1;
    const fyStarts = [currentFYStartYear - 1, currentFYStartYear, currentFYStartYear + 1];

    for (const startYear of fyStarts) {
        const startDate = new Date(startYear, 3, 1); // April 1
        const endDate = new Date(startYear + 1, 2, 31); // Mar 31 next year (31 Mar)
        const name = makeFiscalYearName(startDate);
        yearsToCreate.push({ name, startDate, endDate, isActive: startYear === currentFYStartYear });
    }

    for (const fy of yearsToCreate) {
        const exists = await prisma.fiscalYear.findUnique({ where: { name: fy.name } });
        if (!exists) {
            await prisma.fiscalYear.create({
                data: {
                    name: fy.name,
                    startDate: fy.startDate,
                    endDate: fy.endDate,
                    isActive: fy.isActive
                }
            });
            console.log(`Created FiscalYear ${fy.name} (${fy.startDate.toISOString().slice(0, 10)} - ${fy.endDate.toISOString().slice(0, 10)})`);
        } else {
            console.log(`FiscalYear ${fy.name} already exists.`);
        }
    }
}

async function ensureMasterUnassigned(tableName, prismaModelName) {
    // ensure there's an 'Unassigned' row in master tables
    const prismaModel = prisma[prismaModelName];
    if (!prismaModel) {
        console.warn(`Prisma model ${prismaModelName} not found — skipping ensureMasterUnassigned for ${tableName}`);
        return null;
    }
    // Check if 'Unassigned' exists (using findFirst since name might not be unique in schema)
    const existing = await prismaModel.findFirst({ where: { name: 'Unassigned' } });
    if (existing) {
        return existing.id;
    }

    // Create 'Unassigned' record
    // Note: Some models might have required fields other than name. 
    // For BudgetHead, tower_id is required.
    let data = { name: 'Unassigned' };

    if (prismaModelName === 'budgetHead') {
        // Need a tower for BudgetHead
        const tower = await prisma.tower.findFirst({ where: { name: 'Unassigned' } });
        if (tower) {
            data.tower_id = tower.id;
        } else {
            // Should have been created already, but just in case
            const newTower = await prisma.tower.create({ data: { name: 'Unassigned' } });
            data.tower_id = newTower.id;
        }
    }

    // Handle other potential required fields if any (based on schema)
    // CostCentre requires 'code' which is unique
    if (prismaModelName === 'costCentre') {
        data.code = 'UNASSIGNED';
    }

    const created = await prismaModel.create({ data });
    console.log(`Created ${tableName} Unassigned (id=${created.id})`);
    return created.id;
}

async function repairLineItems(defaults) {
    // find line items missing required relationships
    const problematic = await prisma.lineItem.findMany({
        where: {
            OR: [
                { towerId: null },
                { budgetHeadId: null },
                { costCentreId: null },
                { fiscalYearId: null }
            ]
        },
        take: 1000
    });
    console.log(`Found ${problematic.length} LineItem(s) missing relationships.`);

    let updated = 0;
    for (const li of problematic) {
        const data = {};
        if (!li.towerId) data.towerId = defaults.towerId;
        if (!li.budgetHeadId) data.budgetHeadId = defaults.budgetHeadId;
        if (!li.costCentreId) data.costCentreId = defaults.costCentreId;
        if (!li.fiscalYearId) data.fiscalYearId = defaults.fiscalYearId;
        if (Object.keys(data).length > 0) {
            await prisma.lineItem.update({ where: { id: li.id }, data });
            updated++;
        }
    }
    console.log(`Updated ${updated} LineItem(s) with default relationships.`);
}

async function repairBudgetBOA(defaults) {
    // budgetBOA naming might differ — try common model names
    const modelNames = ['budgetBOA', 'budgetBoa', 'budgetBoaRecord'];
    let model = null;
    for (const name of modelNames) {
        if (prisma[name]) { model = { name, model: prisma[name] }; break; }
    }
    if (!model) {
        console.log('Could not find budgetBOA model on prisma client; skipping budgetBOA repair.');
        return;
    }

    // find records missing vital fks, check for common fields: towerId, budgetHeadId, lineItemId
    // We'll attempt to fill missing towerId and budgetHeadId.
    // Note: Schema check - BudgetBOA might not exist in current schema if it was renamed or removed.
    // Based on previous context, BudgetBOA might be 'BudgetMonth' or similar, or it's a view.
    // Let's assume the user knows it exists or we skip.

    try {
        const rows = await model.model.findMany({
            where: {
                OR: [
                    { towerId: null },
                    { budgetHeadId: null },
                    { lineItemId: null }
                ]
            },
            take: 1000
        });
        console.log(`Found ${rows.length} ${model.name} row(s) missing relationships.`);

        let updated = 0;
        for (const r of rows) {
            const data = {};
            if (r.towerId === null && defaults.towerId) data.towerId = defaults.towerId;
            if (r.budgetHeadId === null && defaults.budgetHeadId) data.budgetHeadId = defaults.budgetHeadId;
            if (r.lineItemId === null) {
                // try to match lineItem by uid field if present on BOA row (common columns: uid, lineUid)
                if (r.uid) {
                    const li = await prisma.lineItem.findUnique({ where: { uid: r.uid } });
                    if (li) data.lineItemId = li.id;
                }
                // else leave null (we don't create ambiguous links)
            }
            if (Object.keys(data).length > 0) {
                await model.model.update({ where: { id: r.id }, data });
                updated++;
            }
        }
        console.log(`Updated ${updated} ${model.name} row(s) with default relationships where safe.`);
    } catch (e) {
        console.log(`Skipping BudgetBOA repair: ${e.message}`);
    }
}

async function main() {
    try {
        console.log('Starting DB repair script...');
        await ensureFiscalYears();

        // Ensure Unassigned masters exist (Tower, BudgetHead, CostCentre)
        const towerId = await ensureMasterUnassigned('Tower', 'tower').catch((e) => { console.error('Tower err:', e); return null; });
        // BudgetHead needs a tower, so we pass towerId implicitly via logic in ensureMasterUnassigned or rely on it finding 'Unassigned' tower
        const budgetHeadId = await ensureMasterUnassigned('BudgetHead', 'budgetHead').catch((e) => { console.error('BudgetHead err:', e); return null; });
        const costCentreId = await ensureMasterUnassigned('CostCentre', 'costCentre').catch((e) => { console.error('CostCentre err:', e); return null; });

        // pick an active fiscal year (or the first one)
        let fiscal = await prisma.fiscalYear.findFirst({ where: { isActive: true } });
        if (!fiscal) fiscal = await prisma.fiscalYear.findFirst();
        if (!fiscal) {
            console.error('No FiscalYear found even after creation; aborting.');
            process.exit(1);
        }
        console.log(`Using fiscal year: ${fiscal.name} (id=${fiscal.id})`);

        const defaults = { towerId, budgetHeadId, costCentreId, fiscalYearId: fiscal.id };
        await repairLineItems(defaults);
        await repairBudgetBOA(defaults);

        console.log('DB repair script completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error in DB repair script:', err);
        process.exit(2);
    } finally {
        // prisma.$disconnect handled by process exit
    }
}

main();
