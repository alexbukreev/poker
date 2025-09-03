# Карта проекта с пояснениями

```
src/
├─ App.tsx                      # Корневой компоновщик: стол + левый/правый доки.
│                               # ДЕРЖИТ: TableState, poStats, trainerPack/index,
│                               # текущий ответ/вердикт и историю тренажёра.
│
├─ components/
│  ├─ PokerTable.tsx            # Рендер стола (сиденья, бейджи вкладов, дилер, центр Pot).
│  │                             • В hero-слоте показывает карты через <InlineHand/>.
│  ├─ Dock.tsx                  # Обёртка над shadcn <Sheet>: левый/правый доки.
│  │                             • Заголовок фиксирован, скролл только у контента.
│  │                             • Прозрачность/границы: класс SheetContent.
│  ├─ UiSection.tsx             # Заголовок секции с Collapsible (аккордеоны + разделители).
│  └─ ui/                       # ВЕНДОРНЫЕ примитивы shadcn/ui (не меняем бизнес-логику)
│     ├─ sheet.tsx              # Сам слайд-овер (границы/оверлей/анимации).
│     ├─ button.tsx, select.tsx, slider.tsx, dialog.tsx, tabs.tsx, …  # прочие контролы.
│  └─ cards.tsx                 # NEW: отрисовка мастей и двухкартовых рук (InlineHand).
│
├─ panels/
│  ├─ ControlsPanel.tsx         # Левая панель:
│  │                              • селект Hero (UTG/HJ/…/Random)
│  │                              • кнопка Generate/New spot (через onGenerate)
│  │                              • Preferences: Error tolerance (Slider, хранится в prefs)
│  │                              • Appearance: переключатель темы
│  └─ QuizzesPanel.tsx          # Правая панель:
│                                 • Preflop Trainer (загрузка JSON-пака, выбор сценария)
│                                 • History (последние попытки)
│                                 • Pot odds квиз
│                                 • Кнопки «Памятка» и «Диапазоны» внутри секции тренера.
│
├─ quiz/
│  ├─ potOdds.ts                # Чистая математика pot odds: порог эквити из TableState.
│  ├─ PotOddsQuiz.tsx           # UI квиза: слайдер ответа, Check/Generate, график ошибок.
│  │                             • Анти-оверфлоу и адаптив кнопок «±0.1%».
│  ├─ preflop.ts                # NEW: типы/утилиты тренажёра префлопа:
│  │                             • типы Pack/Scenario/Solution/UserAnswer/Verdict
│  │                             • buildStateFromScenario() — разливает pre_actions на стол
│  │                             • evaluateAnswer() — проверка ответа (учёт миксов)
│  │                             • normalizePack() — валидация загружаемого JSON
│  ├─ PreflopTrainer.tsx        # NEW: панель загрузки и навигации по сценариям пака.
│  ├─ PreflopActionBar.tsx      # NEW: нижняя панель действий (Fold/Call/Raise) под столом.
│  ├─ TrainerHistory.tsx        # NEW: вывод истории ответов (accuracy/вердикт) в правой панели.
│  ├─ PreflopHelp.tsx           # NEW: «Памятка» (RU) — pot odds, MDF, эвристики; модалка.
│  ├─ RangeModal.tsx            # NEW: модалка «Диапазоны» с табами Calls / 3-bets.
│  ├─ RangeMatrix.tsx           # NEW: матрица 13×13; парсер диапазона (PokerStove-like).
│  └─ RangeCheatSheet.tsx       # (опционально) список пресетов, если нужен инлайн.
│
├─ engine/
│  ├─ table.ts                  # Модель стола (TableState) и утилиты: постинг блайндов,
│  │                              openRaise/callToTotal/computePot/stackBehind/…
│  ├─ generator.ts              # generatePreflopSpot({ hero }) / generateRandomPreflopSpot()
│  │                              выбирает героя, ставит блайнды, генерит опен/коллы/3-бет.
│  └─ deck.ts                   # База под сдачу карт (пока не задействована в генераторе).
│
├─ state/
│  └─ prefs.tsx                 # Контекст/хук usePrefs(): { errorTol, setErrorTol } (+LS).
│
├─ lib/
│  └─ utils.ts                  # cn() и прочие вспомогательные утилиты.
│
├─ assets/                      # статика (если появится)
└─ index.css / main.tsx         # стили/инициализация приложения.
```

