# Prompt Engineering Cheat Sheet

## 🏷️ Model Tags & Syntaxes

| Model | Primary Delimiter | Key Technique | Special Feature |
| :--- | :--- | :--- | :--- |
| **Claude** | XML Tags (`<tag>`) | Thinking Tags | Prefilling (`{ "id":`) |
| **Gemini** | Markdown Headers | Direct Imperatives | Few-Shot (Examples) |
| **ChatGPT** | Triple Quotes (`"""`) | Instruction-First | System Role Anchoring |

## 🧠 Brain-Boosting Phrases
*Add these to your prompts for better logic:*

- **Step-by-Step**: "Let's think step-by-step to ensure we haven't missed any edge cases."
- **Self-Correction**: "Review your own output for potential errors before finalizing."
- **Alternative Perspectives**: "Analyze this problem from both a security and a performance standpoint."
- **Constraint Enforcement**: "Crucially, do NOT use [Library/Method]."

## 📐 Layout Structures

### The "Chain of Thought" Block
```text
1. Problem Statement
2. Thinking/Reasoning Phase
3. Implementation Plan
4. Code Execution
5. Verification
```

### The "Persona" Anchor
```text
Role: [Senior Architect]
Context: [Legacy PHP Migration]
Goal: [Implement Repository Pattern]
Constraint: [No external dependencies]
```

## 🚨 Anti-Patterns (Avoid!)
- **"Do you know...?"**: Don't ask if it knows, just tell it to do.
- **Vague Length**: "Make it short" -> "Limit to 50 words."
- **Double Negatives**: "Don't avoid using..." -> "Always use..."
- **Aggressive Tips (New Claude)**: Avoid "I will tip you $200" in Claude 4.5+ as it triggers over-engineering.
