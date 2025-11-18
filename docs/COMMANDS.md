# Command Reference

Complete list of all bot commands with examples and usage tips.

## 🎯 Two Ways to Use Commands

The bot supports **dual command methods**:

### Slash Commands (`/`)
- Modern Discord UI
- Parameter autocomplete
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
3. Search for **Bjs Town**
4. Enter password: `jerry`
5. Connect to the server

**Quick Reference:**
- Server Name: **Bjs Town**
- Password: `jerry`

**Perfect for:**
- New players
- Friends you want to invite
- Quick password reminder

---

## 📊 Server Information Commands

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
- Player names
- Unique IDs (needed for kick/ban)
- Current locations (coordinates)
- Current vehicles (if any)

**Tip:** Use this to get player unique_ids for admin commands!

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
- Limited to first 10 sites

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

## 🔒 Admin Commands

### `/kick`
**Description:** Kick a player from the server  
**Permissions:** Bot Admins Only  
**Usage:** `/kick <unique_id>`

**Parameters:**
- `unique_id` (required) - Player's unique ID from `/players`

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
- `unique_id` (required) - Player's unique ID from `/players`
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
- `unique_id` (required) - Player's unique ID from `/banlist`

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

### `/addadmin`
**Description:** Add a Discord user as bot admin (temporary)  
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
- Temporary (resets on bot restart)
- To make permanent: add their ID to .env file

**Note:** The bot will provide their Discord User ID in the confirmation message for easy .env updating.

---

### `/removeadmin`
**Description:** Remove a Discord user from bot admins (temporary)  
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
- Temporary (resets on bot restart)
- To make permanent: remove their ID from .env file

**Protection:** Cannot remove yourself if you're the last admin.

---

## 💡 Usage Tips

### Getting Player IDs
1. Use `/players` to see all online players
2. Copy the unique_id shown (e.g., `12345`)
3. Use that ID in `/kick` or `/ban` commands

### Using Colors
- Colors are in hex format without the # symbol
- Use 6 characters: RRGGBB
- Test colors at: https://www.color-hex.com/

### Managing Admins
- Use `/listadmins` to see current bot admins
- Use `/addadmin` for temporary access
- Edit .env file for permanent changes
- Changes via commands reset on restart

### Error Messages
- **"You do not have permission"** - You're not a bot admin
- **"Failed to [action]"** - Check API connection and player ID
- **"Unknown user"** - Player may have left or ID is incorrect

### Best Practices
1. Always use `/players` to verify IDs before kicking/banning
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
- `/version` - Version
- `/deliveries` - Deliveries
- `/housing` - Housing
- `/banlist` - Banned players
- `/admins` - Server admins
- `/police` - Server police
- `/listadmins` - Bot admins

**Admin Only:**
- `/kick` - Remove player
- `/ban` - Ban player
- `/unban` - Unban player
- `/announce` - Announcement
- `/serverchat` - Chat message
- `/addadmin` - Add bot admin
- `/removeadmin` - Remove bot admin

---

## 🆘 Common Questions

**Q: How do I know if I'm an admin?**
A: Use `/help` - it will show "You have access" for admin commands, or use `/listadmins` to see if you're listed.

**Q: Why can't I use admin commands?**
A: Your Discord User ID must be in the `ADMIN_USER_IDS` list in the bot's .env file.

**Q: How do I get someone's unique_id?**
A: Use `/players` to see all online players and their IDs.

**Q: Can I use player names instead of IDs?**
A: No, you must use the unique_id number. Names can be duplicated but IDs are unique.

**Q: How long do temporary bans last?**
A: Specify hours in the `/ban` command. Leave empty for permanent ban.

**Q: What happens if I ban the wrong person?**
A: Use `/unban` with their unique_id to immediately remove the ban.

**Q: Can I use the bot in multiple Discord servers?**
A: Yes! The same bot can be in multiple servers, and admin commands work in all of them.

**Q: Do Discord server roles affect bot commands?**
A: No, bot admin permissions are based on Discord User IDs only, not server roles.
