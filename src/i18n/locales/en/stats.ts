import type stats from '../pt-BR/stats'

const en: typeof stats = {
  title: 'Stats',
  subtitle: 'Your consistency over time',
  emptyTitle: 'No data yet',
  emptyDescription: 'Stats show up as soon as you create and check off your habits.',
  tiles: {
    thisWeek: 'This week',
    selectedWeek: 'Selected week',
    weekHint: '{{done}} of {{scheduled}} completed',
    last30: 'Last 30 days',
    last30Hint: 'Completion rate',
    bestStreak: 'Best streak',
    perfectDays: 'Perfect days',
    perfectDaysHint: 'In the last 30 days',
  },
  week: {
    title: 'Week',
    previous: 'Previous week',
    next: 'Next week',
    chartLabel: 'Habits completed per day',
    future: '{{day}}: not yet',
    day: '{{day}}: {{done}} of {{scheduled}} habits',
  },
  ranking: {
    title: 'By habit',
    hint: 'Completion rate in the last 30 days.',
    progressLabel: '{{name}} completion',
    meta: '{{done}} of {{scheduled}} days · current streak: {{current}}',
  },
  heatmap: {
    title: 'Last 12 months',
    label: 'Yearly heatmap for all habits',
  },
}

export default en
