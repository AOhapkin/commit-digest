# Commit Digest 📊

Автоматический генератор еженедельных отчетов по Git коммитам. Помогает разработчикам экономить время на составлении отчетов без раскрытия кода или конфиденциальных данных.

## 🚀 Возможности

- 📅 Получение коммитов за последние 7 дней
- 👤 Фильтрация по текущему пользователю Git
- 🚫 Игнорирование служебных коммитов (merge, chore, docs)
- 📊 Группировка коммитов по типам:
  - `feat:` → 🟢 Features
  - `fix:` → 🛠 Fixes
  - `refactor:` → 🔧 Refactoring
  - Остальное → 📝 Other
- 💾 Сохранение отчета в Markdown файл
- 🔄 Работа с несколькими репозиториями одновременно

## 📦 Установка

```bash
npm install
```

## 🛠 Использование

### Базовый запуск (текущий репозиторий)

```bash
npm run dev
```

### Еженедельный отчет (текущий репозиторий)

```bash
npm run weekly
```

### Работа с внешним репозиторием

```bash
npm run weekly -- --repo=/path/to/your/repo
```

### Работа с несколькими репозиториями

```bash
# Указать конкретные репозитории
npm run multi -- --repo=/path/to/repo1 --repo=/path/to/repo2

# Автоматический поиск всех репозиториев
npm run multi -- --auto
```

### Сохранение в файл

```bash
# Один репозиторий
npm run dev -- --save

# Несколько репозиториев
npm run multi -- --repo=/path/to/repo1 --repo=/path/to/repo2 --save
```

### Указание пути для сохранения

```bash
npm run dev -- --save --output=./reports/my-report.md
```

## 📋 Требования

- Node.js 16+
- Git репозиторий
- Настроенный Git user.name

## 🏗 Разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Компиляция TypeScript
npm run build

# Запуск скомпилированного кода
npm start
```

## 📁 Структура проекта

```
src/
├── index.ts              # Основной файл приложения
├── weekly-summary.ts     # Логика генерации отчетов
└── multi-repo-summary.ts # Работа с несколькими репозиториями
```

## 🎯 Примеры использования

### 1. Отчет по текущему репозиторию

```bash
cd /path/to/your/project
npm run weekly
```

### 2. Отчет по внешнему репозиторию

```bash
npm run weekly -- --repo=/Users/username/Desktop/my-project
```

### 3. Отчеты по всем проектам на рабочем столе

```bash
npm run multi -- --auto
```

### 4. Отчеты по конкретным проектам с сохранением

```bash
npm run multi -- --repo=/path/to/project1 --repo=/path/to/project2 --save
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

ISC License