# Потоки данных (обновлено)

- `App.tsx` хранит:
    
    - `state: TableState` — общее состояние стола.
        
    - `poStats: number[]` — статистика ошибок пот-оддс-квиза (персистится на время сессии).
        
    - `heroPref: SeatPos | "random"`.
        
    - `trainerPack: PreflopPack | null`, `trainerIndex: number`.
        
    - `answer: UserAnswer | null`, `verdict: Verdict | null`.
        
    - `history: {scenarioId, action, verdict, ts}[]` — последние ответы тренажёра.
        
- `ControlsPanel`:
    
    - читает/меняет `heroPref` (селект Hero),
        
    - вызывает `onGenerate({ hero: heroPref })` → `App` генерит новый спот,
        
    - меняет `errorTol` через `usePrefs()`.
        
- `QuizzesPanel`:
    
    - секция **Preflop Trainer**:
        
        - `<PreflopTrainer>`: загрузка JSON-пака, выбор сценария.
            
        - кнопки «Памятка» (`<PreflopHelp/>`) и «Диапазоны» (`<RangeModal/>`) — модалки.
            
    - секция **History**: `<TrainerHistory items={history} />`.
        
    - секция **Pot odds**: `<PotOddsQuiz ... />`.
        
- `PreflopActionBar` (под столом):
    
    - рендерит «Fold / Call / Raise to … / Submit / Next».
        
    - пишет в `App` выбранный `answer`, вызывает `evaluateAnswer()` → `verdict`, пушит в `history`.
        
- `PotOddsQuiz`:
    
    - считает порог из `state` (`buildPotOddsFromState`),
        
    - при `Check` вызывает `onAddStat(error)`,
        
    - рисует график из приходящего `stats`,
        
    - кнопка `Generate spot` вызывает `onNewSpot()` (тот же генератор, что и слева).
        
- `preflop.ts`:
    
    - JSON-пак: `PreflopPack.scenarios[]` — сценарии (support single-raised/multiway/squeeze).
        
    - `buildStateFromScenario()` — аккуратно проставляет `contribs` (через `callToTotal`).
        
    - `evaluateAnswer()` — сверяет действие и учитывает миксы (partial).
        

# Где менять «прозрачность» и границы док-панелей

- Прозрачность фона панели: **`Dock.tsx`** → `<SheetContent className="... bg-background/100 ...">`  
    (замени `/100` на `/90` и т.п.)
    
- Верхняя полоса: **`Dock.tsx`** → `<SheetHeader className="border-b …">`
    
- Внутренние разделители секций: **`UiSection.tsx`** — нижний `<div className="border-b …" />`.
    

# Вертикальный скролл в доках

- Реализован в **`Dock.tsx`**: `SheetHeader` фиксирован (`shrink-0`), скролл только у контента (внутренний контейнер `overflow-y-auto`). Внешний вид секций не меняется.
    

# Диапазоны (модалка)

- **`RangeModal.tsx`** — модальное окно с табами «Calls / 3-bets».
    
- **`RangeMatrix.tsx`** — 13×13 матрица: пары по диагонали, выше — suited, ниже — offsuit. Подсветка по строке диапазона (PokerStove-like).
    
- Сейчас используется статический `DATA` с ключами вида `BBvsBTN_2.5x`. Позже можно подставлять ключ автоматически.
    

Если нужно, сделаю такой же компактный README-блок для JSON-формата сценариев (минимально необходимое поле/пример) — скажи.