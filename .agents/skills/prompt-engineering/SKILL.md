---
name: prompt-engineering
description: Master prompt engineering for ChatGPT, Gemini, and Claude. Contains advanced techniques like XML tagging, chain-of-thought, few-shot prompting, and model-specific optimizations.
---

# Prompt Engineering Skill

This skill provides comprehensive guidelines and templates for craftring high-performance prompts tailored for modern LLMs (ChatGPT, Gemini, Claude). Use these techniques to maximize accuracy, creativity, and structural integrity in model responses.

## 🚀 Core Principles (Universal)

1. **Clarity & Specificity**: Avoid vague instructions. Instead of "Fix this code," use "Identify the memory leak in this React useEffect hook and provide a optimized version using a cleanup function."
2. **Contextual Grounding**: Provide the 'Why' and 'Who'. (e.g., "You are a Senior DevOps Engineer. I am a junior developer. Explain Docker networking in simple terms.")
3. **Iterative Refinement**: Treat prompting as a conversation. Refine results by pointing out what was missed or what should be changed.
4. **Output Constraint**: Explicitly define the format (JSON, Markdown, CSV), tone (Professional, Concise, Witty), and length.

---

## 🤖 Model-Specific Strategies

### 🏺 Anthropic Claude (The XML Master)
Claude is highly optimized for **XML tags**. Always use them to structure your prompt.
- **Structure**: Wrap different sections in tags like `<context>`, `<instructions>`, `<rules>`, and `<output_format>`.
- **Chain of Thought**: Explicitly ask Claude to think: `Please think step-by-step inside <thinking> tags before providing your final answer.`
- **Prefilling**: You can pre-fill the start of Claude's response to guide the output: `Here is the JSON representation: { "id":`

### ♊ Google Gemini (The Logical Structure)
Gemini excels with clear delimiters and direct, logical flow.
- **Directness**: Gemini responds best to direct imperatives.
- **Structural Delimiters**: Use `---`, `###`, or Markdown headers to separate sections.
- **Few-Shot Prompting**: Provide 2-3 high-quality examples of the input-output pair you expect.

### 💬 OpenAI ChatGPT (The Instruction First)
- **Primary Instruction**: Place the main task at the very beginning or use a clear `### Task ###` header.
- **Negative Constraints**: Clearly state what NOT to do (e.g., "Do not use external libraries").
- **Delimiters**: Use `"""` or `'''` to wrap large blocks of text or code to be processed.

---

## 🛠 Advanced Techniques

### 1. Chain of Thought (CoT)
Force the model to reason before acting.
*Prompt Helper*: "Before giving the solution, outline the logic and potential edge cases you are considering."

### 2. Prompt Chaining
Break complex workflows into multiple prompts.
- **Step 1**: Extract data.
- **Step 2**: Analyze extracted data for sentiment.
- **Step 3**: Draft a reply based on sentiment.

### 3. Few-Shot Prompting
Show, don't just tell.
```text
Convert the following user requests into SQL queries:
Request: Get all users who joined in 2023.
SQL: SELECT * FROM users WHERE joined_at >= '2023-01-01';

Request: Find the top 5 most expensive products.
SQL: SELECT * FROM products ORDER BY price DESC LIMIT 5;

Request: [Your Request Here]
SQL:
```

---

## 📖 Reference Documentation
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering Library](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Google Gemini Prompting Best Practices](https://ai.google.dev/docs/prompt_best_practices)

## 📎 Resources
- `resources/templates.md`: Pre-built prompt templates for common coding tasks.
- `resources/cheat_sheet.md`: A quick-reference guide for model-specific tags and tokens.
