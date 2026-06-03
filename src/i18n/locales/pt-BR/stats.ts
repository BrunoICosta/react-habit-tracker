const stats = {
  title: 'Estatísticas',
  subtitle: 'Sua consistência ao longo do tempo',
  emptyTitle: 'Sem dados ainda',
  emptyDescription: 'As estatísticas aparecem assim que você criar e marcar seus hábitos.',
  tiles: {
    thisWeek: 'Esta semana',
    selectedWeek: 'Semana selecionada',
    weekHint: '{{done}} de {{scheduled}} concluídos',
    last30: 'Últimos 30 dias',
    last30Hint: 'Taxa de conclusão',
    bestStreak: 'Melhor sequência',
    perfectDays: 'Dias perfeitos',
    perfectDaysHint: 'Nos últimos 30 dias',
  },
  week: {
    title: 'Semana',
    previous: 'Semana anterior',
    next: 'Próxima semana',
    chartLabel: 'Hábitos concluídos por dia',
    future: '{{day}}: ainda não chegou',
    day: '{{day}}: {{done}} de {{scheduled}} hábitos',
  },
  ranking: {
    title: 'Por hábito',
    hint: 'Taxa de conclusão nos últimos 30 dias.',
    progressLabel: 'Conclusão de {{name}}',
    meta: '{{done}} de {{scheduled}} dias · sequência atual: {{current}}',
  },
  heatmap: {
    title: 'Últimos 12 meses',
    label: 'Mapa de calor anual de todos os hábitos',
  },
}

export default stats
