import type { Trait } from '@/types'

export const BASE_TRAITS: Trait[] = [
  // Интеллектуальные
  { id: 'curious', name: 'Любопытный', description: 'Тянется к новым знаниям, задаёт много вопросов', statModifiers: { intelligence: 5, perception: 3 }, moodModifier: 5, tags: ['mental', 'positive'] },
  { id: 'analytical', name: 'Аналитичный', description: 'Разбирает ситуации на части, мыслит логически', statModifiers: { intelligence: 8 }, moodModifier: 0, tags: ['mental'] },
  { id: 'creative_mind', name: 'Творческий ум', description: 'Мыслит нестандартно, находит необычные решения', statModifiers: { creativity: 8, intelligence: 3 }, moodModifier: 5, tags: ['mental', 'positive'] },
  { id: 'absent_minded', name: 'Рассеянный', description: 'Забывает мелочи, теряет вещи, но может сосредоточиться на главном', statModifiers: { intelligence: 3, perception: -5 }, moodModifier: -5, tags: ['mental', 'negative'] },

  // Социальные
  { id: 'empathic', name: 'Эмпат', description: 'Тонко чувствует эмоции других, легко устанавливает контакт', statModifiers: { charisma: 8, perception: 5 }, moodModifier: 3, tags: ['social', 'positive'] },
  { id: 'charismatic', name: 'Харизматичный', description: 'Притягивает внимание, легко убеждает и ведёт за собой', statModifiers: { charisma: 10 }, moodModifier: 5, tags: ['social', 'positive'] },
  { id: 'introvert', name: 'Интроверт', description: 'Нуждается в одиночестве для восстановления, сторонится шумных компаний', statModifiers: { charisma: -3, will: 5 }, moodModifier: -5, tags: ['social'] },
  { id: 'proud', name: 'Гордый', description: 'Болезненно воспринимает унижение, не просит о помощи', statModifiers: { will: 5, charisma: -3 }, moodModifier: -10, tags: ['social', 'negative'] },
  { id: 'kind', name: 'Добросердечный', description: 'Охотно помогает, сложно отказывает, верит в лучшее', statModifiers: { charisma: 5 }, moodModifier: 10, tags: ['social', 'positive'] },
  { id: 'manipulative', name: 'Манипулятор', description: 'Умело использует слабости других в своих целях', statModifiers: { charisma: 5, intelligence: 3 }, moodModifier: -5, tags: ['social', 'dark'] },

  // Воля и стойкость
  { id: 'resilient', name: 'Стойкий', description: 'Быстро восстанавливается после потрясений', statModifiers: { will: 8, endurance: 5 }, moodModifier: 10, tags: ['mental', 'positive'] },
  { id: 'stubborn', name: 'Упрямый', description: 'Редко меняет решение, идёт до конца даже когда это вредит', statModifiers: { will: 10, charisma: -5 }, moodModifier: -3, tags: ['mental'] },
  { id: 'anxious', name: 'Тревожный', description: 'Склонен к беспокойству, видит угрозы там где их нет', statModifiers: { perception: 5, will: -5 }, moodModifier: -15, tags: ['mental', 'negative'] },
  { id: 'traumatized', name: 'Травмированный', description: 'Несёт незажившие раны прошлого, триггерится на похожие ситуации', statModifiers: { will: -8, perception: 5 }, moodModifier: -20, tags: ['mental', 'dark', 'negative'] },

  // Физические
  { id: 'athletic', name: 'Атлетичный', description: 'Физически развит, легко переносит нагрузки', statModifiers: { endurance: 10, agility: 5 }, moodModifier: 5, tags: ['physical', 'positive'] },
  { id: 'graceful', name: 'Грациозный', description: 'Двигается плавно и уверенно', statModifiers: { agility: 8 }, moodModifier: 3, tags: ['physical'] },
  { id: 'frail', name: 'Хрупкий', description: 'Слабое здоровье, быстро устаёт', statModifiers: { endurance: -10, intelligence: 3 }, moodModifier: -5, tags: ['physical', 'negative'] },

  // Особые / магические
  { id: 'perceptive', name: 'Проницательный', description: 'Замечает то что другие пропускают, читает между строк', statModifiers: { perception: 12, intelligence: 3 }, moodModifier: 0, tags: ['special'] },
  { id: 'lucky_star', name: 'Счастливчик', description: 'Удача улыбается чаще обычного', statModifiers: { luck: 15 }, moodModifier: 10, tags: ['special', 'positive'] },
  { id: 'reincarnated', name: 'Реинкарнированный', description: 'Несёт память прошлой жизни, видит мир через призму пережитого', statModifiers: { intelligence: 5, will: 5 }, moodModifier: -10, tags: ['special', 'magic'] },
  { id: 'magic_sensitive', name: 'Магочувствительный', description: 'Воспринимает магические потоки, потенциально способен к волшебству', statModifiers: { perception: 8 }, moodModifier: 3, tags: ['special', 'magic'] },

  // Видовые (для антропоморфов)
  { id: 'predator_instinct', name: 'Инстинкт хищника', description: 'Острые рефлексы, склонность к territorial-поведению', statModifiers: { perception: 5, agility: 5 }, moodModifier: 0, tags: ['species', 'furry'] },
  { id: 'pack_mentality', name: 'Стайное мышление', description: 'Ставит интересы близких выше своих, теряется без группы', statModifiers: { charisma: 5, will: -3 }, moodModifier: 5, tags: ['species', 'furry'] },
]
