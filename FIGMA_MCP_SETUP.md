# Figma Context MCP Server Setup

## Installation Summary

The Figma Context MCP server has been successfully configured for use with Cline (Claude Dev).

### Configuration Details

**Server Name:** `github.com/GLips/Figma-Context-MCP`  
**Package:** `figma-developer-mcp`  
**Node Version Required:** v18 or higher (configured to use v18.19.1)  
**Configuration File:** `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Configuration Applied

```json
{
  "mcpServers": {
    "github.com/GLips/Figma-Context-MCP": {
      "command": "bash",
      "args": ["-c", "source ~/.nvm/nvm.sh && nvm use 18.19.1 > /dev/null 2>&1 && npx -y figma-developer-mcp --figma-api-key=figd_4f4Jt4yw43_6YnSPH2aKC2baUDYj8DYTvTO3Hc91 --stdio"]
    }
  }
}
```

### Why Node v18+?

The `figma-developer-mcp` package requires Node.js v18 or higher because it uses modern JavaScript features like the global `Request` API. Your system was using Node v16.14.1 by default, so the configuration explicitly switches to Node v18.19.1 using nvm.

## How to Use

### Step 1: Restart VS Code

After the configuration has been saved, you need to **restart VS Code** or **reload the Cline extension** for the MCP server to become active.

### Step 2: Using the Server

Once activated, you can use the Figma MCP server in your conversations with Cline:

1. **Open Cline's chat** (Agent mode in Cursor/VS Code)
2. **Paste a Figma link** - can be a file, frame, or group URL
3. **Ask Cline to do something** with the design, such as:
   - "Implement this Figma design"
   - "Create a React component from this Figma frame"
   - "Analyze the layout from this Figma file"

### Example Usage

```
Here's my Figma design: https://www.figma.com/file/abc123/MyDesign

Please implement this design as a React component with Tailwind CSS.
```

Cline will automatically:
- Fetch the relevant metadata from Figma
- Analyze the design structure, layout, and styling
- Generate accurate code based on the design

## Available Tools

The Figma MCP server provides several tools that Cline can use:

- **get_figma_file** - Fetch complete Figma file data
- **get_figma_node** - Fetch specific node/frame data
- **download_figma_images** - Download images from Figma designs
- And more...

## Troubleshooting

### If the server doesn't work:

1. **Verify Node v18 is installed:**
   ```bash
   nvm list
   ```
   Should show v18.19.1 in the list

2. **Test the server manually:**
   ```bash
   bash -c "source ~/.nvm/nvm.sh && nvm use 18.19.1 && npx -y figma-developer-mcp --help"
   ```

3. **Check the configuration file:**
   ```bash
   cat ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   ```

4. **Restart VS Code** completely (not just reload window)

### Update Figma API Key

If you need to update your Figma API key later, edit the configuration file and replace the `--figma-api-key` value.

## Resources

- **GitHub Repository:** https://github.com/GLips/Figma-Context-MCP
- **Framelink Documentation:** https://www.framelink.ai/docs/quickstart
- **Demo Video:** https://youtu.be/6G9yb-LrEqg
- **Figma API Token Help:** https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens

## Next Steps

1. ✅ Configuration is complete
2. 🔄 Restart VS Code to activate the MCP server
3. 🎨 Try it out with a Figma design link!

---

**Note:** Keep your Figma API token secure. It provides access to all Figma files you have access to.
