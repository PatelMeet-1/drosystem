const Dro = require('../models/Dro');
const Member = require('../models/Member');

// GET DRO History
exports.getDroHistory = async (req, res) => {
  try {
    const history = await Dro.find()
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST Save New DRO
exports.saveDro = async (req, res) => {
  try {
    const droData = req.body;
    
    const dro = new Dro({
      date: droData.date,
      time: droData.time,
      totalMembers: droData.totalMembers,
      order: droData.order
    });

    const savedDro = await dro.save();
    res.status(201).json(savedDro);
  } catch (err) {
    console.error('Save DRO error:', err);
    res.status(400).json({ message: 'Failed to save DRO' });
  }
};
