# MCP (Model Context Protocol) Setup Guide

## Supabase MCP Server Configuration

The MCP configuration allows Kiro to directly interact with your Supabase PostgreSQL database.

### Setup Steps

1. **Get your Supabase connection string:**
   - Go to your Supabase project dashboard
   - Navigate to: Settings → Database → Connection String → URI
   - Copy the connection string (it looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

2. **Update the MCP configuration:**
   - Open `.kiro/settings/mcp.json`
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Replace `[YOUR-PROJECT-REF]` with your Supabase project reference
   
   Example:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-postgres",
           "postgresql://postgres:your_password@db.wxeekxgdxxokuhdhvivj.supabase.co:5432/postgres"
         ],
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

3. **Restart or reconnect MCP:**
   - The MCP server will automatically reconnect when you save the config
   - Or use Command Palette → "MCP: Reconnect Servers"

### What This Enables

With MCP connected to Supabase, Kiro can:
- Query your database directly
- Execute SQL commands
- Inspect table schemas
- Manage data
- Debug database issues

### Security Notes

- Never commit your actual database password to version control
- The `.kiro/settings/mcp.json` file should be in `.gitignore`
- Use environment variables for sensitive data in production

### Troubleshooting

If the connection fails:
1. Verify your database password is correct
2. Check that your Supabase project is active
3. Ensure your IP is allowed in Supabase (Settings → Database → Connection Pooling)
4. Check the MCP Server view in Kiro for error messages
