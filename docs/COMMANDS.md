# Command Reference

Complete list of all bot commands with examples and usage tips.

## 🎯 Two Ways to Use Commands

The bot supports **dual command methods**:

### Slash Commands (`/`)
- Modern Discord UI
- **Player name autocomplete** on `/kick`, `/ban`, `/unban`, `/addrole` and `/removerole`
- Helpful tooltips
- Example: `/status`

### Text Commands (`!!`)
- Faster response
- Works immediately  
- No registration wait
- Example: `!!status`

**All commands work with both methods!** Use whichever you prefer.

**Quick Examples:**
- `/help` = `!!help`
- `/status` = `!!status`
- `/kick 12345` = `!!kick 12345`

💡 **Tip:** Slash commands slow to load? Use `!!` prefix instead!

⚠️ **One difference:** name autocomplete is a slash-command feature. `!!` text commands still need the raw `unique_id` — use `/find <name>` or `!!find <name>` to look one up.

---

## 📖 Help Command

### `/help`
**Description:** Display all available commands with descriptions  
**Permissions:** Everyone  
**Usage:** `/help`

**What it shows:**
- Server information commands
- Role information commands
- Admin commands (if you have access)
- Usage tips and examples
- Server connection info

**Example output for regular users:**
- Shows all public commands
- Lists admin commands as "Restricted"
- Explains how to get admin access

**Example output for admin users:**
- Shows all public commands
- Lists admin commands with "You have access" indicator
- Full command syntax and parameters

---

## 🎮 Join Command

### `/join`
**Description:** Step-by-step instructions on how to join the server  
**Permissions:** Everyone  
**Usage:** `/join`

**Shows:**
1. Launch the game
2. Click **Join** in main menu
3. Search for your server by name
4. Enter the password (only shown if one is configured)
5. Connect to the server

**Configured in `.env`:**
- `JOIN_SERVER_NAME` - the server name players search for (falls back to `SERVER_NAME`)
- `JOIN_PASSWORD` - optional; if unset, the embed says "Password: None"
- `JOIN_LINK` - optional "More info" link shown in the quick reference

**Note:** If `JOIN_SERVER_NAME` (and `SERVER_NAME`) are both unset, `/join` replies that join instructions aren't configured yet.

**Perfect for:**
- New players
- Friends you want to invite
- Quick password reminder

---

## 📊 Server Information Commands

📋 **About long lists:** `/players`, `/housing`, `/banlist`, `/admins`, `/police` and `/deliveries` render as one compact list instead of one block per entry. This means they no longer break on servers with more than 25 entries, and if a list is too long for a single Discord message the footer tells you how many are shown out of the total.

### `/status`
**Description:** Complete server status overview  
**Permissions:** Everyone  
**Usage:** `/status`

**Shows:**
- Number of players online
- Server version
- Server host
- Timestamp

---

### `/playercount`
**Description:** Quick check of player count  
**Permissions:** Everyone  
**Usage:** `/playercount`

**Shows:**
- Current number of players online

---

### `/players`
**Description:** Detailed list of all online players  
**Permissions:** Everyone  
**Usage:** `/players`

**Shows:**
- Player names (mapped names/Discord nicknames if configured)
- Unique IDs (needed for kick/ban)
- Current locations, shortened to readable coordinates (e.g. `X=2590 Y=1683`)
- Current vehicles (if any)
- 💤 **AFK** and 🤖 **Autopilot** badges when the server reports them (game server build 0.7.19+; older servers simply show no badge)

The list is rendered as one compact block, so busy servers with more than 25 players display fine. If there are too many players to fit in a single Discord message, the footer says how many are shown out of the total.

**Tip:** Use this to get player unique_ids for admin commands!

---

### `/find`
**Description:** Search online players by name and get their unique ID
**Permissions:** Everyone
**Usage:** `/find <name>`

**Parameters:**
- `name` (required) - Full or partial player name (also matches part of a unique ID)

**Example:**
```
/find jerry
```

**Shows:**
- Every matching online player
- Their unique ID and location

**Tip:** This is the fastest way to get an ID for `!!kick`, `!!ban` or `!!addrole`, since text commands don't have autocomplete.

---

### `/version`
**Description:** Server version information  
**Permissions:** Everyone  
**Usage:** `/version`

**Shows:**
- Current server version string

---

### `/deliveries`
**Description:** View delivery sites and cargo information  
**Permissions:** Everyone  
**Usage:** `/deliveries`

