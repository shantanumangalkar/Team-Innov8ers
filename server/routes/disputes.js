const express = require('express');
const {
    createDispute,
    getDisputes
} = require('../controllers/disputes');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getDisputes)
    .post(createDispute);

module.exports = router;
