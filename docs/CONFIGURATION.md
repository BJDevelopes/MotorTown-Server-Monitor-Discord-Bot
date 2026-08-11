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
- **Format:** Comma-separated
- **How to get User IDs:**
  1. Enable Developer Mode in Discord (Settings → Advanced)
  2. Right-click username → Copy User ID
- **Note:** This is the base list. Admins added later with `/addadmin` are stored separately in
  `admin_data.json` and merged in at startup, so they survive restarts.

### Optional Variables

#### `API_TIMEOUT`
- **Type:** Number (milliseconds)
- **Required:** No
- **Default:** `10000`
- **Description:** How long to wait for the game server to respond before giving up
- **Note:** Raise this if your server is on a slow or distant connection

#### `JOIN_SERVER_NAME`
- **Type:** String
- **Required:** No
- **Default:** Falls back to `SERVER_NAME`
- **Description:** The name players should search for in the in-game server list, shown by `/join`
- **Note:** If neither this nor `SERVER_NAME` is set, `/join` replies that it isn't configured

#### `JOIN_PASSWORD`
- **Type:** String
- **Required:** No
- **Default:** None
- **Description:** The password players need to enter the game server, shown by `/join`
- **Note:** Leave empty for a public server; the password step is then omitted from the instructions
- **⚠️ Never hardcode this in source.** Earlier versions of this bot shipped a real server password
  in `bot.js`; it now lives here so it stays out of git.

#### `JOIN_LINK`
- **Type:** String (URL)
- **Required:** No
- **Default:** None
- **Description:** Optional link shown in `/join`, e.g. your community site or Discord invite

#### `MONITOR_CHANNEL_ID`
- **Type:** String (Discord Channel ID)
- **Required:** No
- **Default:** None
- **Description:** Channel where the bot maintains its auto-updating status dashboard
- **Note:** The bot posts its own message on first run and then edits it in place. The message ID
  is saved to `monitor_data.json`, so no manual copying is needed.
- **Leave empty to:** Disable the server monitor

#### `MONITOR_INTERVAL`
- **Type:** Number (seconds)
- **Required:** No
- **Default:** `60`
- **Description:** How often the monitor dashboard refreshes
- **Note:** Each refresh makes two lightweight API calls. Values below 30 are not recommended.

#### `SERVER_NAME`
- **Type:** String
- **Required:** No
- **Default:** `Motor Town Server`
- **Description:** Title shown on the monitor dashboard, and the fallback for `JOIN_SERVER_NAME`

#### `LOGO_URL`
- **Type:** String (URL)
- **Required:** No
- **Default:** None
- **Description:** Thumbnail image shown on the monitor dashboard

#### `PLAYER_FEED_CHANNEL_ID`
- **Type:** String (Discord Channel ID)
- **Required:** No
- **Default:** None
- **Description:** Channel where the bot posts when players join or leave the server
- **Note:** The Web API cannot read in-game chat, so this is the closest available live feed.
  The bot stays quiet while the server is unreachable (rather than reporting everyone as having
  left) and doesn't announce the existing roster after a restart.
- **Leave empty to:** Disable the join/leave feed

#### `PLAYER_FEED_INTERVAL`
- **Type:** Number (seconds)
- **Required:** No
- **Default:** `60`
- **Description:** How often the player list is polled for the join/leave feed
- **Note:** Lower values give a more responsive feed at the cost of more API traffic

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
- **Note:** Reserved. The Motor Town Web API still has no endpoint for reading in-game chat, so
  this does nothing yet. For a live activity feed, use `PLAYER_FEED_CHANNEL_ID` instead.
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
API_HOST=127.0.0.1
API_PORT=8080
API_PASSWORD=MySecurePassword123
API_TIMEOUT=10000

# Bot Admins
ADMIN_USER_IDS=120343643381956608,987654321098765432,456789012345678901

# Join instructions
JOIN_SERVER_NAME=Bjs Town
JOIN_PASSWORD=your_server_password
JOIN_LINK=https://discord.gg/example

# Player Mapping (using Discord User IDs)
PLAYER_MAPPING=12345:120343643381956608|67890:987654321098765432|11111:Bob

# Server monitor dashboard
MONITOR_CHANNEL_ID=1234567890123456789
MONITOR_INTERVAL=60
SERVER_NAME=Bjs Town
LOGO_URL=https://i.imgur.com/example.png

# Player join/leave feed
PLAYER_FEED_CHANNEL_ID=1234567890123456789
PLAYER_FEED_INTERVAL=60
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
3. The bot must be able to reach the server IP and port from its location
4. **Do not forward this port to the public internet** — see Security Best Practices below

Newer dedicated server builds also support `HostWebAPIDisabledCommands`, which lets you switch
off individual Web API commands you don't intend to use.

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

⚠️ **The Motor Town Web API has no encryption.** The password is sent as a plain query parameter
over plain HTTP on every request, so anyone who can observe the traffic can read it and then issue
their own kick, ban, and announce commands against your server.

- **Best:** run the bot on the same machine as the dedicated server and set `API_HOST=127.0.0.1`
- **Good:** keep the bot and server on the same LAN or a private VPN
- **Never:** forward the Web API port on your router or expose it to the internet
- If you must expose it, put an HTTPS reverse proxy in front and restrict access by IP
- Use `HostWebAPIDisabledCommands` on newer server builds to disable API commands you don't need

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

### Error: "Invalid password" / "Password incorrect"
**Problem:** `API_PASSWORD` doesn't match server
**Solution:** Verify password in both `.env` and `DedicatedServerConfig.json`

**If this only happens on `/announce`, `/serverchat`, `/kick`, `/ban` or `/unban`** while read-only
commands like `/status` work fine, you are running a version before 2.0.0. That was a bot bug —
POST parameters were sent in the request body, but the Motor Town API only reads them from the
query string, so the server saw no password. Update the bot.

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
- `/addadmin` - Add an admin; saved to `admin_data.json` and kept across restarts
- `/removeadmin` - Remove an admin; permanent unless they are listed in `ADMIN_USER_IDS`,
  in which case you must also remove them from `.env`

### Changes Requiring Restart
- Editing `.env` file
- Changing any environment variables

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