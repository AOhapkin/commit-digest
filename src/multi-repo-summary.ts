import { WeeklySummary } from "./weekly-summary";
import * as fs from "fs";
import * as path from "path";

interface RepoConfig {
  name: string;
  path: string;
}

class MultiRepoSummary {
  private repos: RepoConfig[];

  constructor() {
    this.repos = [];
  }

  addRepo(name: string, repoPath: string): void {
    this.repos.push({ name, path: repoPath });
  }

  async generateAllSummaries(saveToFile: boolean = false): Promise<void> {
    console.log("🚀 Multi-Repository Weekly Summary Generator");
    console.log("=".repeat(50));

    for (const repo of this.repos) {
      console.log(`\n📁 Обработка репозитория: ${repo.name}`);
      console.log(`📍 Путь: ${repo.path}`);

      try {
        const summary = new WeeklySummary(repo.path);
        await summary.generateSummary({
          saveToFile,
          outputPath: `weekly-report-${repo.name}-${
            new Date().toISOString().split("T")[0]
          }.md`,
        });
      } catch (error) {
        console.error(
          `❌ Ошибка при обработке репозитория ${repo.name}:`,
          error
        );
      }
    }

    console.log("\n✅ Обработка всех репозиториев завершена!");
  }
}

// Функция для автоматического поиска репозиториев
function findGitRepos(
  basePath: string = process.env.HOME || "/"
): RepoConfig[] {
  const repos: RepoConfig[] = [];

  try {
    const gitDirs = fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(basePath, dirent.name));

    for (const dir of gitDirs) {
      const gitPath = path.join(dir, ".git");
      if (fs.existsSync(gitPath)) {
        const repoName = path.basename(dir);
        repos.push({ name: repoName, path: dir });
      }
    }
  } catch (error) {
    console.error("Ошибка при поиске репозиториев:", error);
  }

  return repos;
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
  const args = process.argv.slice(2);
  const autoFind = args.includes("--auto") || args.includes("-a");
  const saveToFile = args.includes("--save") || args.includes("-s");

  const multiRepo = new MultiRepoSummary();

  if (autoFind) {
    console.log("🔍 Автоматический поиск репозиториев...");
    const foundRepos = findGitRepos();

    if (foundRepos.length === 0) {
      console.log("❌ Репозитории не найдены");
      process.exit(1);
    }

    console.log(`📁 Найдено репозиториев: ${foundRepos.length}`);
    foundRepos.forEach((repo) => {
      console.log(`  - ${repo.name}: ${repo.path}`);
      multiRepo.addRepo(repo.name, repo.path);
    });
  } else {
    // Ручное добавление репозиториев
    const repoArgs = args.filter((arg) => arg.startsWith("--repo="));

    if (repoArgs.length === 0) {
      console.log(
        "❌ Не указаны репозитории. Используйте --repo=path или --auto"
      );
      process.exit(1);
    }

    repoArgs.forEach((repoArg) => {
      const repoPath = repoArg.split("=")[1];
      const repoName = path.basename(repoPath);
      multiRepo.addRepo(repoName, repoPath);
    });
  }

  multiRepo.generateAllSummaries(saveToFile);
}

export { MultiRepoSummary, findGitRepos };
