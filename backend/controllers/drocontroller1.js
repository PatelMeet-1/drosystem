const Dro = require('../models/Dro');
const Member = require('../models/Member');

// 🔥 GLOBAL TIMER DISPLAY FUNCTION
const getGlobalTimer = (req) => {
  return req.app.locals.globalTimer || { hours: 0, minutes: 0, seconds: 5 };
};

// 🔥 1. GET DRO History - SAB USERS
exports.getDroHistory = async (req, res) => {
  try {
    const history = await Dro.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    res.json(history);
  } catch (err) {
    console.error('❌ History error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 2. SAVE DRO - GLOBAL TIMER USE (ADMIN/USER SAB)
exports.saveDro = async (req, res) => {
  try {
    const droData = req.body;
    const globalTimer = getGlobalTimer(req);
    
    // 🔥 GLOBAL TIMER CHECK
    const totalMs = (globalTimer.hours * 3600000) + 
                   (globalTimer.minutes * 60000) + 
                   (globalTimer.seconds * 1000);
    
    if (totalMs < 1000) {
      return res.status(400).json({ 
        message: '❌ Admin ne global timer set nahi kiya! Pehle timer set karo.' 
      });
    }
    
    const dro = new Dro({
      date: droData.date,
      time: droData.time,
      totalMembers: droData.totalMembers,
      order: droData.order,
      // 🔥 GLOBAL TIMER VALUES - SAB DRO ME SAME
      hours: globalTimer.hours,
      minutes: globalTimer.minutes,
      seconds: globalTimer.seconds,
      deleteAfter: new Date(Date.now() + totalMs),
      createdBy: req.user?.id || 'Anonymous User'
    });
    
    const savedDro = await dro.save();
    console.log('✅ DRO SAVED:', savedDro._id, 'Timer:', `${globalTimer.hours}h ${globalTimer.minutes}m ${globalTimer.seconds}s`);
    
    res.status(201).json({
      success: true,
      message: 'DRO saved with global timer!',
      dro: savedDro
    });
  } catch (err) {
    console.error('❌ Save DRO error:', err);
    res.status(400).json({ message: 'Failed to save DRO' });
  }
};

// 🔥 3. SET GLOBAL TIMER - ADMIN ONLY
// 🔥 3. SET GLOBAL TIMER - TEMPORARILY BYPASS ADMIN CHECK
exports.setGlobalTimer = async (req, res) => {
  try {
    // 🔥 ADMIN CHECK DISABLED FOR TESTING
    /*
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: '❌ Admin access required!' });
    }
    */
    
    console.log('🔥 SET TIMER REQUEST FROM:', req.user?.name || 'Unknown');
    
    const { hours, minutes, seconds } = req.body;
    const totalMs = (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
    
    if (totalMs < 1000) {
      return res.status(400).json({ message: '❌ Kam se kam 1 second set karo!' });
    }
    
    // 🔥 GLOBAL TIMER UPDATE
    req.app.locals.globalTimer = {
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      seconds: parseInt(seconds)
    };
    
    console.log('✅ GLOBAL TIMER SET:', req.app.locals.globalTimer);
    
    res.json({
      success: true,
      message: `✅ Global timer set: ${hours}h ${minutes}m ${seconds}s`,
      timer: req.app.locals.globalTimer
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to set timer' });
  }
};


// 🔥 4. GET GLOBAL TIMER - SAB USERS CHECK KAREGA
exports.getGlobalTimer = async (req, res) => {
  const timer = getGlobalTimer(req);
  res.json({
    success: true,
    timer,
    message: 'Current global timer (Admin set karega toh change hoga)'
  });
};

// 🔥 5. DELETE DRO
exports.deleteDro = async (req, res) => {
  try {
    const droId = req.params.id;
    const dro = await Dro.findByIdAndDelete(droId);
    if (!dro) {
      return res.status(404).json({ message: 'DRO not found' });
    }
    res.json({ success: true, message: 'DRO deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

// 🔥 6. ADMIN FUNCTIONS
exports.assignDroAccess = async (req, res) => {
  try {
    const { memberName } = req.body;
    if (!memberName) return res.status(400).json({ message: 'Member name required' });
    
    const member = await Member.findOne({ name: memberName });
    if (!member) return res.status(404).json({ message: `Member "${memberName}" not found` });
    
    member.droAccess = { enabled: true, assignedAt: new Date() };
    await member.save();
    
    res.json({ 
      success: true, 
      message: `${memberName} ko DRO access de diya! ✅` 
    });
  } catch (err) {
    res.status(500).json({ message: 'Assign failed' });
  }
};

exports.removeDroAccess = async (req, res) => {
  try {
    const { memberName } = req.body;
    const member = await Member.findOne({ name: memberName });
    if (!member) return res.status(404).json({ message: `Member not found` });
    
    member.droAccess = { enabled: false };
    await member.save();
    
    res.json({ success: true, message: `${memberName} ka access hata diya! ❌` });
  } catch (err) {
    res.status(500).json({ message: 'Remove failed' });
  }
};

exports.checkDroAccess = async (req, res) => {
  try {
    const { memberName } = req.params;
    const member = await Member.findOne({ name: memberName });
    res.json({ hasDroAccess: member?.droAccess?.enabled || false });
  } catch (err) {
    res.json({ hasDroAccess: false });
  }
};

exports.getMembersWithDroStatus = async (req, res) => {
  try {
    const members = await Member.find()
      .select('name memberId droAccess')
      .sort({ name: 1 })
      .lean();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Members fetch failed' });
  }
};
