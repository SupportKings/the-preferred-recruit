# Security & Environment Configuration

## Environment Variables
- Copy `.env.example` to `.env.local` and populate with actual values
- Never commit real credentials to git - use placeholders in example files
- Required environment variables:
  - `SUPABASE_ACCESS_TOKEN` - Get from https://supabase.com/dashboard/account/tokens
  - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## MCP Configuration Security
- The `.mcp.json` file uses environment variable substitution: `${SUPABASE_ACCESS_TOKEN}`
- Set `SUPABASE_ACCESS_TOKEN` in your shell environment before running Claude Code
- Example: `export SUPABASE_ACCESS_TOKEN=your_token_here`
- Never hardcode tokens directly in configuration files

## Git Security
- `.gitignore` excludes all `.env*` files except `.env.example`
- Always check that secrets are not committed before pushing
- Use `git log --oneline` to verify no sensitive data is in commit history

## MCP (Model Context Protocol)

MCP provides direct database access through Supabase integration for Claude Code:

### Configuration
- Configured in `.mcp.json` for AI-assisted development
- Provides Supabase integration for database operations
- Uses environment variable substitution: `${SUPABASE_ACCESS_TOKEN}`
- Enables real-time database queries without code execution

### Setup
1. Get access token from: https://supabase.com/dashboard/account/tokens
2. Set in environment before running Claude Code:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   ```
3. The token is automatically loaded by Claude Code from `.mcp.json`

### Available MCP Tools

#### Database Query Tools
- `mcp__supabase__execute_sql` - Run any SQL query
- `mcp__supabase__list_tables` - List all database tables
- `mcp__supabase__select` - Query data from specific tables

#### When to Use MCP
Use MCP tools when:
- User asks about database structure
- Need to verify what tables exist
- Checking actual data in tables
- Understanding relationships between tables
- Debugging database issues

#### Example Usage Flow
```
1. User: "What tables are in the database?"
   → Use: mcp__supabase__list_tables

2. User: "Show me the user table structure"
   → Use: mcp__supabase__execute_sql with "SELECT * FROM users LIMIT 1"

3. User: "How many clients do we have?"
   → Use: mcp__supabase__select on clients table
```

### Security Notes
- Never expose the access token in code
- Token should only be in environment variables
- MCP queries are read-only by default
- Always verify data before suggesting schema changes

## Git Commit Messages

When asked to create a git commit message:
- ALWAYS check the entire branch using `git status` and `git diff` to see all unstaged changes
- ALWAYS check `git log` to understand recent commits on the branch
- NEVER base commit messages only on the current chat session
- Include ALL changes that will be committed, not just discussed changes
- Review modified, added, and deleted files comprehensively
- Do NOT include the Claude Code attribution footer