import { simpleGit, SimpleGit } from "simple-git";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

interface CommitGroup {
  title: string;
  emoji: string;
  commits: string[];
}

interface RepoConfig {
  name: string;
  path: string;
}

interface SummaryResult {
  repoName: string;
  content: string;
  hasCommits: boolean;
}

class WeeklySummary {
  private git: SimpleGit;

  constructor(repoPath?: string) {
    this.git = simpleGit(repoPath);
  }

  private async getCurrentUser(): Promise<string> {
    try {
      const result = await this.git.getConfig("user.name");
      return result.value || "";
    } catch (error) {
      console.error("Ошибка при получении имени пользователя:", error);
      return "";
    }
  }

  private async getCommitsForLastWeek(username: string): Promise<Commit[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Получаем все коммиты
      const log = await this.git.log();

      // Фильтруем коммиты по автору и дате
      return log.all
        .filter((commit) => {
          const commitDate = new Date(commit.date);
          return (
            commit.author_name === username &&
            commitDate >= sevenDaysAgo &&
            commitDate <= new Date()
          );
        })
        .map((commit) => ({
          hash: commit.hash,
          message: commit.message.trim(),
          author: commit.author_name,
          date: commit.date,
        }));
    } catch (error) {
      console.error("Ошибка при получении коммитов:", error);
      return [];
    }
  }

  private shouldIgnoreCommit(message: string): boolean {
    const ignoredPrefixes = ["merge", "chore", "docs"];
    const lowerMessage = message.toLowerCase();

    return ignoredPrefixes.some(
      (prefix) =>
        lowerMessage.startsWith(prefix + ":") || lowerMessage.includes(prefix)
    );
  }

  private getCommitGroup(message: string): { title: string; emoji: string } {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.startsWith("feat:")) {
      return { title: "Features", emoji: "🟢" };
    }

    if (lowerMessage.startsWith("fix:")) {
      return { title: "Fixes", emoji: "🛠" };
    }

    if (lowerMessage.startsWith("refactor:")) {
      return { title: "Refactoring", emoji: "🔧" };
    }

    return { title: "Other", emoji: "📝" };
  }

  private groupCommits(commits: Commit[]): CommitGroup[] {
    const groups: { [key: string]: CommitGroup } = {};

    commits.forEach((commit) => {
      if (this.shouldIgnoreCommit(commit.message)) {
        return;
      }

      const { title, emoji } = this.getCommitGroup(commit.message);
      const key = `${emoji}${title}`;

      if (!groups[key]) {
        groups[key] = { title, emoji, commits: [] };
      }

      groups[key].commits.push(commit.message);
    });

    return Object.values(groups);
  }

  private formatMarkdown(groups: CommitGroup[]): string {
    if (groups.length === 0) {
      return "📊 **Еженедельный отчет**\n\nНет коммитов за последние 7 дней.";
    }

    let markdown = "📊 **Еженедельный отчет**\n\n";

    groups.forEach((group) => {
      if (group.commits.length > 0) {
        markdown += `${group.emoji} **${group.title}**\n`;
        group.commits.forEach((commit) => {
          markdown += `- ${commit}\n`;
        });
        markdown += "\n";
      }
    });

    return markdown.trim();
  }

  async generateSummary(): Promise<void> {
    try {
      console.log("🔍 Получение коммитов за последние 7 дней...");

      const username = await this.getCurrentUser();
      if (!username) {
        console.error("❌ Не удалось получить имя пользователя Git");
        return;
      }

      console.log(`👤 Пользователь: ${username}`);

      const commits = await this.getCommitsForLastWeek(username);
      console.log(`📈 Найдено коммитов: ${commits.length}`);

      const groups = this.groupCommits(commits);
      const markdown = this.formatMarkdown(groups);

      console.log("\n" + markdown);
    } catch (error) {
      console.error("❌ Ошибка при генерации отчета:", error);
    }
  }
}

class InteractiveSummary {
  private repos: RepoConfig[] = [];
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async validateRepoPath(repoPath: string): Promise<boolean> {
    try {
      const gitPath = path.join(repoPath, ".git");
      return fs.existsSync(gitPath);
    } catch {
      return false;
    }
  }

  private async scanRepo(repoPath: string): Promise<SummaryResult | null> {
    try {
      const summary = new WeeklySummary(repoPath);
      const repoName = path.basename(repoPath);

      // Временно перехватываем вывод консоли
      const originalLog = console.log;
      let output = "";
      console.log = (...args: any[]) => {
        output += args.join(" ") + "\n";
      };

      await summary.generateSummary();

      // Восстанавливаем вывод
      console.log = originalLog;

      // Извлекаем только markdown часть - ищем от 📊 до конца или до следующего блока
      const markdownMatch = output.match(
        /📊 \*\*Еженедельный отчет\*\*[\s\S]*?(?=\n\n🔍|\n\n📁|\n\n✅|\n\n❌|$)/
      );
      const markdown = markdownMatch
        ? markdownMatch[0].trim()
        : "📊 **Еженедельный отчет**\n\nНет коммитов за последние 7 дней.";

      const hasCommits = !markdown.includes("Нет коммитов за последние 7 дней");

      return {
        repoName,
        content: markdown,
        hasCommits,
      };
    } catch (error) {
      console.error(`❌ Ошибка при сканировании репозитория: ${error}`);
      return null;
    }
  }

