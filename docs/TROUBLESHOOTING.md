# 🔧 Troubleshooting Guide

Common problems and how to fix them. Most of the issues people used to hit were bugs that are
fixed in **v2.0.0** — if you're on an older build, updating is the first thing to try.

## 🚦 Start Here

- [ ] You're running **v2.0.0 or later** (`package.json` → `"version"`)
- [ ] Node.js **18.0.0 or higher** (`node -v`)
- [ ] Your config file is named exactly `.env` and sits next to `bot.js`
- [ ] The bot was restarted after your last `.env` edit

## 🔑 "Invalid password" on /announce, /serverchat, /kick, /ban or /unban

**This was a bot bug, not your configuration.**

In versions 1.6.0 through 1.x, these commands sent their parameters in the request body. The
Motor Town Web API reads *every* parameter from the query string — even on POST requests — so
the game server saw no password at all and rejected the call.

**Solution:** update to v2.0.0 or later. Nothing in your `.env` needs to change.

If you still see it after updating, then it really is a password mismatch:

1. Open your `DedicatedServerConfig.json`
2. Compare `HostWebAPIServerPassword` to `API_PASSWORD` in `.env` — they must match exactly,
   character for character (no quotes, no trailing spaces)
3. Restart the bot after any change

## 🔌 Can't Connect to the Game Server

The bot now tells you which of these it is instead of dumping a raw error code.

| Message | Cause | Fix |
|---------|-------|-----|
| `Cannot reach the game server at host:port` | Nothing is listening there | Start the server; confirm `bEnableHostWebAPIServer` is `true` and `HostWebAPIServerPort` matches `API_PORT` |
| `Could not resolve the host ...` | DNS failure / typo | Check `API_HOST` in `.env`. Use an IP address if in doubt |
| `... did not respond in time` | Server busy, or blocked in transit | Raise `API_TIMEOUT` (milliseconds, default `10000`); check for a firewall between bot and server |

Quick test from the machine running the bot:
```
http://your-host:8080/version?password=yourpassword
```

## ⚙️ Bot Starts and Immediately Exits

The bot checks its required config before doing anything else and prints exactly what's missing:

```
❌ Missing required configuration:
   - API_PASSWORD

Create a .env file next to bot.js (copy .env.example) and fill these in.
Expected location: C:\path\to\bot\.env
```

Required: `DISCORD_TOKEN`, `CLIENT_ID`, `API_HOST`, `API_PASSWORD`.

**If it lists *everything* as missing, your `.env` isn't being read at all.** The usual cause is
the filename:

- ✅ `.env`
- ❌ `.env.local`, `.env.txt`, `env`

`dotenv` only reads a file named exactly `.env`. Windows Explorer hides known extensions, so a
file that looks like `.env` can actually be `.env.txt` — turn on "File name extensions" in the
View tab to check.

The file must also sit in the **same folder as `bot.js`**. As of v2.0.0 the bot resolves `.env`
relative to `bot.js`, so it no longer loads a blank config when you start it from a different
working directory (a service or scheduled task, for example).

## 📊 Server Monitor Doesn't Update

The monitor embed posted once at startup and then never refreshed in older versions. Fixed in
v2.0.0 — it now refreshes on the interval you set.

Still not updating?

1. `MONITOR_CHANNEL_ID` must be a text channel the bot can **View**, **Send Messages** and
   **Embed Links** in
