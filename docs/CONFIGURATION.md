# Configuration Reference

Complete guide to all environment variables and configuration options.

## Environment Variables

### Required Variables

#### `DISCORD_TOKEN`
- **Type:** String
- **Required:** Yes
- **Description:** Your Discord bot token from the Discord Developer Portal
- **Example:** `MTIzNDU2Nzg5MDEyMzQ1Njc4.GhIjKl.MnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx`
- **How to get:**
  1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
  2. Select your application → Bot section
  3. Click "Reset Token" or "Copy" to get the token

#### `CLIENT_ID`
- **Type:** String (numeric)
- **Required:** Yes
- **Description:** Your Discord application's client ID
- **Example:** `1234567890123456789`
- **How to get:**
  1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
  2. Select your application → General Information
  3. Copy the "Application ID"

#### `API_HOST`
- **Type:** String (IP address or hostname)
- **Required:** Yes
- **Description:** IP address or hostname of your game server
- **Example:** `192.168.1.100` or `myserver.example.com`
- **Note:** Do not include `http://` or port numbers

#### `API_PASSWORD`
- **Type:** String
- **Required:** Yes
- **Description:** Password for your game server's Web API
- **Example:** `MySecurePassword123!`
- **Note:** Must match `HostWebAPIServerPassword` in your server config

#### `ADMIN_USER_IDS`
- **Type:** String (comma-separated Discord User IDs)
- **Required:** Yes
- **Description:** Discord User IDs of users who can execute admin commands
- **Example:** `120343643381956608,987654321098765432`
- **Default:** `120343643381956608`
- **Format:** Comma-separated, no spaces
- **How to get User IDs:**
  1. Enable Developer Mode in Discord (Settings → Advanced)
  2. Right-click username → Copy User ID

### Optional Variables

#### `API_PORT`
- **Type:** String (numeric)
- **Required:** No
- **Default:** `8080`
- **Description:** Port number for your game server's Web API
- **Example:** `8080`
- **Note:** Must match `HostWebAPIServerPort` in your server config

