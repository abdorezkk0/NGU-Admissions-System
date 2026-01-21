const express = require('express');
const controller = require('../controllers/documentController');

const router = express.Router();

router.post('/', controller.submit);
router.get('/application/:id', controller.getByApplication);
router.patch('/:id/verify', controller.verify);
router.get('/required', controller.required);

module.exports = router;