2. `MONITOR_INTERVAL` is in **seconds** (default `60`)
3. Check the console for `Monitor Error:` lines
4. If the embed shows 🔴 **Offline**, the bot can reach Discord but not the game server — see
   [Can't Connect to the Game Server](#-cant-connect-to-the-game-server)

### The monitor said "Invalid password" but commands worked

An API password containing `&`, `#`, `+` or a space used to break the monitor only, while other
commands worked fine. Fixed in v2.0.0 — passwords with special characters are URL-encoded
properly now. Update the bot; you don't need to change your password.

## 📋 A List Command Shows Nothing / Crashes on a Busy Server

`/players`, `/housing`, `/banlist`, `/admins` and `/police` used to fail on servers with more
than 25 entries, because Discord rejects an embed with more than 25 fields. Fixed in v2.0.0 —
these commands now build a single description that fits Discord's limits and tell you how many
entries were shown:

```
Showing 40 of 63 players
```

## 🧩 "This endpoint requires a recent dedicated server build"

Your dedicated server is older than the API endpoint the command needs. For example `/company`
calls `/company/profit`, which was added in a 2026 server update.

**Solution:** update your dedicated server, or check what your build actually responds with:

```
/apiraw /company/profit days=7
```

`/apiraw` (admin only) calls any Web API endpoint and prints the raw JSON, which is the quickest
way to see whether an endpoint exists on your server at all.

## 🤖 Bot Doesn't Respond to Slash Commands

1. Give Discord 1-2 minutes to register commands after the first start
2. Check the console — if registration failed it says so and tells you to verify `CLIENT_ID`
   and `DISCORD_TOKEN`
3. Confirm the bot is online and has permission to post in the channel
4. Use `!!` text commands in the meantime (`!!status`, `!!players`) — those need the
   **Message Content Intent** enabled in the Discord Developer Portal

## 🎮 Player Mapping Issues

### Quick Diagnosis

Use the `/testmapping` command (admin only) to diagnose a specific mapping:

```
/testmapping unique_id:12345
```

**What it shows:**
- ✅ If the Discord user was found
- ✅ If they're in the server
- ✅ Their nickname (if any)
- ✅ What will be displayed
- ❌ Specific error messages

### Issue: User Shows Username Instead of Nickname

**What you see:**
- `JerryTheGamer#1234 (Player_12345)` 
- Instead of: `Jerry (Player_12345)`

**Most common cause:** User is not a member of your Discord server, or they simply haven't set a
server nickname.

**Solution:**
1. Use `/testmapping 12345` to check
2. Look for "❌ Not a Member of" message
3. Invite the user to your Discord server

### Issue: Shows Raw Discord ID

**What you see:**
- `<@120343643381956608> (Player_12345)`

**Cause:** Invalid Discord User ID or user doesn't exist

**Solution:**
1. Copy the User ID again from Discord
2. Verify it's 17-19 digits
3. Update your `.env` file
4. Restart the bot

### Issue: Can't See Nicknames

The bot fetches individual members by ID, which works **without** the privileged Server Members
Intent — so you don't need to enable it for nicknames.

**Usual causes:**
1. The user isn't a member of that Discord server (the bot falls back to their global username)
2. The user has no nickname set in that server
3. The mapped value isn't actually a Discord User ID

Run `/testmapping <id>` and read which of the three it reports.

### Console Logs Explained

When bot starts:
```
  12345 → JerryTheGamer#1234 (Discord User)
    └─ Bjs Town Server: "Jerry"              ← Has nickname
    └─ Gaming Hub: (no nickname, will show JerryTheGamer)  ← No nickname
    └─ Friends: (user not a member of this server)  ← Not in server
```

### Quick Fix Checklist

- [ ] User ID is correct (copy it again)
- [ ] User is in your Discord server
- [ ] `PLAYER_MAPPING` format is `id:value|id:value`
- [ ] `.env` file format is correct
- [ ] Bot restarted after changes

## 🔒 "You do not have permission to use this command"

You're not on the bot admin list. See the [Admin Guide](ADMIN_GUIDE.md) — check your Discord
User ID is in `ADMIN_USER_IDS`, with no spaces between IDs, and that the bot was restarted.

Note that bot admins are separate from in-game admins. `/admins` lists the game server's admins;
`/listadmins` lists who can use the bot's admin commands.

## 🆘 Need More Help?

Run the command that's failing, copy the bot's error message **and** the matching console output,
and open an issue. For mapping problems, include the `/testmapping` output.
