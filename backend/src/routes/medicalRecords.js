const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticate } = require('../middleware/auth');
const { injectTenantContext } = require('../middleware/tenant');
const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(authenticate);
router.use(injectTenantContext);

router.get('/', medicalRecordController.getAllRecords);
router.post('/', medicalRecordController.createRecord);
router.post('/import', upload.single('file'), medicalRecordController.importRecords);
router.post('/export', medicalRecordController.exportRecords);
router.get('/patient/:patientId', medicalRecordController.getRecordsByPatientId);
router.get('/:id', medicalRecordController.getRecordById);
router.put('/:id', medicalRecordController.updateRecord);
router.delete('/:id', medicalRecordController.deleteRecord);

module.exports = router;
