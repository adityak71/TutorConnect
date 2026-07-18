const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorById } = require('./tutorController');

router.get('/', getAllTutors);
router.get('/:id', getTutorById);

module.exports = router;
