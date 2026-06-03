import type settings from '../pt-BR/settings'

const en: typeof settings = {
  title: 'Settings',
  subtitle: 'Appearance, language and your data',
  theme: {
    title: 'Theme',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  data: {
    title: 'Your data',
    hint: 'Everything is stored only on this device. Export a backup so you never lose anything or to move your habits to another device.',
    export: 'Export backup',
    import: 'Import backup',
    file: 'Backup file',
    sample: 'Load sample',
    clear: 'Erase everything',
    exported: 'Backup exported.',
    imported_one: '{{count}} habit imported.',
    imported_other: '{{count}} habits imported.',
    sampleLoaded: 'Sample data loaded.',
    cleared: 'All data was erased.',
    errors: {
      invalidJson: 'The file is not valid JSON.',
      notBackup: 'This file does not look like a Habits backup.',
      unsupportedVersion: 'Unsupported backup version.',
      missingHabits: 'The backup has no habit list.',
      invalidHabit: 'The backup contains an invalid habit.',
      duplicateHabit: 'The backup contains duplicated habits.',
      corruptedLogs: 'The backup history is corrupted.',
    },
    dialogs: {
      importTitle: 'Replace your data?',
      importDescription:
        '"{{file}}" has {{habits}} and {{checkIns}}. Your current data will be replaced.',
      importConfirm: 'Import',
      sampleTitle: 'Load sample data?',
      sampleDescription: 'Your current habits will be replaced by a sample set.',
      sampleConfirm: 'Load',
      clearTitle: 'Erase all data?',
      clearDescription: 'All habits and history will be removed from this device.',
      clearConfirm: 'Erase everything',
    },
    checkIn_one: '{{count}} check-in',
    checkIn_other: '{{count}} check-ins',
  },
  sampleNames: {
    water: 'Drink 2L of water',
    read: 'Read 10 pages',
    workout: 'Work out',
    meditate: 'Meditate',
    tidy: 'Quick cleanup',
  },
}

export default en
