# 🛠️ Skills Collection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/skills.svg?style=social)](https://github.com/yourusername/skills/stargazers)

个人 Skills 集合，用于存放各类可复用的技能/脚本/工具。每个 Skill 都是一个独立的文件夹，包含完整的文档和工具。

## 📁 目录结构

```
skills/
├── README.md                    # 本文件 - skills 总览
├── LICENSE                      # MIT 许可证
├── .gitignore                   # Git 忽略文件
├── update-readme.sh             # 自动更新 README 的脚本
└── <skill-name>/                # 每个 skill 一个文件夹
    ├── README.md                # Skill 详细文档
    ├── SKILL.md                 # Skill 核心内容
    └── tools/                   # 工具脚本（可选）
        └── ...
```

## 🎯 Skills 列表

<!-- SKILLS_LIST_START -->
| Skill | 描述 | 适用场景 |
|-------|------|----------|
| [api-contract-skill](./api-contract-skill) | 前后端接口契约工具链 — 模块化组织、统一规范、分级文档。 | |
| [de-ai-novel-skill](./de-ai-novel-skill) | 将 AI 生成的小说文本洗掉机器话术、逻辑断层、模板感、流水账，使其读起来像真人写的。 | |
| [java-project-standard-skill](./java-project-standard-skill) | Java 后端项目工程规范 Skill，用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。基于阿里巴巴 Java 开发手册、RuoYi、JeecgBoot、Pig、EL-ADMIN 等大型商用 Java 项目的最佳实践总结而成。 | |
| [nodejs-project-standard-skill](./nodejs-project-standard-skill) | Node.js 后端项目工程规范 Skill（基于 NestJS 框架），用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。基于 NestJS 官方示例、nestjs-realworld-example-app、awesome-nest-boilerplate、Midway.js 等大型商用 Node.js 项目的最佳实践总结而成。 | |
| [novel-master-skill](./novel-master-skill) | 基于《我真没想重生呀》（1069章，200万字）深度分析提炼的写作技巧大全。 | |
| [react-native-project-standard-skill](./react-native-project-standard-skill) | React Native 移动端项目工程规范 Skill，用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。 | |
| [vue-project-standard-skill](./vue-project-standard-skill) | Vue 3 前端项目工程规范 Skill，用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。 | |
<!-- SKILLS_LIST_END -->

## 🚀 快速开始

### 使用 Skill

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/skills.git
   ```

2. 进入感兴趣的 Skill 目录
   ```bash
   cd skills/java-project-standard-skill
   ```

3. 阅读 README.md 了解使用方法

### 添加新 Skill

1. 创建新的 Skill 文件夹
   ```bash
   mkdir my-new-skill
   ```

2. 添加必要的文件
   ```bash
   cd my-new-skill
   touch README.md SKILL.md
   ```

3. 运行更新脚本
   ```bash
   cd ..
   bash update-readme.sh
   ```

4. 提交更改
   ```bash
   git add .
   git commit -m "feat: add my-new-skill"
   git push
   ```

## 📝 贡献指南

欢迎贡献新的 Skill！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的 Skill 分支 (`git checkout -b feature/amazing-skill`)
3. 提交你的更改 (`git commit -m 'feat: add amazing-skill'`)
4. 推送到分支 (`git push origin feature/amazing-skill`)
5. 打开一个 Pull Request

### Skill 规范

- 每个 Skill 必须包含 `README.md` 和 `SKILL.md`
- `README.md` 应包含：简介、使用方法、示例
- `SKILL.md` 应包含：核心内容、详细说明
- 文件夹名称以 `-skill` 结尾
- 工具脚本放在 `tools/` 目录下（可选）

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有贡献者！

---

**最后更新**: 2026-06-08
