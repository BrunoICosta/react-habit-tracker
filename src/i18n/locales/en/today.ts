import type today from '../pt-BR/today'

const en: typeof today = {
  title: 'Today',
  emptyTitle: 'Your first habit',
  emptyDescription:
    'Create small habits and check them off here every day. Consistency does the rest.',
  loadSample: 'Try it with sample data',
  summaryLabel: "Today's progress",
  summaryCount_one: '<strong>{{done}}</strong> of {{count}} habit',
  summaryCount_other: '<strong>{{done}}</strong> of {{count}} habits',
  messages: {
    nothing: 'Nothing scheduled for today.',
    start: "Let's start? One habit at a time.",
    complete: 'All done! Day complete. 🎉',
    half: 'More than halfway. Keep going!',
    progress: 'Good start, keep moving.',
  },
  freeDayTitle: 'Free day',
  freeDayDescription: 'No habits are scheduled for today. Enjoy the rest.',
  listLabel: "Today's habits",
  offToday_one: '{{count}} habit is not scheduled for today.',
  offToday_other: '{{count}} habits are not scheduled for today.',
  card: {
    streakShort_one: '{{count}} day',
    streakShort_other: '{{count}} days',
    startStreak: 'Start a streak today',
    uncheck: 'Uncheck {{name}}',
    check: 'Mark {{name}} as done',
    register: 'Log {{name}} ({{count}} of {{target}})',
    undo: 'Remove one check-in from {{name}}',
  },
}

export default en