  private async addRepo(): Promise<void> {
    console.log("\n📁 Введите путь к репозиторию:");
    console.log("   Пример: /Users/username/Desktop/my-project");
    console.log("   Или нажмите Enter для пропуска\n");

    const repoPath = await this.question("Путь к репозиторию: ");

    if (!repoPath) {
      console.log("⏭️  Пропускаем добавление репозитория");
      return;
    }

    // Проверяем существование репозитория
    if (!(await this.validateRepoPath(repoPath))) {
      console.log("❌ Ошибка: Указанный путь не является Git репозиторием");
      console.log("   Убедитесь, что папка содержит файл .git");
      return;
    }

    const repoName = path.basename(repoPath);

    // Проверяем, не добавлен ли уже этот репозиторий
    if (this.repos.some((repo) => repo.path === repoPath)) {
      console.log(`⚠️  Репозиторий ${repoName} уже добавлен`);
      return;
    }

    console.log(`\n🔍 Сканирование репозитория: ${repoName}`);

    const result = await this.scanRepo(repoPath);
    if (result) {
      this.repos.push({ name: repoName, path: repoPath });
      console.log(`✅ Репозиторий добавлен: ${repoName}`);

      if (result.hasCommits) {
        console.log(`📊 Найдено коммитов за неделю`);
      } else {
        console.log(`📊 Коммитов за неделю не найдено`);
      }
    }
  }

  private async generateFinalReport(): Promise<void> {
    if (this.repos.length === 0) {
      console.log("\n❌ Не добавлено ни одного репозитория");
      return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 ФИНАЛЬНЫЙ ЕЖЕНЕДЕЛЬНЫЙ ОТЧЕТ");
    console.log("=".repeat(60));

    let allContent = "";
    let totalReposWithCommits = 0;

    for (const repo of this.repos) {
      console.log(`\n📁 Репозиторий: ${repo.name}`);
      console.log(`📍 Путь: ${repo.path}`);

      const result = await this.scanRepo(repo.path);
      if (result) {
        console.log(result.content);
        allContent += `\n## 📁 ${repo.name}\n\n${result.content}\n`;

        if (result.hasCommits) {
          totalReposWithCommits++;
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`📈 ИТОГО:`);
    console.log(`   • Обработано репозиториев: ${this.repos.length}`);
    console.log(`   • Репозиториев с коммитами: ${totalReposWithCommits}`);
    console.log("=".repeat(60));

    // Автоматически сохраняем отчет
    const filename = `weekly-report-${
      new Date().toISOString().split("T")[0]
    }.md`;
    const filepath = path.resolve(filename);

    const fullReport = `# 📊 Еженедельный отчет\n\n**Дата:** ${new Date().toLocaleDateString()}\n**Пользователь:** ${
      process.env.USER || "Unknown"
    }\n\n${allContent}`;

    fs.writeFileSync(filepath, fullReport, "utf8");
    console.log(`\n💾 Отчет сохранен в файл: ${filepath}`);

    console.log("\n✅ Отчет завершен!");
  }

  async start(): Promise<void> {
    console.log("🚀 Interactive Weekly Summary Generator");
    console.log("=".repeat(50));
    console.log("Эта программа поможет создать еженедельный отчет");
    console.log("по вашим Git репозиториям.\n");

    let continueAdding = true;

    while (continueAdding) {
      await this.addRepo();

      // Спрашиваем путь к следующему репозиторию
      console.log("\n📁 Введите путь к следующему репозиторию:");
      console.log("   Или нажмите Enter для завершения\n");

      const nextRepoPath = await this.question("Путь к репозиторию: ");

      if (!nextRepoPath) {
        console.log("⏭️  Завершаем добавление репозиториев");
        continueAdding = false;
      } else {
        // Проверяем существование репозитория
        if (!(await this.validateRepoPath(nextRepoPath))) {
          console.log("❌ Ошибка: Указанный путь не является Git репозиторием");
          console.log("   Убедитесь, что папка содержит файл .git");
          console.log("⏭️  Завершаем добавление репозиториев");
          continueAdding = false;
        } else {
          const repoName = path.basename(nextRepoPath);

          // Проверяем, не добавлен ли уже этот репозиторий
          if (this.repos.some((repo) => repo.path === nextRepoPath)) {
            console.log(`⚠️  Репозиторий ${repoName} уже добавлен`);
            console.log("⏭️  Завершаем добавление репозиториев");
            continueAdding = false;
          } else {
            console.log(`\n🔍 Сканирование репозитория: ${repoName}`);

            const result = await this.scanRepo(nextRepoPath);
            if (result) {
              this.repos.push({ name: repoName, path: nextRepoPath });
              console.log(`✅ Репозиторий добавлен: ${repoName}`);

              if (result.hasCommits) {
                console.log(`📊 Найдено коммитов за неделю`);
              } else {
                console.log(`📊 Коммитов за неделю не найдено`);
              }
            }
          }
        }
      }
    }

    await this.generateFinalReport();
    this.rl.close();
  }
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
  const interactive = new InteractiveSummary();
  interactive.start().catch(console.error);
}

export { InteractiveSummary };