**Shows:**
- Delivery site names
- Site locations
- Number of active deliveries
- Available output items

---

### `/company`
**Description:** Company profit figures from the server economy
**Permissions:** Everyone
**Usage:** `/company [days]`

**Parameters:**
- `days` (optional) - Number of days to report on (default `7`)

**Example:**
```
/company
(Last 7 days)

/company 30
(Last 30 days)
```

**Note:** This reads the `/company/profit` Web API endpoint, which only exists on newer Motor Town dedicated server builds. On an older server the command replies with a clear message saying the endpoint isn't available rather than failing silently.

---

### `/housing`
**Description:** Housing ownership and expiration information  
**Permissions:** Everyone  
**Usage:** `/housing`

**Shows:**
- House names
- Owner unique IDs
- Expiration dates

---

### `/banlist`
**Description:** List all banned players  
**Permissions:** Everyone  
**Usage:** `/banlist`

**Shows:**
- Banned player names
- Their unique IDs

---

## 👥 Role Information Commands

### `/admins`
**Description:** List all server administrators  
**Permissions:** Everyone  
**Usage:** `/admins`

**Shows:**
- Admin nicknames
- Admin unique IDs
- Total count

---

### `/police`
**Description:** List all server police officers  
**Permissions:** Everyone  
**Usage:** `/police`

**Shows:**
- Police officer nicknames
- Police officer unique IDs
- Total count

---

### `/listadmins`
**Description:** List Discord users who can use bot admin commands  
**Permissions:** Everyone  
**Usage:** `/listadmins`

**Shows:**
- Discord usernames and tags
- Discord user IDs
- Who has bot admin access

---

### `/playermapping`
**Description:** View the configured player ID → name/Discord user mappings  
**Permissions:** Everyone  
**Usage:** `/playermapping`

**Shows:**
- Each mapped unique ID and the name (or Discord user) it resolves to
- How to add mappings via `PLAYER_MAPPING` in `.env`

---

## 🔒 Admin Commands

💡 **Autocomplete:** `/kick`, `/ban`, `/unban`, `/addrole` and `/removerole` autocomplete the `unique_id` option. Start typing a player's name and Discord suggests matching live players (`/unban` suggests from the ban list instead). Pick one and the correct ID is filled in for you. Autocomplete is slash-command only — the `!!` versions still take a raw ID.

### `/kick`
**Description:** Kick a player from the server  
**Permissions:** Bot Admins Only  
**Usage:** `/kick <unique_id>`

**Parameters:**
- `unique_id` (required) - Player's unique ID — start typing a name to autocomplete

**Example:**
```
/kick 12345
```

**Result:**
- Player is immediately removed from server
- Confirmation message sent

---

### `/ban`
**Description:** Ban a player from the server  
**Permissions:** Bot Admins Only  
**Usage:** `/ban <unique_id> [hours] [reason]`

**Parameters:**
- `unique_id` (required) - Player's unique ID — start typing a name to autocomplete
- `hours` (optional) - Ban duration in hours (leave empty for permanent)
- `reason` (optional) - Reason for the ban

**Examples:**
```
/ban 12345
(Permanent ban, no reason)

/ban 12345 24
(24-hour ban, no reason)

/ban 12345 48 Cheating
(48-hour ban with reason)
```

**Result:**
- Player is banned for specified duration
- Confirmation message with details

---

### `/unban`
**Description:** Remove a ban from a player  
**Permissions:** Bot Admins Only  
**Usage:** `/unban <unique_id>`

**Parameters:**
- `unique_id` (required) - Player's unique ID — start typing a name to autocomplete from the ban list

**Example:**
```
/unban 12345
```

**Result:**
- Ban is removed
- Player can rejoin server
- Confirmation message sent

---

### `/announce`
**Description:** Send a server-wide announcement  
**Permissions:** Bot Admins Only  
**Usage:** `/announce <message>`

**Parameters:**
- `message` (required) - The announcement text

**Example:**
```
/announce Server restart in 10 minutes!
```

**Result:**
- Message appears to all players in-game
- Displayed as announcement type
- Confirmation in Discord

---

### `/serverchat`
**Description:** Send a chat message to the server  
**Permissions:** Bot Admins Only  
**Usage:** `/serverchat <message> [color]`

