// /routes-userRoutes.js
const express = require('express');
const router = express.Router();
const { getTeamMembers } = require('../controllers/userController');

router.get('/team-members', getTeamMembers);

module.exports = router;