#### `BOT_NICKNAME`
- **Type:** String
- **Required:** No
- **Default:** None (uses bot's username)
- **Description:** Custom nickname for the bot in all Discord servers
- **Example:** `Server Monitor`, `Game Bot`, `Admin Helper`
- **Max Length:** 32 characters
- **Note:** Bot needs "Change Nickname" permission in servers
- **Leave empty to:** Use the bot's default username

#### `CHAT_CHANNEL_ID`
- **Type:** String (Discord Channel ID)
- **Required:** No
- **Default:** None
- **Description:** Discord channel ID where in-game chat messages will be mirrored
- **Example:** `1234567890123456789`
- **How to get:** Enable Developer Mode in Discord → Right-click channel → Copy Channel ID
- **Note:** Currently prepared for future API updates (Motortown API doesn't provide chat monitoring yet)
- **Leave empty to:** Disable chat mirroring feature

#### `PLAYER_MAPPING`
- **Type:** String (pipe-separated mappings)
- **Required:** No
- **Default:** None
- **Description:** Map server player unique_ids to friendly names or Discord User IDs
- **Format:** `unique_id:name|unique_id:name|unique_id:discordUserID`
- **Example with names:** `12345:Jerry|67890:Bob|11111:Alice`
- **Example with Discord IDs:** `12345:120343643381956608|67890:987654321098765432`
- **Example mixed:** `12345:120343643381956608|67890:Bob(Admin)`
- **Discord User IDs:** Use 17-19 digit Discord User IDs to automatically fetch Discord usernames
- **Nickname Priority:** When using Discord IDs, server nicknames are shown if available, otherwise Discord username
- **How to get Discord IDs:** Right-click user in Discord → Copy User ID
- **Usage:** Makes player identification easier in `/players` command
- **Display:** Names show as `Name (InGameName)`, Discord IDs show as `Nickname (InGameName)` or `Username#1234 (InGameName)`
- **Note:** Must restart bot after changes

## Example Configurations

### Minimal Configuration
```env
DISCORD_TOKEN=your_token_here
CLIENT_ID=1234567890123456789
API_HOST=192.168.1.100
API_PASSWORD=MyPassword123
ADMIN_USER_IDS=120343643381956608
```

### Full Configuration
```env
# Discord
DISCORD_TOKEN=your_token_here
CLIENT_ID=1234567890123456789
BOT_NICKNAME=Server Monitor

# Game Server API
API_HOST=192.168.1.100
API_PORT=8080
API_PASSWORD=MySecurePassword123

# Bot Admins
ADMIN_USER_IDS=120343643381956608,987654321098765432,456789012345678901

# Player Mapping (using Discord User IDs)
PLAYER_MAPPING=12345:120343643381956608|67890:987654321098765432|11111:Bob
```

### Multiple Admins
```env
ADMIN_USER_IDS=120343643381956608,987654321098765432,456789012345678901,111222333444555666
```

### Custom Port
```env
API_PORT=9090
```

### No Custom Nickname
```env
# Either leave BOT_NICKNAME empty:
BOT_NICKNAME=

# Or don't include it at all - both work the same
```

## Bot Permissions Required

When inviting the bot to your Discord server, ensure it has these permissions:

### Essential Permissions
- **Send Messages** - To respond to commands
- **Use Slash Commands** - To register and use slash commands
- **Embed Links** - To send formatted embed messages
- **Read Messages/View Channels** - To see commands

### Optional Permissions
- **Change Nickname** - Required if using `BOT_NICKNAME`
- **Read Message History** - Generally useful but not required

### Permission Value
- Recommended permission integer: `277025770496`
- This includes all essential permissions plus Change Nickname

## Game Server Configuration

Your `DedicatedServerConfig.json` must have these settings:

```json
{
  "bEnableHostWebAPIServer": true,
  "HostWebAPIServerPassword": "same_as_API_PASSWORD",
  "HostWebAPIServerPort": 8080
}
```

### Important Notes:
1. `HostWebAPIServerPassword` must match `API_PASSWORD` in `.env`
2. `HostWebAPIServerPort` must match `API_PORT` in `.env` (default: 8080)
3. The port must be open in your firewall
4. The bot must be able to reach the server IP from its location

## Security Best Practices

### 1. Keep .env Secret
```bash
# Never commit .env to git
# It's already in .gitignore
```

### 2. Use Strong Passwords
```env
# Good
API_PASSWORD=Tr0ng!P@ssw0rd#2024

# Bad
API_PASSWORD=password123
```

### 3. Limit Admin Access
```env
# Only add trusted users
ADMIN_USER_IDS=your_id,trusted_friend_id
```

### 4. Rotate Tokens Regularly
- Change your Discord bot token periodically
- Update your API password occasionally
- Update .env after changes

### 5. Secure Your Server
- Use firewall rules to limit API access
- Only open necessary ports
- Consider using a VPN for bot-to-server communication

## Validation Checklist

Before starting the bot, verify:

- [ ] `DISCORD_TOKEN` is valid and not expired
- [ ] `CLIENT_ID` matches your Discord application
- [ ] `API_HOST` is reachable from the bot's location
- [ ] `API_PORT` is open in firewall
- [ ] `API_PASSWORD` matches server configuration
- [ ] `ADMIN_USER_IDS` contains at least one valid Discord User ID
- [ ] `BOT_NICKNAME` is 32 characters or less (if used)
- [ ] No spaces in `ADMIN_USER_IDS` comma-separated list
- [ ] `.env` file is in the same directory as `bot.js`

## Testing Your Configuration

### 1. Test API Connection
```bash
# Replace with your values
curl "http://YOUR_API_HOST:YOUR_API_PORT/version?password=YOUR_API_PASSWORD"
```

Expected response:
```json
{
  "data": { "version": "0.7.13+CT4(B804)" },
  "message": "",
  "succeeded": true
}
```

### 2. Test Bot Login
```bash
npm start
```

Check console for:
- ✓ "Logged in as YourBot#1234!"
- ✓ "Connected to API: http://..."
- ✓ "Admin users loaded: X"
- ✓ "Successfully reloaded application (/) commands."

### 3. Test Bot Commands
In Discord:
- Try `/status` (should work for everyone)
- Try `/announce test` (should only work for admins)

## Common Configuration Errors

### Error: "Invalid token"
**Problem:** `DISCORD_TOKEN` is incorrect or expired
**Solution:** Get a new token from Discord Developer Portal

### Error: "ECONNREFUSED"
**Problem:** Can't connect to API server
**Solutions:**
- Check `API_HOST` and `API_PORT` are correct
- Verify server is running
- Check firewall settings
- Test with curl command above

### Error: "Password incorrect"
**Problem:** `API_PASSWORD` doesn't match server
**Solution:** Verify password in both `.env` and `DedicatedServerConfig.json`

### Warning: "Failed to set nickname"
**Problem:** Bot lacks "Change Nickname" permission
**Solutions:**
- Give bot the "Change Nickname" permission
- Move bot's role higher in the role list
- Or remove `BOT_NICKNAME` from `.env`

### Error: "Admin users loaded: 0"
**Problem:** `ADMIN_USER_IDS` is empty or incorrectly formatted
**Solutions:**
- Check for typos in User IDs
- Ensure no spaces in the comma-separated list
- Verify at least one ID is present

## Environment Variable Priority

The bot reads configuration in this order:

1. **Environment variables** (set in shell/system)
2. **.env file** (in project directory)
3. **Default values** (hardcoded)

If you set a variable in both places, the environment variable takes precedence over the .env file.

## Updating Configuration

### Runtime Changes (No Restart Required)
- `/addadmin` - Add temporary admin
- `/removeadmin` - Remove temporary admin

### Changes Requiring Restart
- Editing `.env` file
- Changing any environment variables
- Adding permanent admins

### How to Restart
```bash
# Stop the bot (Ctrl+C)
# Edit .env file
# Start again
npm start
```

## Advanced: Environment Variables vs .env

You can set these as actual environment variables instead of using .env:

```bash
# Linux/Mac
export DISCORD_TOKEN="your_token"
export API_HOST="192.168.1.100"
npm start

# Windows (Command Prompt)
set DISCORD_TOKEN=your_token
set API_HOST=192.168.1.100
npm start

# Windows (PowerShell)
$env:DISCORD_TOKEN="your_token"
$env:API_HOST="192.168.1.100"
npm start
```

This is useful for:
- Production deployments
- Docker containers
- Cloud hosting
- CI/CD pipelines