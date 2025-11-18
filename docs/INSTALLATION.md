# 🚀 Quick Start Guide

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

Edit `.env` with your details:
```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_app_id
BOT_NICKNAME=Server Monitor
API_HOST=123.456.789.0
API_PORT=8080
API_PASSWORD=your_server_password
ADMIN_USER_IDS=120343643381956608  # Replace with your Discord User ID!
```

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
4. Copy the token → paste as `DISCORD_TOKEN` in `.env`
5. Copy Application ID from "General Information" → paste as `CLIENT_ID` in `.env`

### Step 5: Invite Bot to Server

1. In Discord Developer Portal → OAuth2 → URL Generator
2. Select: `bot` and `applications.commands`
3. Select permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`
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

### Step 7: Start Bot
```bash
npm start
```

## ✅ Verify It's Working

You should see:
```
Logged in as YourBot#1234!
Connected to API: http://123.456.789.0:8080
Admin users loaded: 1
Admin IDs: 120343643381956608
Bot activity set to: Playing Motortown
Setting bot nickname to: Server Monitor
✓ Nickname set in guild: Your Server Name
Successfully reloaded application (/) commands.
```

**In Discord, your bot will show:**
- Status: 🟢 Online
- Activity: Playing Motortown
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
- **.env.example** - Configuration template

## 🆘 Common Issues

### Bot doesn't respond
- Wait 1-2 minutes for commands to register
- Check bot is online in Discord
- Verify bot has correct permissions

### "Permission denied" on admin commands
- Check your User ID in `.env` matches your Discord ID
- No spaces in `ADMIN_USER_IDS`
- Restart bot after editing `.env`

### Can't connect to API
- Verify `API_HOST` and `API_PORT` are correct
- Check firewall allows port 8080
- Test URL: `http://your-ip:8080/version?password=yourpassword`

### Bot nickname not changing
- Bot needs "Change Nickname" permission
- Bot's role must be above the nickname it's trying to set
- Check console for error messages
- Leave `BOT_NICKNAME` empty to use default username

## 🎉 You're Ready!

Your bot is now connected to your server. Use `/status` to see it in action!
