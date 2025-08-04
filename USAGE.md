# 📖 Инструкция по использованию Commit Digest

## 🎯 Как использовать программу с вашими репозиториями

### 1. Быстрый старт (рекомендуется)

Самый простой способ получить отчеты по всем вашим репозиториям:

```bash
npm run quick
```

Эта команда:

- Автоматически найдет все Git репозитории в вашей системе
- Создаст отчеты по каждому из них
- Сохранит результаты в файлы `weekly-report-*.md`

### 2. Отчет по конкретному репозиторию

Если хотите отчет только по одному проекту:

```bash
# Для текущего репозитория
npm run weekly

# Для внешнего репозитория
npm run weekly -- --repo=/path/to/your/repo
```

### 3. Отчеты по нескольким репозиториям

```bash
# Указать конкретные репозитории
npm run multi -- --repo=/path/to/repo1 --repo=/path/to/repo2

# Автоматический поиск всех репозиториев
npm run multi -- --auto
```

### 4. Сохранение в файлы

Добавьте флаг `--save` к любой команде:

```bash
# Сохранить отчет текущего репозитория
npm run weekly -- --save

# Сохранить отчеты нескольких репозиториев
npm run multi -- --repo=/path/to/repo1 --repo=/path/to/repo2 --save

# Быстрый отчет с сохранением
npm run quick
```

## 📁 Примеры путей к репозиториям

```bash
# Репозитории на рабочем столе
npm run weekly -- --repo=/Users/bbeggar/Desktop/techmarket
npm run weekly -- --repo=/Users/bbeggar/Desktop/go-trips

# Репозитории в других папках
npm run weekly -- --repo=/Users/bbeggar/Projects/my-app
npm run weekly -- --repo=/Users/bbeggar/Documents/work-project
```

## 🔍 Что показывает отчет

Программа анализирует коммиты за последние 7 дней и группирует их:

- 🟢 **Features** - новые функции (`feat:`)
- 🛠 **Fixes** - исправления багов (`fix:`)
- 🔧 **Refactoring** - рефакторинг кода (`refactor:`)
- 📝 **Other** - остальные коммиты

**Игнорируются:**

- `merge:` - слияния веток
- `chore:` - служебные задачи
- `docs:` - документация

## 📊 Пример вывода

```
📊 **Еженедельный отчет**

🟢 **Features**
- feat: add new user authentication system
- feat: implement dark mode toggle

🛠 **Fixes**
- fix: resolve authentication bug in login flow
- fix: update component styling

🔧 **Refactoring**
- refactor: improve code structure and performance

📝 **Other**
- Update README with new features
```

## 🚀 Полезные команды

```bash
# Получить отчет по всем репозиториям
npm run quick

# Отчет по конкретному проекту
npm run weekly -- --repo=/path/to/project

# Отчеты по нескольким проектам
npm run multi -- --repo=/path/to/project1 --repo=/path/to/project2

# Сохранить все отчеты в файлы
npm run multi -- --auto --save
```

## 💡 Советы

1. **Убедитесь, что Git настроен:**

   ```bash
   git config --global user.name "Ваше Имя"
   git config --global user.email "your.email@example.com"
   ```

2. **Для регулярных отчетов:**

   - Добавьте `npm run quick` в cron или планировщик задач
   - Используйте `--save` для автоматического сохранения

3. **Для командной работы:**
   - Создайте скрипт с путями к проектам команды
   - Используйте `npm run multi` с конкретными путями

## ❓ Частые вопросы

**Q: Почему не находятся коммиты?**
A: Проверьте, что:

- Git настроен правильно
- В репозитории есть коммиты за последние 7 дней
- Коммиты сделаны под вашим именем пользователя

**Q: Как изменить период анализа?**
A: Сейчас программа анализирует последние 7 дней. Для изменения периода нужно отредактировать код в `src/weekly-summary.ts`.

**Q: Как добавить новые типы коммитов?**
A: Отредактируйте функцию `getCommitGroup()` в `src/weekly-summary.ts`.

**Q: Где сохраняются файлы отчетов?**
A: По умолчанию в текущей директории с именами вида `weekly-report-{repo-name}-{date}.md`.
