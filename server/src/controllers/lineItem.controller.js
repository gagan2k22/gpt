const prisma = require('../prisma');

// Get all line items with pagination and optimized queries
const getLineItems = async (req, res) => {
    try {
        const { page = 1, limit = 100, uid } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = uid ? { uid: { contains: uid } } : {};

        // Fetch only necessary fields to reduce memory usage
        const lineItems = await prisma.lineItem.findMany({
            where,
            select: {
                id: true,
                uid: true,
                parent_uid: true,
                po_id: true,
                vendor_id: true,
                service_description: true,
                service_start_date: true,
                service_end_date: true,
                tower_id: true,
                budget_head_id: true,
                unit_cost: true,
                quantity: true,
                total_cost: true,
                fy25_allocation_amount: true,
                tower: { select: { id: true, name: true } },
                budget_head: { select: { id: true, name: true } },
                vendor: { select: { id: true, name: true } },
                po_entity: { select: { id: true, name: true } },
                service_type: { select: { id: true, name: true } },
                allocation_basis: { select: { id: true, name: true } },
                po: { select: { id: true, po_number: true } }
            },
            orderBy: { uid: 'asc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        // Get total count for pagination
        const total = await prisma.lineItem.count({ where });

        res.json({
            data: lineItems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching line items:', error);
        res.status(500).json({ message: 'Error fetching line items' });
    }
};

// Create a new line item
const createLineItem = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['uid', 'vendor_id', 'service_description', 'tower_id', 'budget_head_id', 'unit_cost', 'quantity', 'total_cost'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }

        const {
            uid,
            parent_uid,
            po_id,
            vendor_id,
            service_description,
            service_start_date,
            service_end_date,
            tower_id,
            budget_head_id,
            po_entity_id,
            service_type_id,
            allocation_basis_id,
            is_renewal,
            unit_cost,
            quantity,
            total_cost,
            fiscal_year,
            remarks
        } = req.body;

        // Validate numeric values
        const numericFields = {
            vendor_id: parseInt(vendor_id),
            tower_id: parseInt(tower_id),
            budget_head_id: parseInt(budget_head_id),
            unit_cost: parseFloat(unit_cost),
            quantity: parseInt(quantity),
            total_cost: parseFloat(total_cost)
        };

        // Check for NaN values
        for (const [field, value] of Object.entries(numericFields)) {
            if (isNaN(value)) {
                return res.status(400).json({
                    message: 'Invalid numeric value',
                    field,
                    value: req.body[field]
                });
            }
        }

        // Validate positive values
        if (numericFields.unit_cost < 0 || numericFields.quantity < 0 || numericFields.total_cost < 0) {
            return res.status(400).json({
                message: 'Unit cost, quantity, and total cost must be non-negative'
            });
        }

        // Check if UID already exists
        const existingItem = await prisma.lineItem.findUnique({
            where: { uid }
        });

        if (existingItem) {
            return res.status(400).json({
                message: 'UID already exists. Please use a unique UID.',
                existingUID: uid
            });
        }

        // Verify foreign key references exist (parallel queries for better performance)
        const [vendor, tower, budgetHead] = await Promise.all([
            prisma.vendor.findUnique({ where: { id: numericFields.vendor_id }, select: { id: true } }),
            prisma.tower.findUnique({ where: { id: numericFields.tower_id }, select: { id: true } }),
            prisma.budgetHead.findUnique({ where: { id: numericFields.budget_head_id }, select: { id: true } })
        ]);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found', vendor_id: numericFields.vendor_id });
        }
        if (!tower) {
            return res.status(404).json({ message: 'Tower not found', tower_id: numericFields.tower_id });
        }
        if (!budgetHead) {
            return res.status(404).json({ message: 'Budget Head not found', budget_head_id: numericFields.budget_head_id });
        }

        // Map total_cost to the appropriate fiscal year allocation field
        const fyYear = fiscal_year ? parseInt(fiscal_year) : null;
        const allocationData = {
            fy25_allocation_amount: fyYear === 2025 ? numericFields.total_cost : null,
            fy26_allocation_amount: fyYear === 2026 ? numericFields.total_cost : null,
            fy27_allocation_amount: fyYear === 2027 ? numericFields.total_cost : null
        };

        const lineItem = await prisma.lineItem.create({
            data: {
                uid,
                parent_uid: parent_uid || null,
                po_id: po_id ? parseInt(po_id) : null,
                vendor_id: numericFields.vendor_id,
                service_description,
                service_start_date: service_start_date ? new Date(service_start_date) : null,
                service_end_date: service_end_date ? new Date(service_end_date) : null,
                tower_id: numericFields.tower_id,
                budget_head_id: numericFields.budget_head_id,
                po_entity_id: po_entity_id ? parseInt(po_entity_id) : null,
                service_type_id: service_type_id ? parseInt(service_type_id) : null,
                allocation_basis_id: allocation_basis_id ? parseInt(allocation_basis_id) : null,
                is_renewal: Boolean(is_renewal),
                unit_cost: numericFields.unit_cost,
                quantity: numericFields.quantity,
                total_cost: numericFields.total_cost,
                fiscal_year: fyYear,
                ...allocationData,
                remarks: remarks || null
            },
            include: {
                tower: true,
                budget_head: true,
                po_entity: true,
                service_type: true,
                allocation_basis: true,
                vendor: true,
                po: true
            }
        });

        res.status(201).json(lineItem);
    } catch (error) {
        console.error('Error creating line item:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(409).json({
                message: 'Duplicate entry',
                field: error.meta?.target
            });
        }

        if (error.code === 'P2003') {
            return res.status(404).json({
                message: 'Foreign key constraint failed',
                field: error.meta?.field_name
            });
        }

        res.status(500).json({
            message: 'Error creating line item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update a line item
const updateLineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Convert date strings to Date objects
        if (updateData.service_start_date) {
            updateData.service_start_date = new Date(updateData.service_start_date);
        }
        if (updateData.service_end_date) {
            updateData.service_end_date = new Date(updateData.service_end_date);
        }

        // Convert numeric fields
        if (updateData.vendor_id) updateData.vendor_id = parseInt(updateData.vendor_id);
        if (updateData.tower_id) updateData.tower_id = parseInt(updateData.tower_id);
        if (updateData.budget_head_id) updateData.budget_head_id = parseInt(updateData.budget_head_id);
        if (updateData.unit_cost) updateData.unit_cost = parseFloat(updateData.unit_cost);
        if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
        if (updateData.total_cost) updateData.total_cost = parseFloat(updateData.total_cost);

        const lineItem = await prisma.lineItem.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                tower: true,
                budget_head: true,
                po_entity: true,
                service_type: true,
                allocation_basis: true,
                vendor: true,
                po: true
            }
        });

        res.json(lineItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a line item
const deleteLineItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lineItem.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Line item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLineItems,
    createLineItem,
    updateLineItem,
    deleteLineItem
};
