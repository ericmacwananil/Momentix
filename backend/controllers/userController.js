const User = require('../models/User');

// Return users with role 'team_member'
const getTeamMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'team_member' }).select('-password -__v');
    res.json({ success: true, data: members });
  } catch (e) {
    console.error('[users] getTeamMembers error:', e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getTeamMembers };
