const common = {
  appName: 'Hábitos',
  skipToContent: 'Pular para o conteúdo',
  nav: {
    label: 'Navegação principal',
    today: 'Hoje',
    habits: 'Hábitos',
    stats: 'Estatísticas',
    settings: 'Ajustes',
  },
  routes: {
    today: 'Hoje',
    habits: 'Hábitos',
    'habit-new': 'Novo hábito',
    'habit-detail': 'Detalhes do hábito',
    'habit-edit': 'Editar hábito',
    stats: 'Estatísticas',
    settings: 'Ajustes',
    'not-found': 'Página não encontrada',
  },
  actions: {
    back: 'Voltar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    newHabit: 'Novo hábito',
    createHabit: 'Criar hábito',
    seeHabits: 'Ver hábitos',
    goToToday: 'Ir para Hoje',
  },
  notFound: {
    title: 'Página não encontrada',
    description: 'Esse endereço não existe.',
  },
  habitNotFound: {
    title: 'Hábito não encontrado',
    description: 'Ele pode ter sido excluído ou o link está incorreto.',
  },
  status: {
    offline: 'Você está offline. Tudo continua funcionando.',
    offlineReady: 'Pronto! O app agora funciona offline.',
  },
  language: {
    label: 'Idioma',
    'pt-BR': 'Português',
    en: 'English',
    switchTo: 'Mudar para {{language}}',
  },
  /** date-fns patterns. */
  dates: {
    weekdayLong: "EEEE, d 'de' MMMM",
    full: "EEEE, d 'de' MMMM 'de' yyyy",
    date: "d 'de' MMMM 'de' yyyy",
  },
  units: {
    day_one: '{{count}} dia',
    day_other: '{{count}} dias',
    habit_one: '{{count}} hábito',
    habit_other: '{{count}} hábitos',
    perDay: '{{count}}× por dia',
  },
}

export default common
