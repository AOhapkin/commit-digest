#!/bin/bash

# Quick Report Script для Commit Digest
# Автоматически находит все Git репозитории и создает отчеты

echo "🚀 Quick Report Generator"
echo "=========================="

# Путь к проекту commit-digest
COMMIT_DIGEST_PATH="$(dirname "$0")/.."

# Переходим в директорию проекта
cd "$COMMIT_DIGEST_PATH"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Не найден package.json. Убедитесь, что скрипт запущен из правильной директории."
    exit 1
fi

echo "📁 Поиск Git репозиториев в домашней директории..."

# Находим все .git директории
REPOS=$(find ~ -name ".git" -type d 2>/dev/null | head -20)

if [ -z "$REPOS" ]; then
    echo "❌ Git репозитории не найдены"
    exit 1
fi

echo "📊 Найдено репозиториев: $(echo "$REPOS" | wc -l)"

# Создаем отчеты
echo ""
echo "🔍 Генерация отчетов..."
npm run multi -- --auto --save

echo ""
echo "✅ Отчеты созданы! Проверьте файлы weekly-report-*.md" 