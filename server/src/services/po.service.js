const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class POService {
    /**
     * Create a new PO with linked line items
     */
    async createPO(data, userId) {
        const {
            poNumber,
            poDate,
            vendorId,
            currency,
            poValue,
            exchangeRate = 1.0,
            linkedLineItems = [], // Array of { id, allocatedAmount }
            remarks,
            towerId,
            budgetHeadId,
            prNumber,
            prDate
        } = data;

        // Calculate derived values
        const commonCurrencyValue = parseFloat(poValue) * parseFloat(exchangeRate);
        const valueInLac = commonCurrencyValue / 100000;

        // Start transaction
        return await prisma.$transaction(async (tx) => {
            // 1. Create PO
            const po = await tx.pO.create({
                data: {
                    poNumber,
                    poDate: new Date(poDate),
                    vendorId: parseInt(vendorId),
                    currency,
                    poValue: parseFloat(poValue),
                    exchangeRate: parseFloat(exchangeRate),
                    commonCurrencyValue,
                    valueInLac,
                    status: 'Draft',
                    prNumber,
                    prDate: prDate ? new Date(prDate) : null,
                    towerId: towerId ? parseInt(towerId) : null,
                    budgetHeadId: budgetHeadId ? parseInt(budgetHeadId) : null,
                }
            });

            // 2. Link Line Items
            if (linkedLineItems && linkedLineItems.length > 0) {
                await tx.pOLineItem.createMany({
                    data: linkedLineItems.map(item => ({
                        po_id: po.id,
                        line_item_id: item.id,
                        allocated_amount: parseFloat(item.allocatedAmount || 0)
                    }))
                });
            }

            // 3. Log Activity
            await tx.auditLog.create({
                data: {
                    entity: 'PO',
                    entityId: po.id,
                    action: 'CREATE',
                    userId,
                    diff: { poNumber, poValue, linkedItemsCount: linkedLineItems.length }
                }
            });

            return po;
        });
    }

    /**
     * Update an existing PO
     */
    async updatePO(id, data, userId) {
        const {
            poNumber,
            poDate,
            vendorId,
            currency,
            poValue,
            exchangeRate,
            linkedLineItems,
            status,
            towerId,
            budgetHeadId,
            prNumber,
            prDate
        } = data;

        const poId = parseInt(id);

        // Calculate derived values if value or rate changes
        let updateData = { ...data };
        if (poValue || exchangeRate) {
            const currentPO = await prisma.pO.findUnique({ where: { id: poId } });
            const val = parseFloat(poValue || currentPO.poValue);
            const rate = parseFloat(exchangeRate || currentPO.exchangeRate || 1);
            updateData.commonCurrencyValue = val * rate;
            updateData.valueInLac = updateData.commonCurrencyValue / 100000;
        }

        // Clean up data for Prisma
        delete updateData.linkedLineItems;
        if (updateData.poDate) updateData.poDate = new Date(updateData.poDate);
        if (updateData.prDate) updateData.prDate = new Date(updateData.prDate);
        if (updateData.vendorId) updateData.vendorId = parseInt(updateData.vendorId);
        if (updateData.towerId) updateData.towerId = parseInt(updateData.towerId);
        if (updateData.budgetHeadId) updateData.budgetHeadId = parseInt(updateData.budgetHeadId);
        if (updateData.poValue) updateData.poValue = parseFloat(updateData.poValue);
        if (updateData.exchangeRate) updateData.exchangeRate = parseFloat(updateData.exchangeRate);

        return await prisma.$transaction(async (tx) => {
            // 1. Update PO
            const po = await tx.pO.update({
                where: { id: poId },
                data: updateData
            });

            // 2. Update Linked Items (if provided)
            if (linkedLineItems) {
                // Delete existing links
                await tx.pOLineItem.deleteMany({ where: { po_id: poId } });

                // Create new links
                if (linkedLineItems.length > 0) {
                    await tx.pOLineItem.createMany({
                        data: linkedLineItems.map(item => ({
                            po_id: poId,
                            line_item_id: item.id,
                            allocated_amount: parseFloat(item.allocatedAmount || 0)
                        }))
                    });
                }
            }

            // 3. Log Activity
            await tx.auditLog.create({
                data: {
                    entity: 'PO',
                    entityId: poId,
                    action: 'UPDATE',
                    userId,
                    diff: data
                }
            });

            return po;
        });
    }

    /**
     * Get PO by ID with details
     */
    async getPO(id) {
        return await prisma.pO.findUnique({
            where: { id: parseInt(id) },
            include: {
                vendor: true,
                tower: true,
                budgetHead: true,
                poLineItems: {
                    include: {
                        lineItem: {
                            include: {
                                tower: true,
                                budgetHead: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * List POs with pagination and filters
     */
    async listPOs(params) {
        const { page = 1, limit = 50, search, status, vendorId } = params;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.OR = [
                { poNumber: { contains: search } },
                { prNumber: { contains: search } }
            ];
        }
        if (status) where.status = status;
        if (vendorId) where.vendorId = parseInt(vendorId);

        const [data, total] = await Promise.all([
            prisma.pO.findMany({
                where,
                include: {
                    vendor: true,
                    _count: { select: { poLineItems: true } }
                },
                orderBy: { poDate: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.pO.count({ where })
        ]);

        return { data, total, page: parseInt(page), limit: parseInt(limit) };
    }
}

module.exports = new POService();
