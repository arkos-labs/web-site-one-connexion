# Prompt Templates for Developers

## 1. Code Review (Claude Optimized)
```text
<task>
Perform a rigorous code review on the provided snippet. Focus on security, performance, and readability.
</task>

<context>
Project: React Native delivery app.
Current Module: Driver assignment logic.
</context>

<code>
[PASTE CODE HERE]
</code>

<rules>
- Use <thinking> tags to analyze potential race conditions.
- Provide a <refactored_version> if the changes are significant.
- Maintain a professional, constructive tone.
</rules>
```

## 2. Refactoring (Gemini Optimized)
```text
### Objective
Refactor the following function to improve its cyclomatic complexity and adhere to SOLID principles.

### Context
This function handles multi-step order processing in a Node.js environment.

### Source Code
[PASTE CODE]

### Requirements
1. Separate the database logic from the business logic.
2. Add comprehensive JSDoc comments.
3. Use async/await throughout.

### Output Format
- Refactored Code
- List of changes made
- Explanation of why these changes improve the code
```

## 3. Unit Test Generation (ChatGPT Optimized)
```text
### Task ###
Generate comprehensive Jest unit tests for the following function.

### Function ###
[PASTE FUNCTION]

### Mocking Requirements ###
- Mock the 'supabase' client using 'jest.mock'.
- Ensure 100% branch coverage.

### Edge Cases to Cover ###
- Empty input.
- Database timeout.
- Unauthorized user access.

### Output ###
Produce a single file containing all test cases.
```
