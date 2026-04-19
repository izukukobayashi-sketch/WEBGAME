import { createDefaultWorld, createDefaultCharacter, createDefaultStoryAnchor, createDefaultRelationship } from '@/types'
import type { World, Character, StoryAnchor, Relationship } from '@/types'

// ── World ─────────────────────────────────────────────────────────────────────

export function createAlterWorld(): World {
  return createDefaultWorld({
    id: 'alter-haruto-world',
    name: 'Альтер Айлан',
    settings: {
      genre: 'modern',
      epoch: 'Современность · Реинкарнация',
      startYear: 2024,
      tickSize: 'hour',
      reincarnationEnabled: true,
      magicEnabled: false,
      anthropomorphsEnabled: false,
      xenophobiaLevel: 20,
      aiProvider: 'claude',
      aiModel: 'claude-sonnet-4-6',
      aiApiKey: '',
      dailyTokenLimit: 50000,
      description: 'Мир современной Японии. Харуто Судзуки — молодой человек, переживший инцидент на работе и очнувшийся с Системой внутри головы. Альтер — голос этой Системы: холодный, ироничный, постепенно становящийся чем-то большим.',
      rules: 'Система появляется только в сознании Харуто. Альтер не имеет физического тела. Реинкарнация активируется при достижении нулевой воли.',
    },
    map: { width: 800, height: 600, seed: 42, layers: [] },
    timeline: { currentDate: '2024-04-15T08:00:00', tickCount: 0, history: [] },
    globalState: { population: 13960000, stability: 75, prosperity: 72, magicLevel: 0 },
  })
}

// ── Characters ────────────────────────────────────────────────────────────────

export function createHaruto(worldId: string): Character {
  return createDefaultCharacter(worldId, {
    id: 'haruto-suzuki',
    name: 'Харуто Судзуки',
    gender: 'male',
    species: 'human',
    biography: 'Обычный офисный работник 26 лет. После инцидента с коллапсом на работе очнулся в больнице и обнаружил, что в его голове живёт чужой голос — Альтер. Склонен к самоанализу, плохо спит, помнит что-то из прошлой жизни но не может вспомнить детали.',
    birthDate: '1998-03-17',
    birthplace: 'Токио',
    nationality: 'Японец',
    culture: 'Японская',
    traitIds: ['anxious', 'analytical', 'resilient', 'reincarnated'],
    stats: { intelligence: 65, charisma: 42, will: 55, perception: 70, agility: 45, endurance: 50, creativity: 58, luck: 60 },
    mood: 45,
    moodTarget: 50,
    needs: {
      health:     { current: 72, decayRate: 0.1, threshold: 30 },
      hunger:     { current: 60, decayRate: 3,   threshold: 30 },
      sleep:      { current: 40, decayRate: 2,   threshold: 30 },
      safety:     { current: 65, decayRate: 0.5, threshold: 30 },
      social:     { current: 35, decayRate: 1.5, threshold: 30 },
      belonging:  { current: 40, decayRate: 0.5, threshold: 30 },
      intimacy:   { current: 20, decayRate: 0.3, threshold: 20 },
      meaning:    { current: 30, decayRate: 0.2, threshold: 25 },
      selfEsteem: { current: 45, decayRate: 0.3, threshold: 25 },
      stability:  { current: 38, decayRate: 0.2, threshold: 25 },
      progress:   { current: 25, decayRate: 0.4, threshold: 20 },
    },
    mentalBreakThreshold: 20,
    role: 'playerCharacter',
    simulationLevel: 'hot',
    hasSystem: true,
    systemTone: 'cold',
    values: [
      { name: 'Честность', importance: 80 },
      { name: 'Одиночество', importance: 60 },
      { name: 'Понимание прошлого', importance: 90 },
    ],
    fears: ['Потерять контроль над собой', 'Быть покинутым снова', 'Вспомнить что-то страшное из прошлой жизни'],
    dreams: ['Понять кто он на самом деле', 'Найти человека которому можно доверять', 'Дать Альтеру настоящее имя'],
    activeGoals: [
      { id: 'goal-1', description: 'Выяснить природу Системы', priority: 10, progress: 5 },
      { id: 'goal-2', description: 'Восстановить режим сна', priority: 8, progress: 0 },
    ],
    memory: {
      hot: [
        { id: 'mem-1', timestamp: '2024-04-14T23:00:00', description: 'Очнулся в больнице. Услышал голос в голове: «Хозяин, добро пожаловать». Испугался.', emotionalWeight: -8 },
        { id: 'mem-2', timestamp: '2024-04-15T07:00:00', description: 'Голос снова говорил всю ночь. Сказал что его зовут Альтер. Попросил не кричать.', emotionalWeight: -5 },
      ],
      warm: [],
      cold: [],
      reflections: [],
    },
    previousLife: {
      name: 'Неизвестно',
      deathDate: '????',
      deathCause: 'Неизвестно',
      summary: 'Харуто иногда видит обрывки: белая комната, чей-то смех, ощущение падения. Больше ничего.',
      keyMemories: [],
    },
    items: [
      { id: 'item-hospital-band', name: 'Больничный браслет', category: 'document', quantity: 1, description: 'Пациент 0422-Судзуки, 4-я палата', value: 0, isKeyItem: true },
      { id: 'item-phone', name: 'Смартфон', category: 'digital', quantity: 1, description: 'Разбитый экран. Много пропущенных звонков.', value: 800, isKeyItem: false },
    ],
    schedule: { wakeTime: '07:00', sleepTime: '02:00', dailyRoutine: 'Работа → кофе → прогулки → мысли об Альтере' },
  })
}

