import { simpleGit, SimpleGit } from "simple-git";
import * as fs from "fs";
import * as path from "path";

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

interface SummaryOptions {
  saveToFile?: boolean;
  outputPath?: string;
  repoPath?: string;
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

  private async saveToFile(
    content: string,
    outputPath?: string
  ): Promise<void> {
    try {
      const filename =
        outputPath ||
        `weekly-report-${new Date().toISOString().split("T")[0]}.md`;
      const filepath = path.resolve(filename);

      fs.writeFileSync(filepath, content, "utf8");
      console.log(`💾 Отчет сохранен в файл: ${filepath}`);
    } catch (error) {
      console.error("❌ Ошибка при сохранении файла:", error);
    }
  }

  async generateSummary(options: SummaryOptions = {}): Promise<void> {
    try {
      console.log("🔍 Получение коммитов за последние 7 дней...");

      const username = await this.getCurrentUser();
      if (!username) {
        console.error("❌ Не удалось получить имя пользователя Git");
        return;
      }

      console.log(`👤 Пользователь: ${username}`);
      if (options.repoPath) {
        console.log(`📁 Репозиторий: ${options.repoPath}`);
      }

      const commits = await this.getCommitsForLastWeek(username);
      console.log(`📈 Найдено коммитов: ${commits.length}`);

      const groups = this.groupCommits(commits);
      const markdown = this.formatMarkdown(groups);

      console.log("\n" + markdown);

      // Сохраняем в файл если нужно
      if (options.saveToFile) {
        await this.saveToFile(markdown, options.outputPath);
      }
    } catch (error) {
      console.error("❌ Ошибка при генерации отчета:", error);
    }
  }
}

// Экспорт для использования в других файлах
export { WeeklySummary };

// Запуск если файл выполняется напрямую
if (require.main === module) {
  const args = process.argv.slice(2);
  const repoPath = args.find((arg) => arg.startsWith("--repo="))?.split("=")[1];

  const summary = new WeeklySummary(repoPath);
  summary.generateSummary();
}
