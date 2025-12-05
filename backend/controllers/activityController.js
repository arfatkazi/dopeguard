import Activity from "../models/Activity.js";
import mongoose from "mongoose";

/* ============================================================
   HELPERS
   ============================================================ */
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ============================================================
   LIST ACTIVITIES (GET /api/activity)
   ============================================================ */
export const listActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(200, Number(req.query.limit) || 30);
    const skip = Number(req.query.skip) || 0;

    const items = await Activity.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      activities: items,
    });
  } catch (err) {
    console.error("LIST ACTIVITIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   CREATE ACTIVITY (POST /api/activity)
   ============================================================ */
export const createActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { site, duration = 0, blocked = false, timestamp } = req.body;

    const ts = timestamp ? new Date(timestamp) : new Date();
    const day = normalizeDate(ts);

    // Check if an entry for the same day exists
    let entry = await Activity.findOne({
      userId,
      date: day,
    });

    if (!entry) {
      entry = new Activity({
        userId,
        date: day,
        focusTime: blocked ? 0 : duration,
        blockedCount: blocked ? 1 : 0,
        details: [
          {
            site,
            duration,
            blocked,
            timestamp: ts,
          },
        ],
      });
    } else {
      // Update existing day entry
      entry.details.push({
        site,
        duration,
        blocked,
        timestamp: ts,
      });

      if (blocked) entry.blockedCount += 1;
      else entry.focusTime += duration;
    }

    await entry.save();

    return res.json({ success: true, activity: entry });
  } catch (err) {
    console.error("CREATE ACTIVITY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   WEEKLY STATS (GET /api/activity/stats/weekly)
   ============================================================ */
export const weeklyStats = async (req, res) => {
  try {
    const userId = req.user._id; // FIXED
    const days = 7;

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const agg = await Activity.aggregate([
      {
        $match: {
          userId,
          date: { $gte: since },
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          focusTime: 1,
          blockedCount: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          focusTime: { $sum: "$focusTime" },
          blockedCount: { $sum: "$blockedCount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);

      const row = agg.find((a) => a._id === key) || {
        focusTime: 0,
        blockedCount: 0,
      };

      out.push({
        date: key,
        focusTime: row.focusTime || 0,
        blockedCount: row.blockedCount || 0,
      });
    }

    return res.json({ success: true, weekly: out });
  } catch (err) {
    console.error("WEEKLY STATS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   MOST BLOCKED SITES (GET /api/activity/stats/blocked)
   ============================================================ */
export const blockedSites = async (req, res) => {
  try {
    const userId = req.user._id;

    const limit = Math.min(50, Number(req.query.limit) || 10);

    const agg = await Activity.aggregate([
      { $match: { userId } },
      { $unwind: "$details" },
      {
        $match: {
          "details.blocked": true,
          "details.site": { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$details.site",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return res.json({ success: true, sites: agg });
  } catch (err) {
    console.error("BLOCKED SITES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   DOPAMINE SPIKES (GET /api/activity/stats/dopamine)
   ============================================================ */
export const dopamineSpikes = async (req, res) => {
  try {
    const userId = req.user._id; // FIXED

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const agg = await Activity.aggregate([
      {
        $match: {
          userId,
          date: { $gte: normalizeDate(since) },
        },
      },
      { $unwind: "$details" }, // FIXED
      {
        $project: {
          hour: {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00",
              date: "$details.timestamp",
            },
          },
          blocked: "$details.blocked", // FIXED
        },
      },
      {
        $group: {
          _id: "$hour",
          blocked: { $sum: { $cond: ["$blocked", 1, 0] } }, // FIXED
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 48 },
    ]);

    const threshold = 3;

    const spikes = agg
      .filter((g) => g.blocked >= threshold)
      .map((s) => ({ time: s._id, blocked: s.blocked }));

    return res.json({ success: true, spikes, threshold });
  } catch (err) {
    console.error("DOPAMINE SPIKES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   DAILY STATS (GET /api/activity/stats/daily)
   ============================================================ */
export const dailyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Today midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await Activity.findOne({
      userId,
      date: today,
    }).lean();

    return res.json({
      success: true,
      date: today.toISOString().slice(0, 10),
      focusTime: entry?.focusTime || 0,
      blockedCount: entry?.blockedCount || 0,
      details: entry?.details || [],
    });
  } catch (err) {
    console.error("DAILY STATS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
