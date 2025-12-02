const prisma = require('../prisma');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

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
                status: true,
                vendor: { select: { id: true, name: true } },
                tower: { select: { id: true, name: true } },
                budget_head: { select: { id: true, name: true } },
                created_by: { select: { name: true } },
                approved_by: { select: { name: true } },
                line_items: { select: { id: true, uid: true, service_description: true, total_cost: true } }
            },
            orderBy: { po_date: 'desc' }, // Changed from created_at to po_date
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

        // Optimized query with selective fields
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

        // Calculate total budget
        const totalBudget = lineItems.reduce((sum, item) => sum + (item.fy25_allocation_amount || 0), 0);

        // Optimized actuals calculation with single query
        const lineItemIds = lineItems.map(item => item.id);
        const actuals = await prisma.actualsBasis.findMany({
            where: { line_item_id: { in: lineItemIds } },
            select: { allocated_amount: true }
        });

        const totalActual = actuals.reduce((sum, act) => sum + act.allocated_amount, 0);
        const entities = [...new Set(lineItems.map(item => item.po_entity?.name).filter(Boolean))];

        res.json({
            uid,
            service_description: lineItems[0].service_description,
            budget_head: lineItems[0].budget_head?.name,
            budget_head_id: lineItems[0].budget_head_id,
            entities,
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
            po_number, vendor_id, tower_id, budget_head_id,
            po_date, total_po_value, line_items,
            uid_details // Passed from frontend if available
        } = req.body;

        // Check for budget overrun if uid_details is provided
        if (uid_details) {
            const { totalBudget, totalActual } = uid_details;
            // If Actual > Budget, send email
            // Note: The user requirement says "if Acutal Value is grate then Budget value".
            // This condition might already be true before this PO, or become true with this PO.
            // The prompt implies checking the current state.
            if (totalActual > totalBudget) {
                const mailOptions = {
                    from: process.env.EMAIL_USER || 'noreply@opex.com',
                    to: 'Gagan.sharma@hubl.com',
                    subject: `Budget Exceeded Alert: PO ${po_number}`,
                    text: `
                        Alert: Budget exceeded for service.
                        
                        PO Number: ${po_number}
                        Service Description: ${uid_details.service_description}
                        Budget Head: ${uid_details.budget_head}
                        
                        Financials:
                        Total Budget: ${totalBudget}
                        Total Actual: ${totalActual}
                        PO Value: ${total_po_value}
                        
                        Please review immediately.
                    `
                };

                // Send email asynchronously, don't block response
                transporter.sendMail(mailOptions).catch(err => console.error('Email send failed:', err));
            }
        }

        // Create PO header first
        const po = await prisma.pO.create({
            data: {
                po_number,
                vendor_id: parseInt(vendor_id),
                tower_id: parseInt(tower_id),
                budget_head_id: parseInt(budget_head_id),
                po_date: new Date(po_date),
                total_po_value: parseFloat(total_po_value),
                created_by_id: req.user.id
            }
        });

        // Handle line items with batch operations for better performance
        const processedLineItems = await Promise.all(
            line_items.map(item =>
                prisma.lineItem.upsert({
                    where: { uid: item.uid },
                    update: {
                        po_id: po.id,
                        vendor_id: parseInt(vendor_id),
                        tower_id: parseInt(tower_id),
                        budget_head_id: parseInt(budget_head_id),
                        service_description: item.service_description,
                        unit_cost: parseFloat(item.unit_cost),
                        quantity: parseInt(item.quantity),
                        total_cost: parseFloat(item.total_cost)
                    },
                    create: {
                        uid: item.uid,
                        po_id: po.id,
                        vendor_id: parseInt(vendor_id),
                        tower_id: parseInt(tower_id),
                        budget_head_id: parseInt(budget_head_id),
                        service_description: item.service_description,
                        unit_cost: parseFloat(item.unit_cost),
                        quantity: parseInt(item.quantity),
                        total_cost: parseFloat(item.total_cost)
                    },
                    select: { id: true, uid: true } // Only select necessary fields
                })
            )
        );

        // Return PO with line items
        const result = await prisma.pO.findUnique({
            where: { id: po.id },
            include: { line_items: true }
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePOStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Submitted, Approved, Rejected

        // Enforce permission for Approval/Rejection
        if (['Approved', 'Rejected'].includes(status)) {
            const allowedRoles = ['Approver', 'Admin'];
            const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));
            if (!hasPermission) {
                return res.status(403).json({
                    message: 'Insufficient permissions to Approve or Reject PO'
                });
            }
        }

        const data = { status };
        if (status === 'Approved') {
            data.approved_by_id = req.user.id;
            data.approval_date = new Date();
        }

        const po = await prisma.pO.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPOs, getPOById, createPO, updatePOStatus, getBudgetDetailsByUID };
