import type { Stats } from '@/types'

export interface StatDefinition {
  key: keyof Stats
  label: string
  description: string
}

export const STAT_DEFINITIONS: StatDefinition[] = [
  { key: 'intelligence', label: 'Интеллект', description: 'Обучаемость, память, анализ, решение задач' },
  { key: 'charisma', label: 'Харизма', description: 'Обаяние, убеждение, лидерство, эмпатия' },
  { key: 'will', label: 'Воля', description: 'Самоконтроль, упорство, устойчивость к давлению' },
  { key: 'perception', label: 'Восприятие', description: 'Внимательность, чутьё, наблюдательность' },
  { key: 'agility', label: 'Ловкость', description: 'Координация, скорость, реакция' },
  { key: 'endurance', label: 'Выносливость', description: 'Физическая стойкость, здоровье, энергия' },
  { key: 'creativity', label: 'Креативность', description: 'Воображение, нестандартное мышление, искусство' },
  { key: 'luck', label: 'Удача', description: 'Влияет на случайные исходы событий' },
]