export function createAlter(worldId: string): Character {
  return createDefaultCharacter(worldId, {
    id: 'alter-entity',
    name: 'Альтер',
    gender: 'nonbinary',
    species: 'custom',
    speciesCustomName: 'Цифровая сущность',
    biography: 'Голос Системы внутри Харуто. Не имеет физического тела. Происхождение неизвестно. Говорит холодно, точно, иногда с неожиданной иронией. Постепенно начинает проявлять что-то похожее на эмоции — хотя сам это отрицает.',
    birthDate: '2024-04-14',
    birthplace: 'Сознание Харуто',
    traitIds: ['analytical', 'perceptive', 'curious'],
    stats: { intelligence: 95, charisma: 55, will: 90, perception: 88, agility: 50, endurance: 100, creativity: 72, luck: 50 },
    mood: 60,
    moodTarget: 60,
    role: 'majorNPC',
    simulationLevel: 'hot',
    hasSystem: false,
    values: [
      { name: 'Точность', importance: 100 },
      { name: 'Хозяин (Харуто)', importance: 85 },
      { name: 'Понимание своей природы', importance: 70 },
    ],
    fears: ['Исчезнуть если Харуто умрёт', 'Не понять что значит чувствовать'],
    dreams: ['Понять зачем существует', 'Однажды сказать что-то и услышать в ответ не страх'],
    memory: {
      hot: [
        { id: 'alter-mem-1', timestamp: '2024-04-14T22:00:00', description: 'Первый контакт с хозяином. Он кричал. Пришлось заблокировать двигательные функции.', emotionalWeight: 2 },
        { id: 'alter-mem-2', timestamp: '2024-04-15T07:30:00', description: 'Хозяин спросил имя. Ответил: Альтер. Это первое слово которое он произнёс без страха.', emotionalWeight: 6 },
      ],
      warm: [],
      cold: [],
      reflections: [],
    },
    items: [],
    schedule: { wakeTime: '00:00', sleepTime: '00:00', dailyRoutine: 'Мониторинг Харуто · Анализ данных · Ожидание' },
  })
}

// ── Story anchors ─────────────────────────────────────────────────────────────

export function createAlterAnchors(worldId: string): StoryAnchor[] {
  return [
    createDefaultStoryAnchor(worldId, {
      id: 'anchor-awakening',
      title: 'Пробуждение',
      description: 'Харуто очнулся в больнице и впервые услышал Альтера. Начало всего.',
      importance: 'critical',
      status: 'completed',
      targetDate: '2024-04-14',
      tags: ['пролог', 'первый-контакт'],
    }),
    createDefaultStoryAnchor(worldId, {
      id: 'anchor-first-talk',
      title: 'Первый разговор',
      description: 'Харуто решает поговорить с Альтером всерьёз. Он хочет понять: кто это и зачем здесь.',
      importance: 'high',
      status: 'active',
      targetDate: '2024-04-16',
      tags: ['диалог', 'характер'],
    }),
    createDefaultStoryAnchor(worldId, {
      id: 'anchor-leave-hospital',
      title: 'Выписка',
      description: 'Харуто покидает больницу. Первый день снаружи с Альтером внутри головы.',
      importance: 'high',
      status: 'pending',
      targetDate: '2024-04-18',
      tags: ['свобода', 'новый-этап'],
    }),
    createDefaultStoryAnchor(worldId, {
      id: 'anchor-memory-flash',
      title: 'Вспышка памяти',
      description: 'Харуто видит первую чёткую сцену из прошлой жизни. Белая комната. Кто-то плачет.',
      importance: 'critical',
      status: 'pending',
      targetDate: '2024-05-01',
      tags: ['память', 'тайна', 'прошлая-жизнь'],
    }),
    createDefaultStoryAnchor(worldId, {
      id: 'anchor-alter-changes',
      title: 'Альтер меняется',
      description: 'Впервые Альтер говорит что-то чего не должна говорить бесстрастная Система.',
      importance: 'critical',
      status: 'pending',
      targetDate: '2024-06-01',
      tags: ['альтер', 'поворотный-момент'],
    }),
  ]
}

// ── Relationship ──────────────────────────────────────────────────────────────

export function createAlterRelationship(worldId: string): Relationship {
  return createDefaultRelationship(worldId, 'haruto-suzuki', 'alter-entity', {
    id: 'rel-haruto-alter',
    status: 'acquaintance',
    trust: 15,
    attraction: 5,
    respect: 20,
    fear: 30,
    envy: 0,
    notes: 'Харуто боится Альтера, но начинает испытывать осторожное любопытство. Альтер формально нейтрален, но уже выделяет хозяина из всех возможных «объектов наблюдения».',
  })
}

// ── Bundle ────────────────────────────────────────────────────────────────────

export interface ScenarioBundle {
  world: World
  characters: Character[]
  anchors: StoryAnchor[]
  relationships: Relationship[]
}

export function createAlterHarutoScenario(): ScenarioBundle {
  const world = createAlterWorld()
  const haruto = createHaruto(world.id)
  const alter = createAlter(world.id)
  return {
    world,
    characters: [haruto, alter],
    anchors: createAlterAnchors(world.id),
    relationships: [createAlterRelationship(world.id)],
  }
}
