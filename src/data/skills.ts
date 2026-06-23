import type { Stats } from '@/types'

export interface SkillDefinition {
  id: string
  name: string
  description: string
  parentStat: keyof Stats
  tags: string[]
}

export const BASE_SKILLS: SkillDefinition[] = [
  // Интеллект
  { id: 'mathematics', name: 'Математика', description: 'Счёт, логика, алгебра, статистика', parentStat: 'intelligence', tags: ['academic'] },
  { id: 'medicine', name: 'Медицина', description: 'Диагностика, лечение, первая помощь', parentStat: 'intelligence', tags: ['academic', 'practical'] },
  { id: 'history', name: 'История', description: 'Знание прошлого, культур, событий', parentStat: 'intelligence', tags: ['academic'] },
  { id: 'science', name: 'Наука', description: 'Физика, химия, биология', parentStat: 'intelligence', tags: ['academic'] },
  { id: 'languages', name: 'Языки', description: 'Изучение иностранных языков', parentStat: 'intelligence', tags: ['academic', 'social'] },
  { id: 'strategy', name: 'Стратегия', description: 'Планирование, тактика, принятие решений', parentStat: 'intelligence', tags: ['mental'] },
  { id: 'research', name: 'Исследование', description: 'Поиск информации, анализ источников', parentStat: 'intelligence', tags: ['academic'] },

  // Харизма
  { id: 'negotiation', name: 'Переговоры', description: 'Убеждение, торг, разрешение конфликтов', parentStat: 'charisma', tags: ['social'] },
  { id: 'leadership', name: 'Лидерство', description: 'Управление людьми, вдохновение, организация', parentStat: 'charisma', tags: ['social'] },
  { id: 'acting', name: 'Актёрство', description: 'Перевоплощение, ложь, скрытие эмоций', parentStat: 'charisma', tags: ['social', 'deception'] },
  { id: 'etiquette', name: 'Этикет', description: 'Поведение в обществе, протокол, манеры', parentStat: 'charisma', tags: ['social'] },
  { id: 'teaching', name: 'Обучение', description: 'Передача знаний, объяснение, наставничество', parentStat: 'charisma', tags: ['social', 'academic'] },

  // Воля
  { id: 'meditation', name: 'Медитация', description: 'Контроль разума, концентрация, успокоение', parentStat: 'will', tags: ['mental'] },
  { id: 'discipline', name: 'Самодисциплина', description: 'Выполнение рутины, сопротивление соблазнам', parentStat: 'will', tags: ['mental'] },

  // Восприятие
  { id: 'stealth', name: 'Скрытность', description: 'Незаметное перемещение, маскировка', parentStat: 'perception', tags: ['practical'] },
  { id: 'investigation', name: 'Расследование', description: 'Поиск улик, дедукция, анализ сцены', parentStat: 'perception', tags: ['practical'] },
  { id: 'tracking', name: 'Следопытство', description: 'Выслеживание, чтение следов, ориентирование', parentStat: 'perception', tags: ['practical', 'outdoor'] },

  // Ловкость
  { id: 'combat', name: 'Бой', description: 'Рукопашный бой, уклонение, контратаки', parentStat: 'agility', tags: ['combat'] },
  { id: 'acrobatics', name: 'Акробатика', description: 'Прыжки, перекаты, балансирование', parentStat: 'agility', tags: ['physical'] },
  { id: 'sleight_of_hand', name: 'Ловкость рук', description: 'Карманные кражи, трюки, работа с замками', parentStat: 'agility', tags: ['practical', 'deception'] },
  { id: 'driving', name: 'Вождение', description: 'Управление транспортом', parentStat: 'agility', tags: ['practical'] },

  // Выносливость
  { id: 'athletics', name: 'Атлетика', description: 'Бег, плавание, лазание, тяжёлый труд', parentStat: 'endurance', tags: ['physical'] },
  { id: 'survival', name: 'Выживание', description: 'Добыча еды, ориентирование, первая помощь в полевых условиях', parentStat: 'endurance', tags: ['outdoor', 'practical'] },

  // Креативность
  { id: 'writing', name: 'Письмо', description: 'Литература, журналистика, storytelling', parentStat: 'creativity', tags: ['art'] },
  { id: 'music', name: 'Музыка', description: 'Игра на инструментах, пение, композиция', parentStat: 'creativity', tags: ['art'] },
  { id: 'visual_art', name: 'Изобразительное искусство', description: 'Рисунок, живопись, скульптура', parentStat: 'creativity', tags: ['art'] },
  { id: 'cooking', name: 'Готовка', description: 'Приготовление еды, кулинария', parentStat: 'creativity', tags: ['practical'] },
  { id: 'crafting', name: 'Ремесло', description: 'Создание вещей своими руками', parentStat: 'creativity', tags: ['practical'] },
]
