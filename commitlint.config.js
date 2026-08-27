/**
 * Conventional Commits for Open Stay Pass.
 *
 * Enforced locally through the `commit-msg` git hook (see the
 * "simple-git-hooks" block in package.json) and again in CI, because local
 * hooks never apply to a contributor who clones the repository.
 *
 * Format:  type(optional-scope): subject
 * Example: feat(wallet): issue an Apple pass for issued CFDI handoffs
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // The set of types this repository accepts. Anything else is rejected so
    // the history stays greppable and release notes can be generated from it.
    "type-enum": [
      2,
      "always",
      [
        "feat", // a user-visible capability
        "fix", // a bug fix
        "security", // a change whose primary purpose is closing a weakness
        "docs", // documentation only
        "style", // formatting, no behaviour change
        "refactor", // behaviour-preserving restructuring
        "perf", // performance
        "test", // tests only
        "build", // build system, bundling, dependencies
        "ci", // CI configuration and workflows
        "chore", // housekeeping with no src or test change
        "revert", // reverts a previous commit
      ],
    ],
    // Subjects are lower-case, no trailing period, and short enough to read in
    // `git log --oneline`. The body is where detail belongs.
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    // Encourage an explanatory body without failing small, obvious commits.
    "body-max-line-length": [1, "always", 100],
  },
};
