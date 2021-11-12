const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const csvController = require('../controllers/csvManage');

router.post('/upload', upload.single('file'), csvController.upload);
router.get('/getData', csvController.getInsures);
router.post('/search', csvController.searchInsures);

module.exports = router;
