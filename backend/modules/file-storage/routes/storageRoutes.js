const express = require('express');
const multer = require('multer');
const { upload, getSignedUrl, remove } = require('../controllers/storageControllers');

const router = express.Router();
const uploadMw = multer({ storage: multer.memoryStorage() });

router.get('/ping', (req, res) => res.json({ ok: true })); // keep or remove later

router.post('/upload', uploadMw.single('file'), upload);
router.get('/:id/signed-url', getSignedUrl);
router.delete('/:id', remove);
router.get('/:id/signed-url', getSignedUrl);
module.exports = router;
