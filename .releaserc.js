module.exports = {
  extends: "semantic-release-monorepo",
  branches: ["master", "chore/merge-embetty-repos"],
  repositoryUrl: "git@github.com:heiseonline/embetty.git",
  verifyConditions: ["@semantic-release/github"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
    ],
  ],
  fail: false,
  success: false,
};
