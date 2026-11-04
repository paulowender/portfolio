import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardStatus, getPrioritySummary } from '../../src/lib/dashboard-status';
import type { Reminder } from '../../src/types/reminder';

const now = new Date(2026, 10, 3, 12, 0, 0);

function reminder(id: string, dueDate: Date, completed = false): Reminder {
  return {
    id,
    title: id,
    dueDate,
    completed,
    category: 'general',
    priority: 'medium',
    recurrence: null,
    notifyEmail: false,
    notifyWhatsapp: false,
    notifyBefore: 0,
    userId: 'user-1',
    createdAt: now,
    updatedAt: now,
  };
}

test('marks the overview for attention when an incomplete reminder is overdue', () => {
  const result = getDashboardStatus(
    [reminder('overdue', new Date(2026, 10, 2, 18, 0, 0))],
    'ready',
    now
  );

  assert.equal(result.tone, 'attention');
  assert.equal(result.overdueCount, 1);
  assert.equal(result.dueTodayCount, 0);
});

test('marks the overview controlled when incomplete reminders are due today or later', () => {
  const result = getDashboardStatus(
    [
      reminder('today', new Date(2026, 10, 3, 16, 0, 0)),
      reminder('future', new Date(2026, 10, 5, 9, 0, 0)),
    ],
    'ready',
    now
  );

  assert.equal(result.tone, 'controlled');
  assert.equal(result.overdueCount, 0);
  assert.equal(result.dueTodayCount, 1);
});

test('uses neutral language while reminder data is loading, failed, or unavailable', () => {
  for (const state of ['loading', 'error'] as const) {
    const status = getDashboardStatus(undefined, state, now);
    assert.equal(status.tone, 'neutral');
    assert.equal(getPrioritySummary(status), 'unavailable');
  }

  const unavailable = getDashboardStatus(undefined, 'ready', now);
  assert.equal(unavailable.tone, 'neutral');
  assert.equal(getPrioritySummary(unavailable), 'unavailable');
});

test('ignores completed overdue reminders', () => {
  const result = getDashboardStatus(
    [reminder('done', new Date(2026, 10, 1, 9, 0, 0), true)],
    'ready',
    now
  );

  assert.equal(result.tone, 'controlled');
  assert.equal(result.overdueCount, 0);
  assert.deepEqual(result.priority, []);
});

test('orders priorities by overdue, today, then future due date', () => {
  const result = getDashboardStatus(
    [
      reminder('future-late', new Date(2026, 10, 8, 9, 0, 0)),
      reminder('today', new Date(2026, 10, 3, 17, 0, 0)),
      reminder('overdue', new Date(2026, 10, 2, 23, 0, 0)),
      reminder('future-soon', new Date(2026, 10, 4, 9, 0, 0)),
    ],
    'ready',
    now
  );

  assert.deepEqual(
    result.priority.map((item) => item.id),
    ['overdue', 'today', 'future-soon', 'future-late']
  );
});
