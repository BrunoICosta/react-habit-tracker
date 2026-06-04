import type common from '../pt-BR/common'

const en: typeof common = {
  appName: 'Habits',
  skipToContent: 'Skip to content',
  nav: {
    label: 'Main navigation',
    today: 'Today',
    habits: 'Habits',
    stats: 'Stats',
    settings: 'Settings',
  },
  routes: {
    today: 'Today',
    habits: 'Habits',
    'habit-new': 'New habit',
    'habit-detail': 'Habit details',
    'habit-edit': 'Edit habit',
    stats: 'Stats',
    settings: 'Settings',
    'not-found': 'Page not found',
  },
  actions: {
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    newHabit: 'New habit',
    createHabit: 'Create habit',
    seeHabits: 'See habits',
    goToToday: 'Go to Today',
  },
  notFound: {
    title: 'Page not found',
    description: 'This address does not exist.',
  },
  habitNotFound: {
    title: 'Habit not found',
    description: 'It may have been deleted or the link is wrong.',
  },
  status: {
    offline: 'You are offline. Everything keeps working.',
    offlineReady: 'Done! The app now works offline.',
  },
  language: {
    label: 'Language',
    'pt-BR': 'Português',
    en: 'English',
    switchTo: 'Switch to {{language}}',
  },
  dates: {
    weekdayLong: 'EEEE, MMMM d',
    full: 'EEEE, MMMM d, yyyy',
    date: 'MMMM d, yyyy',
  },
  units: {
    day_one: '{{count}} day',
    day_other: '{{count}} days',
    habit_one: '{{count}} habit',
    habit_other: '{{count}} habits',
    perDay: '{{count}}× a day',
  },
}

export default en
