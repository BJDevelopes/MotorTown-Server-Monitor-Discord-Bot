# 🚀 Quick Start Guide

## Requirements

- **Node.js 18.0.0 or higher** — check with `node -v`. Node 16 is end-of-life and no longer
  supported; discord.js v14 requires 18+.
- A **Discord bot token** and application ID
- A **Motor Town dedicated server** with the Web API enabled

Dependencies installed by `npm install`:

| Package | Version |
|---------|---------|
| `discord.js` | ^14.27.0 |
| `axios` | ^1.19.0 |
| `dotenv` | ^17.4.2 |

## Setup in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Bot

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

> ⚠️ The file must be named **exactly `.env`** — not `.env.local`, not `.env.txt` — and it must
> sit in the **same folder as `bot.js`**. `dotenv` reads no other filename. On Windows, turn on
> "File name extensions" in Explorer's View tab so you can see if it's really `.env.txt`.

Edit `.env` with your details:
```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_app_id
BOT_NICKNAME=Server Monitor
API_HOST=127.0.0.1
API_PORT=8080
API_PASSWORD=your_server_password
ADMIN_USER_IDS=120343643381956608  # Replace with your Discord User ID!
```

`DISCORD_TOKEN`, `CLIENT_ID`, `API_HOST` and `API_PASSWORD` are required. If any are missing the
bot prints exactly which ones and exits, rather than crashing later with something cryptic.

**Optional:** Leave `BOT_NICKNAME` empty or remove it to use the bot's default username.

### Step 3: Get Your Discord User ID

1. Open Discord Settings → Advanced
2. Enable "Developer Mode"
3. Right-click your username → Copy User ID
4. Paste it in `.env` as `ADMIN_USER_IDS`

### Step 4: Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" section → "Add Bot"
4. Enable the **Message Content Intent** under "Privileged Gateway Intents" — this is the only
   privileged intent the bot needs, and it's what makes `!!` text commands work
5. Copy the token → paste as `DISCORD_TOKEN` in `.env`
6. Copy Application ID from "General Information" → paste as `CLIENT_ID` in `.env`

> You do **not** need the Server Members Intent. The bot looks up mapped players by fetching
> individual members by ID, which works without it.

### Step 5: Invite Bot to Server

