# Claude Instructions for panioukin-portfolio

## Skills

Three custom skills live in `/skills/`. Suggest them proactively when the situation matches.

### taste-skill (`skills/taste-skill.md`)
**Trigger when:** building any new UI — a page, section, component, or visual element from scratch.
Examples: "add a projects section", "build a hero", "create a card component", "design a contact page".
**Suggest:** "Want me to apply the `taste-skill` for premium, anti-generic UI output?"

### redesign-skill (`skills/redesign-skill.md`)
**Trigger when:** the user wants to improve, restyle, audit, or fix the look of existing code.
Examples: "this looks generic", "make it more premium", "improve the about page", "audit the design", "it feels boring".
**Suggest:** "Want me to run the `redesign-skill` audit to identify and fix weak points?"

### output-skill (`skills/output-skill.md`)
**Trigger when:** the task involves generating a large or complete file — multiple components, a full page rewrite, or any time the user says "full", "complete", "entire", "don't truncate", or "all of it".
**Suggest:** "Want me to apply `output-skill` to enforce no truncation and full code delivery?"

## Skill Loading

To load a skill, read its file and follow its instructions for the current task. Skills override default LLM behavior — treat their rules as hard constraints, not suggestions.
