const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const actualsImportController = require('../controllers/actualsImport.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

// Import Actuals
router.post('/import',
    checkPermission('POST_ACTUALS'),
    upload.single('file'),
    actualsImportController.importActuals
);

module.exports = router;