1. In Discord Developer Portal → OAuth2 → URL Generator
2. Select: `bot` and `applications.commands`
3. Select permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`
   (add `Change Nickname` if you set `BOT_NICKNAME`)
4. Copy URL and open in browser

### Step 6: Configure Game Server

Edit your `DedicatedServerConfig.json`:
```json
{
  "bEnableHostWebAPIServer": true,
  "HostWebAPIServerPassword": "your_secure_password",
  "HostWebAPIServerPort": 8080
}
```

`API_PASSWORD` in `.env` must match `HostWebAPIServerPassword` exactly, and `API_PORT` must match
`HostWebAPIServerPort`.

### Step 7: Start Bot
```bash
npm start
```

## 🔒 Important: Don't Expose the Web API

The Motor Town Web API is **plain HTTP**, and the password travels in the URL in cleartext on
every request. Anyone who can see that traffic can kick, ban, and announce on your server.

**Do not open or port-forward the Web API port to the public internet.**

Recommended setups, best first:

1. **Run the bot on the same machine as the dedicated server** and set `API_HOST=127.0.0.1`.
   Nothing leaves the machine.
2. **Keep the bot and server on the same LAN or a VPN** and point `API_HOST` at the private
   address.
3. If you truly must reach it across the internet, put an HTTPS reverse proxy in front and
   restrict access by source IP.

Newer server builds also support `HostWebAPIDisabledCommands` in `DedicatedServerConfig.json` to
switch off individual API commands you don't use.

Your `.env` holds a live Discord token and your API password. It's gitignored — keep it that
way, and rotate both if it ever leaks.

## ⚙️ Optional Settings

All of these are optional; leave them empty to disable the feature.

| Variable | Default | What it does |
|----------|---------|--------------|
| `BOT_NICKNAME` | — | Nickname the bot gives itself in every server it joins |
| `API_TIMEOUT` | `10000` | How long to wait for the game server, in milliseconds |
| `JOIN_SERVER_NAME` | falls back to `SERVER_NAME` | Server name shown by `/join`. Without it, `/join` says it isn't configured |
| `JOIN_PASSWORD` | — | Server password shown by `/join` |
| `JOIN_LINK` | — | Extra link shown by `/join` |
| `PLAYER_MAPPING` | — | Maps game IDs to names or Discord User IDs |
| `MONITOR_CHANNEL_ID` | — | Channel for the auto-updating status dashboard |
| `MONITOR_INTERVAL` | `60` | Monitor refresh interval, in seconds |
| `SERVER_NAME` | `Motor Town Server` | Title shown in the monitor embed |
| `LOGO_URL` | — | Thumbnail shown in the monitor embed |
| `PLAYER_FEED_CHANNEL_ID` | — | Channel for the player join/leave feed |
| `PLAYER_FEED_INTERVAL` | `60` | Feed poll interval, in seconds |

> `MONITOR_MESSAGE_ID` no longer exists. The bot posts its own monitor message on first run and
> remembers it in `monitor_data.json`, so there's no message ID to copy by hand.

### 🚪 Player Join/Leave Feed

Set `PLAYER_FEED_CHANNEL_ID` to a channel and the bot posts a short embed whenever players
connect or disconnect:

```env
PLAYER_FEED_CHANNEL_ID=123456789012345678
PLAYER_FEED_INTERVAL=60
```

- Names respect your `PLAYER_MAPPING`, so you see Discord nicknames instead of raw IDs
- The first poll after startup only primes the roster — restarting the bot won't announce
  everyone who's already online
- While the game server is unreachable, the feed stays quiet instead of reporting everyone as
  having left

The Web API still has no endpoint for reading in-game chat, so this is the closest live feed
available.

## ✅ Verify It's Working

You should see:
```
Logged in as YourBot#1234!
Connected to API: http://127.0.0.1:8080
Admin users loaded: 1
Admin IDs: 120343643381956608
Player mappings loaded: 0
Bot activity set with player count
Setting bot nickname to: Server Monitor
✓ Nickname set in guild: Your Server Name
Successfully reloaded application (/) commands.
```

**In Discord, your bot will show:**
- Status: 🟢 Online
- Activity: Playing "N players online"
- Nickname: Server Monitor (if configured)

## 🎮 Test Your Bot

In Discord, try these commands:

**Everyone can use:**
- `/help` or `!!help` - See all available commands
- `/join` or `!!join` - Get instructions to join the server
- `/status` or `!!status` - Check server status
- `/players` or `!!players` - See who's online

**Admin only (you!):**
- `/announce Hello!` or `!!announce Hello!` - Send announcement
- `/listadmins` or `!!listadmins` - See admin list

💡 **Tip:** Slash commands not loading? Use `!!` prefix instead!

## 📚 Full Documentation

- **README.md** - Complete feature list and setup
- **ADMIN_GUIDE.md** - Admin system details
- **TROUBLESHOOTING.md** - Common issues and fixes
- **.env.example** - Configuration template

## 🆘 Common Issues

### Bot doesn't respond
- Wait 1-2 minutes for commands to register
- Check bot is online in Discord
- Verify bot has correct permissions
- For `!!` commands, make sure the **Message Content Intent** is enabled

### Bot exits with "Missing required configuration"
- The listed variables are empty or the `.env` file isn't being read
- Confirm the file is named exactly `.env` and lives next to `bot.js` — the error message prints
  the exact path the bot looked in

### "Permission denied" on admin commands
- Check your User ID in `.env` matches your Discord ID
- No spaces in `ADMIN_USER_IDS`
- Restart bot after editing `.env`

### Can't connect to API
- Verify `API_HOST` and `API_PORT` are correct and `bEnableHostWebAPIServer` is `true`
- Make sure the bot's machine can reach the server — if they're on the same box, use
  `API_HOST=127.0.0.1`. Don't open the port to the internet to fix this
- Test URL from the bot's machine: `http://your-host:8080/version?password=yourpassword`
- Raise `API_TIMEOUT` if the server is slow to answer

### Bot nickname not changing
- Bot needs "Change Nickname" permission
- Bot's role must be above the nickname it's trying to set
- Check console for error messages
- Leave `BOT_NICKNAME` empty to use default username

More detail in **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**.

## 🎉 You're Ready!

Your bot is now connected to your server. Use `/status` to see it in action!
