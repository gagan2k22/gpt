const prisma = require('../prisma');
const nodemailer = require('nodemailer');
const { getFiscalYear } = require('../utils/fiscalYear');
const { convertCurrency } = require('./currencyRate.controller');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

// Helper: Validate PO Input
const validatePOInput = async (data, id = null) => {
    const { pr_number, pr_date, po_date, po_start_date, po_end_date } = data;
    const errors = [];

    if (pr_number) {
        const where = { pr_number };
        if (id) where.id = { not: parseInt(id) };
        const existingPO = await prisma.pO.findFirst({ where });
        if (existingPO) errors.push(`PR Number "${pr_number}" already exists.`);
    }

    if (pr_date && po_date && new Date(pr_date) <= new Date(po_date)) {
        errors.push('PR Date must be after PO Date');
    }

    if (po_start_date && po_end_date && new Date(po_start_date) >= new Date(po_end_date)) {
        errors.push('Service Start Date must be before Service End Date');
    }

    return errors;
};

const getPOs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Optimized query with selective fields
        const pos = await prisma.pO.findMany({
            select: {
                id: true,
                po_number: true,
                po_date: true,
                total_po_value: true,
                currency: true,
                status: true,
                vendor: { select: { id: true, name: true } },
                tower: { select: { id: true, name: true } },
                budget_head: { select: { id: true, name: true } },
                created_by: { select: { name: true } },
                approved_by: { select: { name: true } },
                line_items: { select: { id: true, uid: true, service_description: true, total_cost: true } }
            },
            orderBy: { po_date: 'desc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const total = await prisma.pO.count();

        res.json({
            data: pos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching POs:', error);
        res.status(500).json({ message: 'Error fetching POs' });
    }
};

const getPOById = async (req, res) => {
    try {
        const { id } = req.params;
        const po = await prisma.pO.findUnique({
            where: { id: parseInt(id) },
            include: {
                vendor: true,
                tower: true,
                budget_head: true,
                po_entity: true,
                created_by: { select: { name: true } },
                approved_by: { select: { name: true } },
                line_items: true
            }
        });
        if (!po) return res.status(404).json({ message: 'PO not found' });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBudgetDetailsByUID = async (req, res) => {
    try {
        const { uid } = req.params;

        const lineItems = await prisma.lineItem.findMany({
            where: { uid },
            select: {
                id: true,
                service_description: true,
                budget_head_id: true,
                tower_id: true,
                vendor_id: true,
                fy25_allocation_amount: true,
                budget_head: { select: { name: true } },
                po_entity: { select: { name: true } }
            }
        });

        if (lineItems.length === 0) {
            return res.status(404).json({ message: 'UID not found' });
        }

        const totalBudget = lineItems.reduce((sum, item) => sum + (item.fy25_allocation_amount || 0), 0);
        const totalActual = 0; // Placeholder

        res.json({
            uid,
            service_description: lineItems[0].service_description,
            budget_head: lineItems[0].budget_head.name,
            budget_head_id: lineItems[0].budget_head_id,
            totalBudget,
            totalActual,
            tower_id: lineItems[0].tower_id,
            vendor_id: lineItems[0].vendor_id
        });

    } catch (error) {
        console.error('Error fetching budget details:', error);
        res.status(500).json({ message: 'Error fetching budget details' });
    }
};

const createPO = async (req, res) => {
    try {
        const {
            po_number, vendor_id, tower_id, budget_head_id, po_entity_id,
            po_date, po_start_date, po_end_date, total_po_value, line_items,
            pr_number, pr_date,
            currency = 'INR',
            fiscal_year,
            uid_details
        } = req.body;

        // Validation
        const validationErrors = await validatePOInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join('; ') });
        }

        // Budget Alert
        if (uid_details) {
            const { totalBudget, totalActual } = uid_details;
            if (totalActual > totalBudget) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: 'Gagan.sharma@hubl.com',
                    subject: `Budget Exceeded Alert: PO ${po_number}`,
                    text: `Budget exceeded for service. PO: ${po_number}. Budget: ${totalBudget}, Actual: ${totalActual}`
                };
                transporter.sendMail(mailOptions).catch(err => console.error('Email failed:', err));
            }
        }

        // Currency Conversion
        let common_currency_value = parseFloat(total_po_value);
        if (currency !== 'INR') {
            try {
                common_currency_value = await convertCurrency(currency, 'INR', parseFloat(total_po_value));
            } catch (error) {
                console.warn(`Currency conversion failed: ${error.message}`);
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const po = await tx.pO.create({
                data: {
                    po_number,
                    vendor_id: parseInt(vendor_id),
                    tower_id: parseInt(tower_id),
                    budget_head_id: parseInt(budget_head_id),
                    po_entity_id: po_entity_id ? parseInt(po_entity_id) : null,
                    po_date: new Date(po_date),
                    po_start_date: po_start_date ? new Date(po_start_date) : null,
                    po_end_date: po_end_date ? new Date(po_end_date) : null,
                    total_po_value: parseFloat(total_po_value),
                    currency,
                    common_currency: 'INR',
                    common_currency_value,
                    pr_number,
                    pr_date: pr_date ? new Date(pr_date) : null,
                    created_by_id: req.user.id
                }
            });

            if (line_items && line_items.length > 0) {
                await Promise.all(line_items.map(item =>
                    tx.lineItem.upsert({
                        where: { id: item.id || -1 },
                        update: {
                            po_id: po.id,
                            vendor_id: parseInt(vendor_id),
                            tower_id: parseInt(tower_id),
                            budget_head_id: parseInt(budget_head_id),
                            po_entity_id: po_entity_id ? parseInt(po_entity_id) : null,
                            service_description: item.service_description,
                            service_start_date: item.service_start_date ? new Date(item.service_start_date) : null,
                            service_end_date: item.service_end_date ? new Date(item.service_end_date) : null,
                            unit_cost: parseFloat(item.unit_cost),
                            quantity: parseInt(item.quantity),
                            total_cost: parseFloat(item.total_cost),
                            fiscal_year: fiscal_year ? parseInt(fiscal_year) : null
                        },
                        create: {
                            uid: item.uid,
                            po_id: po.id,
                            vendor_id: parseInt(vendor_id),
                            tower_id: parseInt(tower_id),
                            budget_head_id: parseInt(budget_head_id),
                            po_entity_id: po_entity_id ? parseInt(po_entity_id) : null,
                            service_description: item.service_description,
                            service_start_date: item.service_start_date ? new Date(item.service_start_date) : null,
                            service_end_date: item.service_end_date ? new Date(item.service_end_date) : null,
                            unit_cost: parseFloat(item.unit_cost),
                            quantity: parseInt(item.quantity),
                            total_cost: parseFloat(item.total_cost),
                            fiscal_year: fiscal_year ? parseInt(fiscal_year) : null
                        }
                    })
                ));
            }

            // Auto-Actuals
            const poDate = new Date(po_date);
            const poMonth = poDate.getMonth() + 1;
            const poFiscalYear = fiscal_year ? parseInt(fiscal_year) : poDate.getFullYear();
            const costCentre = await tx.costCentre.findFirst();

            if (costCentre) {
                let actualsBOA = await tx.actualsBOA.findFirst({
                    where: {
                        fiscal_year: poFiscalYear,
                        month: poMonth,
                        tower_id: parseInt(tower_id),
                        budget_head_id: parseInt(budget_head_id),
                        cost_centre_id: costCentre.id
                    }
                });

                const actualAmountToAdd = common_currency_value;

                if (!actualsBOA) {
                    actualsBOA = await tx.actualsBOA.create({
                        data: {
                            fiscal_year: poFiscalYear,
                            month: poMonth,
                            tower_id: parseInt(tower_id),
                            budget_head_id: parseInt(budget_head_id),
                            cost_centre_id: costCentre.id,
                            actual_amount: actualAmountToAdd,
                            remarks: `Auto-created from PO ${po_number}`
                        }
                    });
                } else {
                    actualsBOA = await tx.actualsBOA.update({
                        where: { id: actualsBOA.id },
                        data: {
                            actual_amount: actualsBOA.actual_amount + actualAmountToAdd,
                            remarks: actualsBOA.remarks ? `${actualsBOA.remarks}; Updated from PO ${po_number}` : `Updated from PO ${po_number}`
                        }
                    });
                }
            }

            return po;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating PO:', error);
        res.status(500).json({ message: error.message });
    }
};

const updatePOStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (['Approved', 'Rejected'].includes(status)) {
            const allowedRoles = ['Approver', 'Admin'];
            const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));
            if (!hasPermission) return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const data = { status };
        if (status === 'Approved') {
            data.approved_by_id = req.user.id;
            data.approval_date = new Date();
        }

        const po = await prisma.pO.update({ where: { id: parseInt(id) }, data });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePO = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            po_number, vendor_id, po_date, po_start_date, po_end_date,
            total_po_value, currency, pr_number, pr_date, remarks
        } = req.body;

        // Validation
        const validationErrors = await validatePOInput(req.body, id);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join('; ') });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Get old PO to check for value changes
            const oldPO = await tx.pO.findUnique({ where: { id: parseInt(id) } });

            let common_currency_value = oldPO.common_currency_value;
            let new_total_value = total_po_value !== undefined ? parseFloat(total_po_value) : oldPO.total_po_value;
            let new_currency = currency || oldPO.currency;

            // Recalculate common currency value if needed
            if (total_po_value !== undefined || currency) {
                if (new_currency !== 'INR') {
                    try {
                        common_currency_value = await convertCurrency(new_currency, 'INR', new_total_value);
                    } catch (error) {
                        console.warn(`Currency conversion failed: ${error.message}`);
                    }
                } else {
                    common_currency_value = new_total_value;
                }
            }

            const updateData = {};
            if (po_number) updateData.po_number = po_number;
            if (vendor_id) updateData.vendor_id = parseInt(vendor_id);
            if (po_date) updateData.po_date = new Date(po_date);
            if (po_start_date) updateData.po_start_date = new Date(po_start_date);
            if (po_end_date) updateData.po_end_date = new Date(po_end_date);
            if (total_po_value !== undefined) updateData.total_po_value = parseFloat(total_po_value);
            if (currency) updateData.currency = currency;
            if (pr_number) updateData.pr_number = pr_number;
            if (pr_date) updateData.pr_date = new Date(pr_date);
            if (remarks !== undefined) updateData.remarks = remarks;

            updateData.common_currency_value = common_currency_value;

            const po = await tx.pO.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    vendor: true,
                    tower: true,
                    budget_head: true,
                    po_entity: true
                }
            });

            // Update Actuals if value changed
            if (oldPO.common_currency_value !== common_currency_value) {
                const diff = common_currency_value - oldPO.common_currency_value;

                const poDate = new Date(po.po_date);
                const poMonth = poDate.getMonth() + 1;
                const poFiscalYear = poDate.getFullYear(); // Should use fiscal year logic
                const costCentre = await tx.costCentre.findFirst();

                if (costCentre) {
                    const actualsBOA = await tx.actualsBOA.findFirst({
                        where: {
                            fiscal_year: poFiscalYear,
                            month: poMonth,
                            tower_id: po.tower_id,
                            budget_head_id: po.budget_head_id,
                            cost_centre_id: costCentre.id
                        }
                    });

                    if (actualsBOA) {
                        await tx.actualsBOA.update({
                            where: { id: actualsBOA.id },
                            data: {
                                actual_amount: actualsBOA.actual_amount + diff,
                                remarks: `${actualsBOA.remarks || ''}; Updated PO ${po.po_number} value`
                            }
                        });
                    }
                }
            }

            return po;
        });

        res.json(result);
    } catch (error) {
        console.error('Error updating PO:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPOs, getPOById, createPO, updatePO, updatePOStatus, getBudgetDetailsByUID };
