export function getTodayDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatCalendarDate(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)} 月 ${Number(day)} 日`;
}

export function createCalendarEntry(session, evidence, completedAt = new Date().toISOString()) {
  const date = getTodayDateKey(completedAt);
  return {
    sessionId: session.id,
    moduleId: session.learningModuleId || session.category,
    moduleLabel: session.learningModule || session.category || "学习",
    sessionNumber: session.investmentSessionNumber || session.sessionNumber || null,
    sessionTitle: session.investmentSessionNumber
      ? `投资学习 Session ${String(session.investmentSessionNumber).padStart(3, "0")}`
      : session.learningGoal || session.subject || "学习 Session",
    topic: session.investmentTopic || session.learningGoal || session.subject || "学习主题",
    mode: session.mode,
    durationMinutes: session.durationMinutes || 0,
    expGained: session.expGained || evidence?.finalExp || 0,
    evidenceTypes: evidence?.type ? [evidence.type] : [],
    completedAt,
    date
  };
}

export function addCompletedSessionToCalendar(calendar = {}, session, evidence, completedAt = new Date().toISOString()) {
  const entry = createCalendarEntry(session, evidence, completedAt);
  const dateRecord = calendar[entry.date] || {
    date: entry.date,
    completedSessions: [],
    totalSessions: 0,
    totalMinutes: 0,
    totalExp: 0
  };

  if (dateRecord.completedSessions.some((item) => item.sessionId === entry.sessionId)) {
    return {
      calendar,
      entry,
      dateRecord,
      added: false
    };
  }

  const completedSessions = [...dateRecord.completedSessions, entry].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt)
  );
  const nextRecord = {
    date: entry.date,
    completedSessions,
    totalSessions: completedSessions.length,
    totalMinutes: completedSessions.reduce((sum, item) => sum + (item.durationMinutes || 0), 0),
    totalExp: completedSessions.reduce((sum, item) => sum + (item.expGained || 0), 0)
  };

  return {
    calendar: {
      ...calendar,
      [entry.date]: nextRecord
    },
    entry,
    dateRecord: nextRecord,
    added: true
  };
}

export function getSessionsByDate(calendar = {}, dateKey = getTodayDateKey()) {
  return calendar[dateKey]?.completedSessions || [];
}

export function calculateStreak(calendar = {}, todayKey = getTodayDateKey()) {
  if (!calendar[todayKey]?.completedSessions?.length) return 0;
  let streak = 0;
  const cursor = new Date(`${todayKey}T12:00:00`);

  while (true) {
    const key = getTodayDateKey(cursor);
    if (!calendar[key]?.completedSessions?.length) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getCalendarStats(calendar = {}, todayKey = getTodayDateKey()) {
  const monthPrefix = todayKey.slice(0, 7);
  const records = Object.values(calendar);
  const monthRecords = records.filter((record) => record.date.startsWith(monthPrefix));
  return {
    currentStreak: calculateStreak(calendar, todayKey),
    totalLearningDays: records.filter((record) => record.completedSessions?.length).length,
    monthlySessionCount: monthRecords.reduce((sum, record) => sum + (record.totalSessions || 0), 0),
    monthlyTotalMinutes: monthRecords.reduce((sum, record) => sum + (record.totalMinutes || 0), 0),
    monthlyTotalExp: monthRecords.reduce((sum, record) => sum + (record.totalExp || 0), 0),
    todaySessionCount: calendar[todayKey]?.totalSessions || 0,
    todayTotalExp: calendar[todayKey]?.totalExp || 0
  };
}

export function getRecentLearningDays(calendar = {}, days = 7, todayKey = getTodayDateKey()) {
  const cursor = new Date(`${todayKey}T12:00:00`);
  cursor.setDate(cursor.getDate() - (days - 1));
  const recentDays = [];

  for (let index = 0; index < days; index += 1) {
    const dateKey = getTodayDateKey(cursor);
    const record = calendar[dateKey] || {
      date: dateKey,
      completedSessions: [],
      totalSessions: 0,
      totalMinutes: 0,
      totalExp: 0
    };
    recentDays.push({
      date: dateKey,
      weekday: ["日", "一", "二", "三", "四", "五", "六"][cursor.getDay()],
      day: cursor.getDate(),
      isToday: dateKey === todayKey,
      hasLearning: record.completedSessions.length > 0,
      totalSessions: record.totalSessions || 0,
      totalExp: record.totalExp || 0
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return recentDays;
}

export function getMonthCalendar(calendar = {}, monthKey = getTodayDateKey().slice(0, 7)) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const days = [];

  for (let i = 0; i < leadingBlanks; i += 1) {
    days.push({ isBlank: true, key: `blank_${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = calendar[dateKey] || {
      date: dateKey,
      completedSessions: [],
      totalSessions: 0,
      totalMinutes: 0,
      totalExp: 0
    };
    days.push({
      ...record,
      day,
      hasLearning: record.completedSessions.length > 0
    });
  }

  return {
    monthKey,
    label: `${year} 年 ${month} 月`,
    days
  };
}
