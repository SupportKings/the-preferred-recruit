# Init Command Documentation

This document explains how to handle the `/init` command for two purposes:
1. Creating/updating CLAUDE.md documentation
2. Loading project context

## Part 1: Creating CLAUDE.md Documentation

When `/init` is used to analyze and document a codebase:

### Goals
- Create a concise CLAUDE.md (under 40k tokens) with critical information
- Move detailed content to `/docs/claude/` modules
- Ensure all commands are tested and working
- Document project-specific patterns

### Structure for CLAUDE.md

```markdown
# CLAUDE.md
[Header text]

## 🚨 CRITICAL - READ FIRST
[Most important warnings, requirements]

## Tech Stack
[Core technologies only]

## MCP Setup
[If applicable - MCP tools and usage]

## Essential Commands
[Frequently used commands only]

## Project Structure
[High-level overview]

## Key Architecture Rules
[1-3 critical patterns]

## Code Standards
[Critical standards only]

## Environment Variables
[Required variables]

## 📚 Documentation Modules
[Links to /docs/claude/ files]

## Working on This Project
[5-6 key points]

## Important Reminders
[Project-specific requirements]
```

### Creating Modular Documentation

Create focused files in `/docs/claude/`:
- **commands.md** - All commands with detailed usage
- **architecture.md** - System design, patterns
- **critical-thinking.md** - Logic and common sense rules
- **code-quality.md** - Standards and conventions
- **ui-ux-standards.md** - UI patterns
- **common-mistakes.md** - Frequent errors
- **troubleshooting.md** - Debug guide
- **deployment.md** - Production setup

### What NOT to Include
- Generic advice ("write clean code")
- Obvious practices ("don't commit secrets")
- Repetitive content
- Untested commands

### Testing Requirements
Before documenting commands:
1. Test each command
2. Note timeouts or failures
3. Provide working alternatives
4. Verify file paths

## Part 2: Loading Project Context

When users type `/init` in chat to load project context:

### 1. Load Documentation
Read in this order:
1. `CLAUDE.md` - Quick reference
2. `docs/claude/critical-thinking.md` - Thinking process
3. `docs/claude/commands.md` - Available commands
4. `docs/claude/architecture.md` - Project structure
5. Other relevant docs based on the task

### 2. Acknowledge Understanding
Confirm loading with:
- Project type (Bun monorepo with Next.js 15)
- Key technologies (Better Auth, Supabase, tRPC, Drizzle)
- MCP availability for database queries
- Readiness to help

### 3. Example Response
```
Initialized. I understand this is a Bun-based monorepo with:
- Next.js 15 + React 19 (web app)
- Better Auth with email OTP
- Supabase PostgreSQL + Drizzle ORM
- tRPC for type-safe APIs
- MCP tools available for database queries

Key rules loaded:
- Never run biome globally (will timeout)
- Use MainLayout in pages, not layouts
- Think critically before implementing
- Use MCP for database exploration

Ready to help. What would you like to work on?
```

### 4. Key Reminders
- Use MCP tools for database queries
- Run Biome on specific files only
- Follow critical thinking process
- Check established patterns
- Use proper TypeScript types

## Maintaining Documentation

When updating:
- Keep CLAUDE.md concise
- Update outdated commands
- Add new patterns discovered
- Test everything still works
- Ensure links are valid