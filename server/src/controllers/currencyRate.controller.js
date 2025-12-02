const prisma = require('../prisma');

// Get all currency rates
const getCurrencyRates = async (req, res) => {
    try {
        const rates = await prisma.currencyRate.findMany({
            include: {
                updated_by: {
                    select: { name: true, email: true }
                }
            },
            orderBy: [
                { from_currency: 'asc' },
                { to_currency: 'asc' }
            ]
        });
        res.json(rates);
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        res.status(500).json({ message: 'Error fetching currency rates' });
    }
};

// Get specific rate
const getRate = async (req, res) => {
    try {
        const { from, to } = req.params;

        const rate = await prisma.currencyRate.findUnique({
            where: {
                from_currency_to_currency: {
                    from_currency: from.toUpperCase(),
                    to_currency: to.toUpperCase()
                }
            },
            include: {
                updated_by: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!rate) {
            return res.status(404).json({ message: `No rate found for ${from} to ${to}` });
        }

        res.json(rate);
    } catch (error) {
        console.error('Error fetching rate:', error);
        res.status(500).json({ message: 'Error fetching rate' });
    }
};

// Create or update rate (upsert)
const upsertRate = async (req, res) => {
    try {
        const { from_currency, to_currency, rate } = req.body;

        if (!from_currency || !to_currency || !rate) {
            return res.status(400).json({
                message: 'from_currency, to_currency, and rate are required'
            });
        }

        if (rate <= 0) {
            return res.status(400).json({
                message: 'Rate must be greater than 0'
            });
        }

        const currencyRate = await prisma.currencyRate.upsert({
            where: {
                from_currency_to_currency: {
                    from_currency: from_currency.toUpperCase(),
                    to_currency: to_currency.toUpperCase()
                }
            },
            update: {
                rate: parseFloat(rate),
                updated_by_id: req.user.id,
                effective_date: new Date()
            },
            create: {
                from_currency: from_currency.toUpperCase(),
                to_currency: to_currency.toUpperCase(),
                rate: parseFloat(rate),
                updated_by_id: req.user.id
            },
            include: {
                updated_by: {
                    select: { name: true, email: true }
                }
            }
        });

        res.json(currencyRate);
    } catch (error) {
        console.error('Error upserting rate:', error);
        res.status(500).json({ message: 'Error saving currency rate' });
    }
};

// Delete rate
const deleteRate = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.currencyRate.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Currency rate deleted successfully' });
    } catch (error) {
        console.error('Error deleting rate:', error);
        res.status(500).json({ message: 'Error deleting currency rate' });
    }
};

// Helper function to convert currency
const convertCurrency = async (fromCurrency, toCurrency, amount) => {
    try {
        // If same currency, return amount
        if (fromCurrency === toCurrency) {
            return amount;
        }

        // Try direct conversion
        const rate = await prisma.currencyRate.findUnique({
            where: {
                from_currency_to_currency: {
                    from_currency: fromCurrency.toUpperCase(),
                    to_currency: toCurrency.toUpperCase()
                }
            }
        });

        if (rate) {
            return amount * rate.rate;
        }

        // Try reverse conversion
        const reverseRate = await prisma.currencyRate.findUnique({
            where: {
                from_currency_to_currency: {
                    from_currency: toCurrency.toUpperCase(),
                    to_currency: fromCurrency.toUpperCase()
                }
            }
        });

        if (reverseRate) {
            return amount / reverseRate.rate;
        }

        throw new Error(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getCurrencyRates,
    getRate,
    upsertRate,
    deleteRate,
    convertCurrency
};
