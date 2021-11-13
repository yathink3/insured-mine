const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const csvController = require('../controllers/csvManage');
const scheduleController = require('../controllers/scheduleJob');

router.post('/upload', upload.single('file'), csvController.upload);
router.get('/getData', csvController.getInsures);
router.post('/search', csvController.searchInsures);
router.post('/schedule', scheduleController.scheduleJob);

module.exports = router;
