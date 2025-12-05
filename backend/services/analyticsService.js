// backend/src/services/analyticsService.js
import Activity from "../models/Activity.js";

/**
 * Compute a simple focusScore from focusTime and blockedCount.
 * Returns 0-100.
 */
export function computeFocusScore({
  focusTime = 0,
  blockedCount = 0,
  dopamineSpikes = 0,
}) {
  // baseline: scale minutes to a score (120min -> high score)
  const timeScore = Math.min(100, (focusTime / 120) * 100);
  // penalty for interruptions
  const penalty = Math.min(60, blockedCount * 5 + dopamineSpikes * 3);
  const raw = Math.max(0, timeScore - penalty);
  return Math.round(raw);
}

/**
 * Get weekly summary for a user (last 7 days)
 */
export async function getWeeklySummary(userId) {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - 6); // last 7 days (including today)
  from.setHours(0, 0, 0, 0);

  const docs = await Activity.find({
    userId,
    date: { $gte: from },
  }).sort({ date: 1 });

  // build daily map
  const map = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map[key] = {
      date: key,
      focusTime: 0,
      blockedCount: 0,
      dopamineSpikes: 0,
      focusScore: 0,
    };
  }

  docs.forEach((doc) => {
    const key = doc.date.toISOString().slice(0, 10);
    map[key] = {
      date: key,
      focusTime: (map[key]?.focusTime || 0) + (doc.focusTime || 0),
      blockedCount: (map[key]?.blockedCount || 0) + (doc.blockedCount || 0),
      dopamineSpikes:
        (map[key]?.dopamineSpikes || 0) + (doc.dopamineSpikes || 0),
      focusScore: computeFocusScore(doc),
    };
  });

  const list = Object.values(map);
  const totals = list.reduce(
    (acc, cur) => {
      acc.focusTime += cur.focusTime || 0;
      acc.blockedCount += cur.blockedCount || 0;
      acc.dopamineSpikes += cur.dopamineSpikes || 0;
      return acc;
    },
    { focusTime: 0, blockedCount: 0, dopamineSpikes: 0 }
  );

  const avgFocusScore =
    list.length > 0
      ? Math.round(
          list.reduce((s, v) => s + (v.focusScore || 0), 0) / list.length
        )
      : 0;

  return {
    list,
    totals,
    avgFocusScore,
  };
}
