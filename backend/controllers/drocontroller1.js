const Dro = require('../models/Dro');
const Member = require('../models/Member');

/* =====================================================
   🔥 GLOBAL TIMER HELPERS
===================================================== */
const getGlobalTimerValue = (req) => {
  return req.app.locals.globalTimer || { hours: 0, minutes: 0, seconds: 5 };
};

/* =====================================================
   🔥 1. GET DRO HISTORY (ALL USERS)
===================================================== */
exports.getDroHistory = async (req, res) => {
  try {
    const history = await Dro.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    res.json(history);
  } catch (err) {
    console.error('❌ DRO History Error:', err);
    res.status(500).json({ message: 'Failed to fetch DRO history' });
  }
};

/* =====================================================
   🔥 2. SAVE DRO (GLOBAL TIMER USED)
===================================================== */
exports.saveDro = async (req, res) => {
  try {
    const droData = req.body;
    const globalTimer = getGlobalTimerValue(req);

    const totalMs =
      globalTimer.hours * 3600000 +
      globalTimer.minutes * 60000 +
      globalTimer.seconds * 1000;

    if (totalMs < 1000) {
      return res.status(400).json({
        message: '❌ Global timer set nahi hai',
      });
    }

    const dro = new Dro({
      date: droData.date,
      time: droData.time,
      totalMembers: droData.totalMembers,
      order: droData.order,
      hours: globalTimer.hours,
      minutes: globalTimer.minutes,
      seconds: globalTimer.seconds,
      deleteAfter: new Date(Date.now() + totalMs),
      createdBy: req.user?.id || 'anonymous',
    });

    const saved = await dro.save();

    res.status(201).json({
      success: true,
      message: '✅ DRO saved successfully',
      dro: saved,
    });
  } catch (err) {
    console.error('❌ Save DRO Error:', err);
    res.status(500).json({ message: 'Failed to save DRO' });
  }
};

/* =====================================================
   🔥 3. SET GLOBAL TIMER (ADMIN)
===================================================== */
exports.setGlobalTimer = async (req, res) => {
  try {
    const { hours = 0, minutes = 0, seconds = 0 } = req.body;

    const totalMs =
      hours * 3600000 + minutes * 60000 + seconds * 1000;

    if (totalMs < 1000) {
      return res
        .status(400)
        .json({ message: '❌ Minimum 1 second required' });
    }

    req.app.locals.globalTimer = {
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      seconds: parseInt(seconds),
    };

    res.json({
      success: true,
      timer: req.app.locals.globalTimer,
      message: '✅ Global timer set successfully',
    });
  } catch (err) {
    console.error('❌ Set Timer Error:', err);
    res.status(500).json({ message: 'Failed to set timer' });
  }
};

/* =====================================================
   🔥 4. GET GLOBAL TIMER (ALL USERS)
===================================================== */
exports.getGlobalTimer = async (req, res) => {
  res.json({
    success: true,
    timer: getGlobalTimerValue(req),
  });
};

/* =====================================================
   🔥 5. DELETE DRO
===================================================== */
exports.deleteDro = async (req, res) => {
  try {
    const dro = await Dro.findByIdAndDelete(req.params.id);
    if (!dro) {
      return res.status(404).json({ message: 'DRO not found' });
    }
    res.json({ success: true, message: 'DRO deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

/* =====================================================
   🔥 6. ASSIGN DRO ACCESS (ADMIN)
===================================================== */
exports.assignDroAccess = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId required' });
    }

    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.droAccess = {
      enabled: true,
      assignedAt: new Date(),
    };

    await member.save();

    res.json({
      success: true,
      message: '✅ DRO access granted',
    });
  } catch (err) {
    console.error('❌ Assign Error:', err);
    res.status(500).json({ message: 'Assign failed' });
  }
};

/* =====================================================
   🔥 7. REMOVE DRO ACCESS (ADMIN)
===================================================== */
exports.removeDroAccess = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId required' });
    }

    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.droAccess = { enabled: false };
    await member.save();

    res.json({
      success: true,
      message: '❌ DRO access removed',
    });
  } catch (err) {
    console.error('❌ Remove Error:', err);
    res.status(500).json({ message: 'Remove failed' });
  }
};

/* =====================================================
   🔥 8. CHECK CURRENT USER DRO ACCESS
===================================================== */
exports.checkDroAccess = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await Member.findOne({ memberId });

    res.json({
      hasDroAccess: member?.droAccess?.enabled || false,
    });
  } catch (err) {
    res.json({ hasDroAccess: false });
  }
};

/* =====================================================
   🔥 9. GET MEMBERS WITH DRO STATUS (ADMIN PANEL)
===================================================== */
exports.getMembersWithDroStatus = async (req, res) => {
  try {
    const members = await Member.find()
      .select('name memberId droAccess')
      .sort({ name: 1 })
      .lean();

    res.json(members);
  } catch (err) {
    console.error('❌ Members Status Error:', err);
    res.status(500).json({ message: 'Members fetch failed' });
  }
};