**Parameters:**
- `message` (required) - The chat message
- `color` (optional) - Text color in hex format (no # symbol)

**Examples:**
```
/serverchat Hello everyone!
(White text by default)

/serverchat Welcome to the server! FF0000
(Red text)

/serverchat Event starting now! 00FF00
(Green text)
```

**Common Colors:**
- `FF0000` - Red
- `00FF00` - Green
- `0000FF` - Blue
- `FFFF00` - Yellow
- `FF00FF` - Magenta
- `00FFFF` - Cyan
- `FFA500` - Orange
- `800080` - Purple

**Result:**
- Message appears in server chat
- Shows in specified color
- Confirmation in Discord

---

### `/addrole`
**Description:** Grant a player the **admin** or **police** role on the game server  
**Permissions:** Bot Admins Only  
**Usage:** `/addrole <admin|police> <unique_id>`

**Parameters:**
- `role` (required) - `admin` or `police` (pick from the dropdown)
- `unique_id` (required) - Player's unique ID — start typing a name to autocomplete

**Example:**
```
/addrole police 12345
```

**Result:**
- Player immediately gains the in-game role
- Confirm with `/admins` or `/police`

**Note:** This is an **in-game** role on the Motor Town server. It's unrelated to `/addadmin`, which controls who may use this bot's admin commands.

---

### `/removerole`
**Description:** Revoke a player's **admin** or **police** role on the game server  
**Permissions:** Bot Admins Only  
**Usage:** `/removerole <admin|police> <unique_id>`

**Parameters:**
- `role` (required) - `admin` or `police` (pick from the dropdown)
- `unique_id` (required) - Player's unique ID — start typing a name to autocomplete

**Example:**
```
/removerole police 12345
```

**Result:**
- Player loses the in-game role
- Confirmation message sent

---

### `/apiraw`
**Description:** Call any Web API endpoint directly and print the raw JSON response  
**Permissions:** Bot Admins Only  
**Usage:** `/apiraw <endpoint> [params]`

**Parameters:**
- `endpoint` (required) - Endpoint path, e.g. `/player/list` or `/company/profit` (a leading `/` is added if you forget it)
- `params` (optional) - Extra query parameters as `key=value` pairs separated by spaces

**Examples:**
```
/apiraw /player/list

/apiraw /company/profit days=7

/apiraw /player/role/list role=admin
```

**Result:**
- The response is sent back as a JSON code block (truncated if very long)
- Requests are always sent as `GET`; the API password is added automatically and cannot be overridden

**Perfect for:** exploring endpoints added by new game updates before the bot has a dedicated command for them.

---

### `/addadmin`
**Description:** Add a Discord user as bot admin  
**Permissions:** Bot Admins Only  
**Usage:** `/addadmin <user>`

**Parameters:**
- `user` (required) - Discord user to add (@mention or select)

**Example:**
```
/addadmin @JohnDoe
```

**Result:**
- User gains admin command access
- **Persistent** - saved to `admin_data.json`, so it survives a bot restart
- Optional: add their ID to `ADMIN_USER_IDS` in `.env` to bake it into your config

**Note:** The confirmation message includes the full `ADMIN_USER_IDS=` line for easy .env updating.

---

### `/removeadmin`
**Description:** Remove a Discord user from bot admins  
**Permissions:** Bot Admins Only  
**Usage:** `/removeadmin <user>`

**Parameters:**
- `user` (required) - Discord user to remove (@mention or select)

**Example:**
```
/removeadmin @JohnDoe
```

**Result:**
- User loses admin command access
- **Persistent** - saved to `admin_data.json`, so it survives a bot restart
- ⚠️ Exception: if their ID is listed in `ADMIN_USER_IDS` in `.env`, they become an admin again on restart. Remove them from `.env` to make it stick — the bot tells you when this applies.

**Protection:** Cannot remove the last remaining admin.

---

### `/testmapping`
**Description:** Test a single player ID → name mapping and show exactly how it will display  
**Permissions:** Bot Admins Only  
**Usage:** `/testmapping <unique_id>`

**Parameters:**
- `unique_id` (required) - A player unique ID that appears in `PLAYER_MAPPING`

**Shows:**
- Whether the mapping is a custom name or a Discord user ID
- Whether that Discord user exists and is a member of this server
- The exact string that will appear in `/players`

---

## 💡 Usage Tips

### Getting Player IDs
1. On slash commands, just start typing the player's name — `/kick`, `/ban`, `/unban`, `/addrole` and `/removerole` autocomplete it for you
2. Otherwise use `/find <name>` to search, or `/players` to see everyone online
3. Copy the unique_id shown (e.g., `12345`) and use it in the command

### Using Colors
- Colors are in hex format without the # symbol
- Use 6 characters: RRGGBB
- Test colors at: https://www.color-hex.com/

### Managing Admins
- Use `/listadmins` to see current bot admins
- `/addadmin` and `/removeadmin` are saved to `admin_data.json` and survive a restart
- `.env` still wins on restart: anyone in `ADMIN_USER_IDS` is always re-added at startup
- Bot admins (Discord users who may run these commands) are separate from in-game roles granted with `/addrole`

### Error Messages
- **"You do not have permission"** - You're not a bot admin
- **"Failed to [action]"** - Check API connection and player ID
- **"Unknown user"** - Player may have left or ID is incorrect
- **"Cannot reach the game server..."** - Server is down, or the Web API isn't enabled/reachable on `API_HOST:API_PORT`
- **"This endpoint requires a recent Motor Town dedicated server build"** - `/company` isn't supported by your server version

### Best Practices
1. Use autocomplete or `/find` to verify IDs before kicking/banning
2. Provide reasons when banning players
3. Use temporary bans (hours) when appropriate
4. Check `/banlist` regularly
5. Use `/help` to remind yourself of commands

---

## 🔍 Command Categories Quick Reference

**Everyone Can Use:**
- `/help` - Show commands
- `/join` - Join instructions
- `/status` - Server info
- `/playercount` - Player count
- `/players` - Player list
- `/find` - Search a player by name
- `/version` - Version
- `/deliveries` - Deliveries
- `/housing` - Housing
- `/company` - Company profit
- `/banlist` - Banned players
- `/admins` - Server admins
- `/police` - Server police
- `/listadmins` - Bot admins
- `/playermapping` - Player ID mappings

**Admin Only:**
- `/kick` - Remove player
- `/ban` - Ban player
- `/unban` - Unban player
- `/announce` - Announcement
- `/serverchat` - Chat message
- `/addrole` - Grant in-game admin/police role
- `/removerole` - Revoke in-game admin/police role
- `/addadmin` - Add bot admin
- `/removeadmin` - Remove bot admin
- `/testmapping` - Test a player mapping
- `/apiraw` - Raw Web API call

---

## 🆘 Common Questions

**Q: How do I know if I'm an admin?**
A: Use `/help` - it will show "You have access" for admin commands, or use `/listadmins` to see if you're listed.

**Q: Why can't I use admin commands?**
A: Your Discord User ID must be in the `ADMIN_USER_IDS` list in the bot's .env file.

**Q: How do I get someone's unique_id?**
A: Use `/find <name>` to search by name, or `/players` to see everyone online and their IDs.

**Q: Can I use player names instead of IDs?**
A: On slash commands, yes in practice — `/kick`, `/ban`, `/unban`, `/addrole` and `/removerole` let you type a name and pick from a suggestion list, which fills in the ID for you. The command itself still sends the unique_id, because names can be duplicated but IDs are unique. `!!` text commands need the raw ID, so use `!!find <name>` first.

**Q: What's the difference between `/addrole` and `/addadmin`?**
A: `/addrole` grants an **in-game** admin or police role on the Motor Town server. `/addadmin` grants a **Discord user** permission to run this bot's admin commands.

**Q: Why does `/company` say it's unsupported?**
A: The `/company/profit` Web API endpoint only exists on newer Motor Town dedicated server builds. Update your server to use it.

**Q: How long do temporary bans last?**
A: Specify hours in the `/ban` command. Leave empty for permanent ban.

**Q: What happens if I ban the wrong person?**
A: Use `/unban` with their unique_id to immediately remove the ban.

**Q: Can I use the bot in multiple Discord servers?**
A: Yes! The same bot can be in multiple servers, and admin commands work in all of them.

**Q: Do Discord server roles affect bot commands?**
A: No, bot admin permissions are based on Discord User IDs only, not server roles.

**Q: My `/announce`, `/serverchat`, `/kick`, `/ban` or `/unban` keeps saying "Invalid password" — what gives?**
A: That was a bug in versions before **2.0.0**: those commands sent the API password in the request body, but the Motor Town Web API only reads parameters from the query string, so it saw no password at all. It's fixed in 2.0.0 — update the bot and they all work.
