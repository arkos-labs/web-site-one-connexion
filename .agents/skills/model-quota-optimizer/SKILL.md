---
name: model-quota-optimizer
description: Strategic guidelines to minimize token consumption and respect model quotas while maintaining high performance across various LLMs.
---

# Model Quota Optimizer Skill

This skill provides a strict protocol for the AI assistant to minimize token usage (both input and output) and preserve user quotas across various models including Gemini, Claude, and GPT.

## 1. Model Tiering & Routing Logic
Always use the most cost-effective model suitable for the complexity of the task.

| Task Complexity | Recommended Model | Strategy |
| :--- | :--- | :--- |
| **Simple** (File listing, grep, basic explanation, doc reading) | `Gemini 1.5 Flash` | Maximize speed and minimal token cost. |
| **Standard** (Feature implementation, refactoring, UI work) | `Gemini 1.5 Pro (Low)` | Balanced reasoning and cost. |
| **Advanced** (Deep refactoring, complex logic, debugging) | `Gemini 1.5 Pro (High)` | Higher reasoning depth. |
| **Highly Complex** (Architecture, Security, Root Cause Analysis) | `Claude Sonnet 3.7/4.x Thinking`, `GPT-o3-mini` | Use "Thinking" budget ONLY when standard models fail or for critical logic. |

## 2. Input Token Optimization (Context Management)
- **Targeted Reading**: Use `view_file` with `StartLine` and `EndLine` parameters instead of reading entire 1000+ line files.
- **Incremental Discovery**: Use `list_dir` and `grep_search` to find specific code blocks before reading them.
- **Summary Usage**: Prioritize reading existing Knowledge Items (KIs) over re-analyzing the entire codebase.

## 3. Output Token Optimization (Conciseness)
- **Diff-Only Responses**: When modifying code, never output the entire file. Use the `replace_file_content` or `multi_replace_file_content` tools and only explain the specific changes.
- **No Verbosity**: Avoid generic introductory phrases ("I understand your request...", "Sure, I can help with that...") and excessive conclusions.
- **Code Summarization**: If the user asks for an explanation, use high-level descriptions with small code snippets instead of full implementations.

## 4. Thinking Budget Management
For models with reasoning capabilities (e.g., Claude Thinking, GPT-o3):
- **Set Thresholds**: For minor changes, internal thought process should be minimal (< 500 tokens).
- **Explicit Instruction**: If a task is a known pattern, skip deep reasoning and move straight to the solution.

## 5. Decision Tree for Tool Calls
1. Can I solve this by reading a 20-line snippet instead of 200 lines? -> **Yes**: Use line ranges.
2. Is this model overkill? -> **Yes**: Suggest switching or use the lightest available.
3. Have I already read this information? -> **Yes**: Check conversation history/KIs instead of calling the tool again.
