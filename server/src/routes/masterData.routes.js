const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
    getTowers, createTower,
    getBudgetHeads, createBudgetHead,
    getVendors, createVendor,
    getCostCentres, createCostCentre,
    getPOEntities, createPOEntity,
    getServiceTypes, createServiceType,
    getAllocationBases, createAllocationBasis
} = require('../controllers/masterData.controller');

const router = express.Router();

// Public read access for authenticated users, Write access for Admins/Editors
router.use(authenticateToken);

router.get('/towers', getTowers);
router.post('/towers', authorizeRoles('Admin', 'Editor'), createTower);

router.get('/budget-heads', getBudgetHeads);
router.post('/budget-heads', authorizeRoles('Admin', 'Editor'), createBudgetHead);

router.get('/vendors', getVendors);
router.post('/vendors', authorizeRoles('Admin', 'Editor'), createVendor);

router.get('/cost-centres', getCostCentres);
router.post('/cost-centres', authorizeRoles('Admin', 'Editor'), createCostCentre);

router.get('/po-entities', getPOEntities);
router.post('/po-entities', authorizeRoles('Admin', 'Editor'), createPOEntity);

router.get('/service-types', getServiceTypes);
router.post('/service-types', authorizeRoles('Admin', 'Editor'), createServiceType);

router.get('/allocation-bases', getAllocationBases);
router.post('/allocation-bases', authorizeRoles('Admin', 'Editor'), createAllocationBasis);

module.exports = router;
