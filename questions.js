// Question bank for Claude Certified Architect – Foundations practice exam.
// Each question: { id, domain (1-5), scenario, question, options[4], correct (0-3), explanation }
// Grounded in the official Exam Guide's Knowledge/Skills task statements.

const DOMAINS = {
  1: "Agentic Architecture & Orchestration",
  2: "Tool Design & MCP Integration",
  3: "Claude Code Configuration & Workflows",
  4: "Prompt Engineering & Structured Output",
  5: "Context Management & Reliability",
};

// Official scored-content weightings — drives random exam proportions.
const WEIGHTS = { 1: 0.27, 2: 0.18, 3: 0.20, 4: 0.20, 5: 0.15 };

const QUESTIONS = [
  // ───────────────────────── Domain 1 ─────────────────────────
  {
    id: "d1-loop-termination",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question:
      "You are implementing the agentic loop for your support agent. A teammate proposes terminating the loop when the assistant's text response contains the phrase \"I have resolved your issue,\" and as a safety net, capping the loop at 5 iterations. What is the most reliable way to control loop termination?",
    options: [
      "Continue the loop while stop_reason is \"tool_use\" and terminate when stop_reason is \"end_turn\".",
      "Parse the assistant's natural-language output for completion phrases, keeping the 5-iteration cap as the primary stop.",
      "Set max_tokens low so the model is forced to stop, signalling the loop to end.",
      "Terminate as soon as any tool returns a successful result, since the task is then complete.",
    ],
    correct: 0,
    explanation:
      "The agentic loop is driven by stop_reason: keep executing tools and feeding results back while stop_reason is \"tool_use\", and stop when it is \"end_turn\". Parsing natural-language signals, using iteration caps as the primary stop, or checking assistant text content are explicit anti-patterns — they are unreliable proxies for whether the model is actually done.",
  },
  {
    id: "d1-subagent-context",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question:
      "Your coordinator spawns a synthesis subagent to combine findings from the web-search and document-analysis subagents. The synthesis output is consistently vague and ignores the earlier findings. What is the most likely cause?",
    options: [
      "The synthesis subagent did not automatically inherit the coordinator's conversation history, and the findings were never passed explicitly in its prompt.",
      "The synthesis subagent needs a larger max_tokens to access the shared memory of prior agents.",
      "Subagents share memory by default, so the findings were overwritten by a race condition.",
      "The coordinator should have used end_turn to flush context before spawning synthesis.",
    ],
    correct: 0,
    explanation:
      "Subagents operate with isolated context — they do NOT inherit the coordinator's conversation history or share memory between invocations. Complete findings (e.g., the web-search results and document analysis) must be included directly in the synthesis subagent's prompt. There is no shared memory to inherit or overwrite.",
  },
  {
    id: "d1-narrow-decomposition",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question:
      "Running your system on \"the impact of remote work on cities,\" every subagent completes successfully, but the final report only discusses housing markets — nothing on transit, retail, or office real estate. The coordinator's log shows it created three subtasks: \"remote work and home prices,\" \"remote work and rent,\" and \"remote work and mortgages.\" What is the root cause?",
    options: [
      "The coordinator's task decomposition was too narrow, producing subagent assignments that don't cover the relevant domains of the topic.",
      "The synthesis agent filtered out non-housing findings due to a relevance bug.",
      "The web-search subagent's queries were not comprehensive enough.",
      "The subagents shared context and converged on a single subtopic.",
    ],
    correct: 0,
    explanation:
      "The subagents executed their assigned tasks correctly — the failure is in what they were assigned. The coordinator decomposed a broad topic into three narrow housing subtopics, leaving transit, retail, and office real estate uncovered. This is the classic risk of overly narrow task decomposition by the coordinator. Blaming downstream agents misreads the log.",
  },
  {
    id: "d1-parallel-spawn",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question:
      "Your coordinator delegates to four independent subagents (search, analyze, two distinct subtopics). Sequential execution is too slow. How do you run them in parallel within the Agent SDK?",
    options: [
      "Emit multiple Task tool calls in a single coordinator response.",
      "Issue each Task call in a separate conversation turn and rely on the SDK to batch them.",
      "Set tool_choice to \"any\" so the model fires all tools at once.",
      "Increase max_tokens so all four tool calls fit in one completion.",
    ],
    correct: 0,
    explanation:
      "Parallel subagent execution is achieved by emitting multiple Task tool calls in a single coordinator response, rather than spreading them across separate turns. Separate turns serialize execution; tool_choice and max_tokens don't control parallelism.",
  },
  {
    id: "d1-chaining-vs-dynamic",
    domain: 1,
    scenario: "Developer Productivity with Claude",
    question:
      "You're designing two workflows: (1) a code review that always checks the same four aspects per file, and (2) \"add comprehensive tests to this legacy codebase,\" where the needed work depends on what you discover. How should you decompose each?",
    options: [
      "Use a fixed prompt-chaining pipeline for the predictable review, and dynamic adaptive decomposition for the open-ended testing task.",
      "Use dynamic adaptive decomposition for both, since it is the more flexible pattern.",
      "Use a fixed sequential pipeline for both to keep behavior deterministic.",
      "Use a single mega-prompt for each so the model decides everything in one pass.",
    ],
    correct: 0,
    explanation:
      "Match the decomposition pattern to the workflow: prompt chaining (fixed sequential steps) suits predictable, multi-aspect reviews, while dynamic decomposition — mapping structure, identifying high-impact areas, then building a plan that adapts as dependencies surface — suits open-ended investigation. Forcing one pattern on both wastes either flexibility or determinism.",
  },
  {
    id: "d1-session-fresh-vs-resume",
    domain: 1,
    scenario: "Developer Productivity with Claude",
    question:
      "An investigation session analyzed many files yesterday. Overnight, a large refactor changed most of those files. You want to continue today. What is the most reliable approach?",
    options: [
      "Start a new session seeded with a structured summary of the prior findings, since the cached tool results are now stale.",
      "Resume the old session with --resume; the prior tool results are still valid context.",
      "Fork the old session so both the stale and fresh branches stay available.",
      "Resume the old session and rely on the model to notice the files changed on its own.",
    ],
    correct: 0,
    explanation:
      "When prior tool results are stale (the files changed), starting a new session with an injected structured summary is more reliable than resuming with out-of-date cached results. Resumption is appropriate when prior context is mostly valid; here it isn't. The model won't reliably detect file changes unless told.",
  },
  {
    id: "d1-fork-session",
    domain: 1,
    scenario: "Developer Productivity with Claude",
    question:
      "After a shared baseline analysis of a module, you want to compare two refactoring strategies independently without one exploration polluting the other. Which mechanism fits best?",
    options: [
      "fork_session to create independent branches from the shared analysis baseline.",
      "--resume <session-name> to alternate between the two strategies in one session.",
      "Spawn two subagents with Task and let them share the parent context.",
      "Run /compact between the two strategies to reset context.",
    ],
    correct: 0,
    explanation:
      "fork_session creates independent branches from a shared baseline, ideal for exploring divergent approaches (e.g., comparing two refactoring strategies) without cross-contamination. Resuming a single session interleaves the explorations; subagents and /compact don't provide independent branches off a common baseline.",
  },

  // ───────────────────────── Domain 2 ─────────────────────────
  {
    id: "d2-tool-descriptions",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question:
      "Logs show the agent often calls get_customer when users ask about orders. Both get_customer (\"Retrieves customer information\") and lookup_order (\"Retrieves order details\") have minimal descriptions and accept similar identifiers. What is the most effective first step?",
    options: [
      "Expand each tool's description to include input formats, example queries, edge cases, and when to use it versus the similar tool.",
      "Add 5–8 few-shot examples to the system prompt showing order queries routing to lookup_order.",
      "Build a routing layer that parses each turn and pre-selects a tool from detected keywords.",
      "Consolidate both into a single lookup_entity tool that internally decides which backend to query.",
    ],
    correct: 0,
    explanation:
      "Tool descriptions are the primary mechanism LLMs use for tool selection; minimal descriptions leave the model unable to differentiate similar tools. Expanding the descriptions is the low-effort, high-leverage fix that targets the root cause. Few-shot adds token overhead without fixing the descriptions, a routing layer is over-engineered, and consolidation is a larger architectural change than a \"first step\" warrants.",
  },
  {
    id: "d2-structured-errors",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question:
      "Your MCP tools currently return a generic \"Operation failed\" string on any failure. The agent retries timeouts forever and also retries policy violations (like over-limit refunds) that will never succeed. What should the tools return instead?",
    options: [
      "Structured error metadata: an errorCategory (transient/validation/business/permission), an isRetryable boolean, and a human-readable description.",
      "A uniform \"Operation failed\" message but logged with a stack trace for debugging.",
      "An empty result set so the agent treats the failure as \"no data found.\"",
      "An HTTP 500 status code and nothing else, letting the SDK decide whether to retry.",
    ],
    correct: 0,
    explanation:
      "Uniform error responses prevent the agent from making appropriate recovery decisions. Returning structured metadata — errorCategory, isRetryable, and a clear description — lets the agent distinguish retryable transient failures from non-retryable business/permission errors and avoid wasted retries. Returning an empty result conflates failure with a valid empty result, another anti-pattern.",
  },
  {
    id: "d2-too-many-tools",
    domain: 2,
    scenario: "Multi-Agent Research System",
    question:
      "Each specialized subagent currently has access to all 18 tools in your system, and tool selection has become unreliable. The synthesis agent even attempts web searches. What is the best remedy?",
    options: [
      "Scope each subagent's tool set to the tools its role needs, adding limited cross-role tools only for specific high-frequency cases.",
      "Improve every tool description so the agents can distinguish all 18 reliably.",
      "Raise max_tokens so the model has room to reason over all 18 tools.",
      "Set tool_choice to \"any\" so the model is forced to pick a tool quickly.",
    ],
    correct: 0,
    explanation:
      "Giving an agent too many tools (18 instead of 4–5) degrades selection reliability by inflating decision complexity, and agents misuse tools outside their specialization. Restricting each subagent to role-relevant tools — with scoped cross-role tools only for high-frequency needs — is the fix. Better descriptions help but don't address the core problem of an overloaded tool set.",
  },
  {
    id: "d2-tool-choice-any",
    domain: 2,
    scenario: "Structured Data Extraction",
    question:
      "Your extraction service sometimes returns conversational prose instead of calling the extraction tool. You have multiple extraction schemas and don't know in advance which applies. How do you guarantee the model calls a tool?",
    options: [
      "Set tool_choice to \"any\", so the model must call a tool but can choose which.",
      "Set tool_choice to \"auto\", which lets the model decide whether a tool is needed.",
      "Force a single named tool with tool_choice {\"type\":\"tool\",\"name\":\"...\"} even though you don't know which schema applies.",
      "Lower max_tokens until the model has no room to produce prose.",
    ],
    correct: 0,
    explanation:
      "tool_choice \"any\" forces the model to call a tool while letting it pick which one — exactly right when multiple extraction schemas exist and the correct one is unknown. \"auto\" permits a text-only reply; forcing one named tool is wrong when you don't know which schema applies.",
  },
  {
    id: "d2-mcp-scope",
    domain: 2,
    scenario: "Developer Productivity with Claude",
    question:
      "Your team needs a shared GitHub MCP server available to everyone who clones the repo, authenticated with a token that must not be committed. You also want a personal experimental server only on your machine. How do you configure these?",
    options: [
      "Put the shared server in project-level .mcp.json using ${GITHUB_TOKEN} env-var expansion; put the personal server in user-level ~/.claude.json.",
      "Put both servers in ~/.claude.json so credentials stay off version control.",
      "Hard-code the token in .mcp.json and add the file to .gitignore.",
      "Put the shared server in ~/.claude.json and the personal one in .mcp.json.",
    ],
    correct: 0,
    explanation:
      "Project-level .mcp.json is for shared team tooling and supports environment-variable expansion (${GITHUB_TOKEN}) so secrets aren't committed. User-level ~/.claude.json is for personal/experimental servers. Hard-coding tokens is unsafe even with .gitignore, and the last option reverses the scopes.",
  },
  {
    id: "d2-mcp-resources",
    domain: 2,
    scenario: "Developer Productivity with Claude",
    question:
      "Your agent burns many exploratory tool calls just discovering what data exists (issue summaries, doc hierarchies, DB schemas) before doing real work. Which MCP feature reduces this overhead?",
    options: [
      "MCP resources, which expose content catalogs so the agent has visibility into available data without exploratory tool calls.",
      "More MCP tools, one per catalog, so the agent can query each individually.",
      "Setting tool_choice to \"any\" so the agent commits to action faster.",
      "A larger context window so all data can be loaded upfront.",
    ],
    correct: 0,
    explanation:
      "MCP resources expose content catalogs (issue summaries, documentation hierarchies, database schemas) to the agent, giving it visibility into available data and reducing exploratory tool calls. Adding more tools increases selection complexity rather than reducing exploration.",
  },
  {
    id: "d2-grep-vs-glob",
    domain: 2,
    scenario: "Developer Productivity with Claude",
    question:
      "You need to (a) find every file matching **/*.test.tsx and (b) find every caller of a function named processRefund. Which built-in tools fit each task?",
    options: [
      "Glob for the filename-pattern search; Grep for the content/symbol search.",
      "Grep for both, since it searches files anyway.",
      "Glob for both, since both involve matching patterns.",
      "Read every file and let the model find the matches.",
    ],
    correct: 0,
    explanation:
      "Glob matches file paths by name/extension patterns (e.g., **/*.test.tsx). Grep searches file contents for patterns like function names, error messages, or imports — the right tool for finding all callers of processRefund. Reading all files upfront is wasteful.",
  },
  {
    id: "d2-edit-fallback",
    domain: 2,
    scenario: "Code Generation with Claude Code",
    question:
      "An Edit operation keeps failing because the anchor text you're matching appears multiple times in the file and isn't unique. What is the recommended fallback?",
    options: [
      "Use Read to load the full file, then Write the modified contents back.",
      "Retry Edit repeatedly until one of the matches happens to take.",
      "Delete the file and recreate it from memory.",
      "Switch to Glob to locate a uniquely named copy of the file.",
    ],
    correct: 0,
    explanation:
      "When Edit fails due to non-unique text matches, the reliable fallback is Read + Write: load the full file contents, then write back the modified version. Retrying Edit on ambiguous text won't resolve the ambiguity.",
  },
  {
    id: "d2-empty-vs-failure",
    domain: 2,
    scenario: "Multi-Agent Research System",
    question:
      "A search subagent's query returns nothing. The coordinator needs to react correctly. Why does it matter whether the tool reports \"access failure\" versus \"valid empty result\"?",
    options: [
      "An access failure (e.g., timeout) may warrant a retry or alternative approach, while a valid empty result is a successful query with no matches and should not be retried.",
      "They are interchangeable; both mean the agent should stop and escalate to a human.",
      "Empty results should always be reported as failures so the coordinator retries.",
      "Access failures should be silently converted to empty results to keep the workflow running.",
    ],
    correct: 0,
    explanation:
      "Distinguishing access failures (needing a retry decision) from valid empty results (a successful query that simply found nothing) is essential for correct recovery. Conflating them — silently turning failures into empty results, or treating empty results as failures — causes either missed errors or wasted retries.",
  },

  // ───────────────────────── Domain 3 ─────────────────────────
  {
    id: "d3-config-hierarchy",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question:
      "A new team member reports that Claude isn't following the team's coding standards, even though those standards work for everyone else. You discover their standards are configured in ~/.claude/CLAUDE.md. Why is this the problem?",
    options: [
      "User-level instructions in ~/.claude/CLAUDE.md apply only to that user and aren't shared via version control, so the team standards should live in project-level configuration.",
      "User-level CLAUDE.md is ignored entirely; only the project root CLAUDE.md is ever read.",
      "~/.claude/CLAUDE.md is overridden by directory-level files, so it never takes effect.",
      "The new member needs to run /compact to load the user-level memory.",
    ],
    correct: 0,
    explanation:
      "User-level settings in ~/.claude/CLAUDE.md apply only to that individual and are not shared via version control. For team-wide standards, the instructions belong in project-level configuration (.claude/CLAUDE.md or root CLAUDE.md) so every teammate receives them. This is a classic configuration-hierarchy diagnosis.",
  },
  {
    id: "d3-context-fork-skill",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question:
      "You have a skill that performs a verbose whole-codebase analysis. Its lengthy output keeps cluttering the main conversation and crowding out context. Which frontmatter option helps?",
    options: [
      "context: fork, which runs the skill in an isolated sub-agent context so its output doesn't pollute the main conversation.",
      "allowed-tools, which limits which tools the skill can use.",
      "argument-hint, which prompts the developer for required parameters.",
      "There is no such option; verbose skills must be split into multiple smaller skills.",
    ],
    correct: 0,
    explanation:
      "The context: fork frontmatter option runs a skill in an isolated sub-agent context, preventing verbose or exploratory output from polluting the main conversation. allowed-tools restricts tool access and argument-hint prompts for parameters — neither addresses output pollution.",
  },
  {
    id: "d3-ci-print-flag",
    domain: 3,
    scenario: "Claude Code for Continuous Integration",
    question:
      "Your pipeline runs claude \"Analyze this pull request for security issues\" but the job hangs indefinitely, with logs showing Claude Code waiting for interactive input. What is the correct fix?",
    options: [
      "Add the -p (or --print) flag to run Claude Code in non-interactive mode.",
      "Set an environment variable CLAUDE_HEADLESS=true before running the command.",
      "Redirect stdin from /dev/null.",
      "Add a --batch flag to the command.",
    ],
    correct: 0,
    explanation:
      "The -p / --print flag is the documented way to run Claude Code non-interactively: it processes the prompt, prints the result to stdout, and exits without waiting for input — exactly what CI requires. The other options reference non-existent features or are brittle workarounds that don't address the command syntax.",
  },
  {
    id: "d3-output-format-json",
    domain: 3,
    scenario: "Claude Code for Continuous Integration",
    question:
      "Your CI step needs Claude Code's review findings as machine-parseable output that you can post as inline PR comments. Which flags produce schema-conformant structured output?",
    options: [
      "--output-format json combined with --json-schema.",
      "--print alone, then parse the prose with a regex.",
      "--verbose so the full reasoning is captured for parsing.",
      "--batch with custom_id correlation.",
    ],
    correct: 0,
    explanation:
      "--output-format json together with --json-schema produces machine-parseable, schema-conformant output suitable for automated posting as inline PR comments. Parsing prose with regex is unreliable, --verbose adds noise, and batch/custom_id relates to the Message Batches API, not CLI structured output.",
  },
  {
    id: "d3-self-review",
    domain: 3,
    scenario: "Claude Code for Continuous Integration",
    question:
      "After Claude generates a feature, you ask the same session to review its own code for bugs and it finds little. Why might an independent review instance be more effective?",
    options: [
      "A model retains its reasoning context from generation, making it less likely to question its own decisions; a fresh instance without that context catches subtler issues.",
      "A second instance has a larger context window, so it can hold more of the diff.",
      "Self-review is impossible; the API forbids reviewing prior assistant output.",
      "The original session has exhausted its tokens and can no longer reason.",
    ],
    correct: 0,
    explanation:
      "Self-review is limited because the model carries its generation reasoning into the review, biasing it toward its own decisions. An independent review instance, lacking that prior reasoning context, is more effective at catching subtle issues than self-review instructions or extended thinking. It's not about context size or token exhaustion.",
  },

  // ───────────────────────── Domain 4 ─────────────────────────
  {
    id: "d4-explicit-criteria",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question:
      "Your automated reviewer produces too many false positives on code comments. You've already tried adding \"be conservative\" and \"only report high-confidence findings\" to the prompt, with no improvement. What works better?",
    options: [
      "Replace vague instructions with explicit criteria, e.g., \"flag comments only when the claimed behavior contradicts the actual code behavior.\"",
      "Add \"do not produce false positives\" to the prompt for extra emphasis.",
      "Lower the model temperature so it is more conservative.",
      "Ask the model to rate its confidence and only emit findings above 90%.",
    ],
    correct: 0,
    explanation:
      "General instructions like \"be conservative\" or \"only high-confidence findings\" fail to improve precision. Specific, categorical criteria that define exactly which issues to report (claimed behavior contradicting actual behavior) outperform confidence-based filtering. Self-reported confidence is poorly calibrated, and temperature doesn't define what counts as a real issue.",
  },
  {
    id: "d4-few-shot-ambiguous",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "Detailed prose instructions still produce inconsistent handling of ambiguous extraction cases (informal measurements, varied document structures). What technique most improves consistency and generalization?",
    options: [
      "Add 2–4 targeted few-shot examples that show the reasoning for ambiguous cases and the desired output format.",
      "Repeat the instructions three times to reinforce them.",
      "Switch to tool_choice \"any\" so the model is forced to extract something.",
      "Remove the ambiguous documents from the input set.",
    ],
    correct: 0,
    explanation:
      "Few-shot examples are the most effective technique when detailed instructions alone yield inconsistent output. A handful of targeted examples demonstrating ambiguous-case handling and the desired format improve consistency and let the model generalize to novel patterns. Repetition and forcing tool calls don't teach judgment; dropping documents avoids rather than solves the problem.",
  },
  {
    id: "d4-tool-use-schema",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "You need guaranteed, schema-compliant JSON output from extraction with no syntax errors. What's the most reliable approach?",
    options: [
      "Define an extraction tool with a JSON schema and read the structured data from the tool_use response.",
      "Ask the model to \"respond only in valid JSON\" and parse the text reply.",
      "Post-process the text output with a JSON-repair library.",
      "Lower max_tokens so the model can't add prose around the JSON.",
    ],
    correct: 0,
    explanation:
      "Tool use with a JSON schema is the most reliable approach for guaranteed schema-compliant structured output, eliminating JSON syntax errors. Asking for \"valid JSON\" in prose, repairing output post-hoc, or trimming tokens are all less reliable workarounds.",
  },
  {
    id: "d4-semantic-errors",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "You enforce extraction with a strict JSON schema via tool use, yet you still see invoices where the line items don't sum to the stated total and values land in the wrong fields. What does this reveal?",
    options: [
      "Strict schemas eliminate syntax errors but not semantic errors; you need validation logic (e.g., comparing calculated_total to stated_total) on top of the schema.",
      "The schema isn't strict enough; add more required fields and it will be fixed.",
      "Tool use is the wrong approach; revert to prose JSON and validate manually.",
      "The model needs a larger context window to add the numbers correctly.",
    ],
    correct: 0,
    explanation:
      "Strict JSON schemas via tool use eliminate syntax errors but do not prevent semantic errors like line items that don't sum or values in the wrong fields. Catching these requires semantic validation — e.g., extracting calculated_total alongside stated_total to flag discrepancies — not just stricter schemas.",
  },
  {
    id: "d4-nullable-fields",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "Some source documents simply don't contain a field your schema marks as required, and the model fabricates plausible values to satisfy it. How should you design the schema?",
    options: [
      "Make fields optional/nullable when the source may not contain the information, so the model can return null instead of inventing values.",
      "Keep the field required but instruct the model to \"leave it blank if unknown.\"",
      "Add a retry loop that re-asks until the model produces a value.",
      "Set tool_choice to \"any\" so the model must fill every field.",
    ],
    correct: 0,
    explanation:
      "Designing schema fields as optional/nullable when source documents may lack the information prevents the model from fabricating values to satisfy required fields. A \"leave blank\" instruction is unreliable against a required field, and retrying won't conjure information that isn't in the source.",
  },
  {
    id: "d4-retry-feedback-limits",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "Your validation-retry loop appends the specific validation error to the prompt and re-asks. It fixes format mismatches well, but a subset of documents keeps failing because the required value isn't present in the document at all. What is the correct understanding?",
    options: [
      "Retries help with format/structural errors but are ineffective when the required information is simply absent from the source; those cases should route elsewhere (e.g., human review).",
      "More retry iterations will eventually surface the missing value.",
      "The validation error message is wrong; fix it and retries will succeed.",
      "Switching to a stricter schema will recover the missing values.",
    ],
    correct: 0,
    explanation:
      "Retry-with-error-feedback guides the model to correct format and structural errors, but it is ineffective when the required information is absent from the source document — no amount of retrying invents data that isn't there. Those cases need a different path, such as human review.",
  },
  {
    id: "d4-multi-pass-review",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question:
      "A PR modifies 14 files. Your single-pass review of all files together gives deep feedback on some files but superficial comments on others, misses obvious bugs, and even flags a pattern in one file while approving identical code elsewhere. How should you restructure?",
    options: [
      "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass for cross-file data flow.",
      "Require developers to split large PRs into 3–4 file submissions.",
      "Switch to a higher-tier model with a larger context window for one big pass.",
      "Run three independent passes on the full PR and only flag issues appearing in at least two.",
    ],
    correct: 0,
    explanation:
      "The contradictory, uneven feedback is attention dilution from reviewing too many files at once. Per-file passes ensure consistent depth for local issues, and a separate integration pass catches cross-file problems. Shifting the burden to developers doesn't improve the system, a bigger context window doesn't fix attention quality, and majority-voting would suppress real bugs caught only intermittently.",
  },
  {
    id: "d4-forced-tool-order",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "Your pipeline must always run extract_metadata before any enrichment tools, every time. How do you guarantee the metadata tool runs first?",
    options: [
      "Force it with tool_choice {\"type\":\"tool\",\"name\":\"extract_metadata\"} on the first turn, then process subsequent steps in follow-up turns.",
      "Set tool_choice to \"auto\" and hope the model picks extract_metadata first.",
      "List extract_metadata first in the tools array; the model always calls tools in order.",
      "Set tool_choice to \"any\" so a tool is always called first.",
    ],
    correct: 0,
    explanation:
      "Forcing a specific tool with tool_choice {\"type\":\"tool\",\"name\":\"extract_metadata\"} guarantees that tool is called first; you then handle enrichment in follow-up turns. \"auto\" and \"any\" don't guarantee which tool runs, and tool ordering in the array doesn't dictate call order.",
  },

  // ───────────────────────── Domain 5 ─────────────────────────
  {
    id: "d5-case-facts",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    question:
      "In long multi-issue support conversations, progressive summarization is condensing exact amounts, dates, and order numbers into vague phrases, and the agent later loses track of them. What's the best mitigation?",
    options: [
      "Extract transactional facts (amounts, dates, order numbers, statuses) into a persistent \"case facts\" block included in each prompt, outside the summarized history.",
      "Disable summarization entirely and always send the full raw history.",
      "Instruct the model in the system prompt to \"never forget important numbers.\"",
      "Lower max_tokens so the model is forced to keep responses focused.",
    ],
    correct: 0,
    explanation:
      "Progressive summarization risks condensing precise numerical values, dates, and expectations into vague summaries. Extracting transactional facts into a persistent case-facts block included in every prompt — kept outside the summarized history — preserves them reliably. Disabling summarization doesn't scale, and prompt pleading is unreliable.",
  },
  {
    id: "d5-lost-in-middle",
    domain: 5,
    scenario: "Multi-Agent Research System",
    question:
      "When the synthesis agent receives a large aggregated input, findings buried in the middle are frequently omitted from the final report, while the start and end are handled well. What mitigations target this?",
    options: [
      "Place key-findings summaries at the beginning and organize detailed results under explicit section headers to counter position effects.",
      "Sort the findings alphabetically so nothing is privileged by position.",
      "Truncate the middle of the input since the model ignores it anyway.",
      "Increase max_tokens so the middle content fits more comfortably.",
    ],
    correct: 0,
    explanation:
      "Models reliably process the beginning and end of long inputs but may omit middle content — the \"lost in the middle\" effect. Placing key findings up front and using explicit section headers mitigates position effects. Alphabetical sorting doesn't address position, truncation discards real data, and more tokens don't fix the attention pattern.",
  },
  {
    id: "d5-scratchpad",
    domain: 5,
    scenario: "Developer Productivity with Claude",
    question:
      "During an extended large-codebase exploration, the agent starts giving inconsistent answers and referencing \"typical patterns\" instead of the specific classes it found earlier. What technique counteracts this context degradation?",
    options: [
      "Have agents maintain scratchpad files recording key findings and reference them for subsequent questions.",
      "Restart the session from scratch each time answers drift.",
      "Increase max_tokens so the whole codebase stays in context.",
      "Ask the model to think harder about what it already knows.",
    ],
    correct: 0,
    explanation:
      "Context degradation in extended sessions causes models to reference generic \"typical patterns\" rather than specifics discovered earlier. Maintaining scratchpad files that persist key findings across context boundaries — and referencing them for later questions — counteracts this. Restarting loses progress; raising token limits doesn't prevent degradation.",
  },
  {
    id: "d5-confidence-calibration",
    domain: 5,
    scenario: "Structured Data Extraction",
    question:
      "You want to route only low-confidence extractions to scarce human reviewers. A teammate suggests just asking the model \"how confident are you (1–10)?\" and routing low scores. What's the more reliable design?",
    options: [
      "Have the model output field-level confidence scores, then calibrate review thresholds using a labeled validation set.",
      "Trust the model's raw 1–10 self-rating and route anything below 7.",
      "Route a fixed random 10% of all extractions regardless of confidence.",
      "Only review extractions the model explicitly refuses to produce.",
    ],
    correct: 0,
    explanation:
      "Raw self-reported confidence is poorly calibrated. The reliable approach is to output field-level confidence scores and calibrate review thresholds against a labeled validation set, then route low-confidence or ambiguous cases to human review. Fixed random sampling ignores confidence, and reviewing only refusals misses confidently-wrong extractions.",
  },
  {
    id: "d5-stratified-sampling",
    domain: 5,
    scenario: "Structured Data Extraction",
    question:
      "Your extraction system reports 97% aggregate accuracy, so the team wants to automate high-confidence extractions with no review. What's the risk and the right check before doing so?",
    options: [
      "Aggregate accuracy can mask poor performance on specific document types or fields; analyze accuracy by document type and field segment, and use stratified random sampling to measure error rates.",
      "97% is above any reasonable bar; automate immediately and monitor cost.",
      "Re-run the whole dataset twice and average the accuracy for a tighter number.",
      "Route everything to human review permanently to be safe.",
    ],
    correct: 0,
    explanation:
      "A high aggregate metric (97%) can hide poor performance on particular document types or fields. Before reducing human review you should validate accuracy by document type and field segment and use stratified random sampling to measure error rates and detect novel error patterns. Blindly automating or reviewing everything are opposite over-corrections.",
  },
  {
    id: "d5-provenance",
    domain: 5,
    scenario: "Multi-Agent Research System",
    question:
      "Your synthesis agent merges findings from several sources, but the final report drops which claim came from which source, making fact-checking impossible. How do you preserve provenance?",
    options: [
      "Require subagents to output structured claim-source mappings (source URLs, document names, excerpts) that the synthesis agent preserves and merges.",
      "Tell the synthesis agent in prose to \"remember the sources\" while summarizing.",
      "Add the source list once at the end of the report rather than per claim.",
      "Have each subagent return only a prose summary so synthesis is simpler.",
    ],
    correct: 0,
    explanation:
      "Source attribution is lost during summarization when claim-source mappings aren't preserved. Requiring subagents to output structured claim-source mappings (URLs, document names, relevant excerpts) that downstream synthesis preserves and merges keeps provenance intact. Prose reminders and a single end-of-report source list don't tie claims to sources.",
  },
  {
    id: "d5-honor-human-request",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    question:
      "A customer explicitly says \"I want to speak to a human now.\" The agent believes it can resolve the underlying issue itself. What is the correct behavior?",
    options: [
      "Honor the explicit request for a human immediately, without first attempting its own investigation.",
      "Attempt to resolve the issue first, and escalate only if the agent fails.",
      "Run sentiment analysis to decide whether the request is genuine before escalating.",
      "Ask the customer several diagnostic questions to determine complexity first.",
    ],
    correct: 0,
    explanation:
      "An explicit customer request for a human is an appropriate, immediate escalation trigger — it should be honored without first attempting investigation. Insisting on resolving first, gating on sentiment analysis, or interrogating the customer all ignore the explicit preference, a key escalation anti-pattern.",
  },

  // ───────── Gap-fill batch (added 2026-07-14, from Exam Guide v0.2) ─────────
  {
    id: "d5-crash-recovery-manifest",
    domain: 5,
    scenario: "Developer Productivity with Claude",
    question:
      "Your multi-agent codebase-exploration system runs for hours, and occasionally a subagent process dies mid-run, forcing the whole exploration to restart from scratch. You want the coordinator to resume without re-doing completed work. What is the most reliable design?",
    options: [
      "Have each agent export its state to a known location as it works, and have the coordinator load a manifest of those states on resume.",
      "Increase each subagent's max_tokens so it can hold all prior findings in context and never needs to restart.",
      "Rely on the coordinator's conversation history, since subagents automatically inherit it and can rebuild lost state.",
      "Catch the crash and silently continue with whatever partial results are already in memory.",
    ],
    correct: 0,
    explanation:
      "Structured state persistence for crash recovery means each agent exports its state to a known location, and the coordinator loads a manifest on resume and injects it into agent prompts. Larger max_tokens does not survive a process death; subagents do NOT inherit coordinator history; and silently continuing on partial in-memory results loses the completed work you are trying to recover.",
  },
  {
    id: "d3-claudemd-import",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question:
      "Your monorepo has several packages, each with distinct standards. Your root CLAUDE.md has grown huge because it inlines every package's conventions, and maintainers say it is hard to keep current. What keeps CLAUDE.md modular while still giving each package its relevant standards?",
    options: [
      "Use the @import syntax in CLAUDE.md to reference external standards files, importing only those relevant to each package.",
      "Duplicate the full CLAUDE.md into every package directory so each is self-contained.",
      "Move all standards into a single ~/.claude/CLAUDE.md so every teammate loads them automatically.",
      "Delete the shared standards and rely on Claude to infer conventions from surrounding code.",
    ],
    correct: 0,
    explanation:
      "The @import syntax lets CLAUDE.md reference external files, so you can selectively include only the standards relevant to each package and keep the file modular. Duplicating the whole file creates drift; a user-level ~/.claude/CLAUDE.md is not shared with teammates via version control and applies only to you; inferring from code is unreliable.",
  },
  {
    id: "d2-iserror-retryable",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question:
      "Your MCP tools currently return a generic \"Operation failed\" string for every failure, so the agent retries policy violations (wasting calls) and gives up on transient timeouts (that would have succeeded). What is the best fix?",
    options: [
      "Return structured error metadata: an errorCategory (transient/validation/business/permission), an isRetryable boolean, and a human-readable description.",
      "Set isError on every failure and let the agent retry all of them a fixed number of times.",
      "Raise a fatal exception on any failure so the coordinator terminates the workflow immediately.",
      "Return an empty successful result for failures so the agent can move on without retrying.",
    ],
    correct: 0,
    explanation:
      "Uniform error strings prevent the agent from choosing an appropriate recovery. Returning structured metadata — errorCategory, an isRetryable flag, and a readable description — lets the agent retry transient failures and stop retrying business/validation errors. Blindly retrying everything wastes calls on non-retryable errors; terminating the whole workflow and masking failures as empty successes are both anti-patterns.",
  },
  {
    id: "d1-posttooluse-normalize",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question:
      "Your agent consumes three MCP tools that each return dates differently: one uses Unix timestamps, one ISO 8601, one numeric status codes. The model keeps misreading these heterogeneous formats. What is the most reliable way to give it consistent data?",
    options: [
      "Implement a PostToolUse hook that intercepts each tool result and normalizes the formats before the model processes them.",
      "Add a sentence to the system prompt asking the model to convert all timestamps to ISO 8601 itself.",
      "Increase max_tokens so the model has room to reason about each format on the fly.",
      "Switch tool_choice to \"any\" so the model is forced to call a normalization tool.",
    ],
    correct: 0,
    explanation:
      "A PostToolUse hook intercepts tool results and transforms them (e.g., normalizing Unix/ISO/numeric formats) before the model sees them — a deterministic guarantee. Prompt instructions give only probabilistic compliance; more max_tokens does not fix format inconsistency; and tool_choice controls which tool is called, not how existing results are normalized.",
  },
  {
    id: "d4-detected-pattern-field",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question:
      "Developers dismiss many of your automated review findings as false positives, but you have no systematic way to see which code constructs trigger the bad findings. What should you add to the structured output to enable that analysis?",
    options: [
      "A detected_pattern field on each finding recording which code construct triggered it, so dismissals can be analyzed systematically.",
      "A free-text summary at the end of the review listing everything the model looked at.",
      "A confidence score from 1-10 on each finding so low-confidence ones can be hidden.",
      "A retry of the whole review with a stricter \"be conservative\" instruction.",
    ],
    correct: 0,
    explanation:
      "Adding a detected_pattern field to each structured finding lets you track which code constructs produce findings and systematically analyze the ones developers dismiss — the basis for a feedback loop. A prose summary is not analyzable; self-reported confidence is poorly calibrated and hiding findings does not reveal the pattern; and a vague \"be conservative\" retry does not improve precision the way explicit criteria do.",
  },
  {
    id: "d3-explore-subagent-context",
    domain: 3,
    scenario: "Developer Productivity with Claude",
    question:
      "During a long multi-phase task, your main agent's context fills with verbose file dumps from a discovery phase, and its later answers degrade. You want the discovery done without polluting the main conversation. What is the right tool?",
    options: [
      "Use the Explore subagent to isolate the verbose discovery and return only a concise summary to the main conversation.",
      "Raise the main agent's max_tokens so the file dumps fit alongside everything else.",
      "Run /compact after every file read to keep the transcript short.",
      "Disable plan mode so the agent stops exploring and starts editing sooner.",
    ],
    correct: 0,
    explanation:
      "The Explore subagent isolates verbose discovery output and returns summaries, preserving main-conversation context and preventing context-window exhaustion during multi-phase work. Larger max_tokens still lets noise crowd out signal; /compact after every read is heavy-handed and lossy; disabling plan mode does not address where the verbose output goes.",
  },
  {
    id: "d4-batch-sla-math",
    domain: 4,
    scenario: "Structured Data Extraction",
    question:
      "You must process nightly extraction batches on the Message Batches API (up to a 24-hour processing window) while guaranteeing results within a 30-hour SLA. How should you schedule submissions?",
    options: [
      "Submit on a fixed cadence no less frequent than every 6 hours, so the 24-hour processing window still fits inside the 30-hour SLA.",
      "Submit once per day; the 50% cost savings guarantees results well before 30 hours.",
      "Switch to the synchronous API, since the Batches API cannot meet any SLA.",
      "Submit everything in one large batch at the SLA deadline to minimize cost.",
    ],
    correct: 0,
    explanation:
      "With a 24-hour maximum processing window and a 30-hour SLA, submissions must start no more than 6 hours before their deadline (24 + 6 = 30), i.e. at least every 6 hours. The Batches API has no guaranteed latency SLA, so assuming it finishes \"well before\" 30 hours is unsafe; abandoning batch loses the 50% savings unnecessarily; and submitting at the deadline guarantees a breach.",
  },
  {
    id: "d1-parallel-task-calls",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question:
      "Your coordinator needs a web-search subagent and a document-analysis subagent to run at the same time to cut latency. How do you spawn them so they execute in parallel?",
    options: [
      "Emit multiple Task tool calls in a single coordinator response, and ensure allowedTools includes \"Task\".",
      "Emit one Task call per turn across separate coordinator responses so each finishes before the next starts.",
      "Set tool_choice to \"any\" so the model decides to parallelize on its own.",
      "Rely on subagents inheriting the coordinator's context so they can coordinate their own timing.",
    ],
    correct: 0,
    explanation:
      "Spawning parallel subagents means emitting multiple Task tool calls in a single response (not across separate turns); the coordinator's allowedTools must include \"Task\" to invoke subagents at all. Sequential per-turn calls are exactly the serial pattern you are trying to avoid; tool_choice does not parallelize; and subagents do not inherit coordinator context.",
  },
];
