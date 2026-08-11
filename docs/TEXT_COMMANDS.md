# Text Commands Guide (!! Prefix)

## Overview

The bot supports **two ways** to use commands:
1. **Slash Commands** (`/`) - Discord's modern command system
2. **Text Commands** (`!!`) - Traditional message-based commands

## Why Use !! Commands?

### Advantages
- ✅ **Faster** - No waiting for Discord to sync slash commands
- ✅ **Instant** - Works immediately when slash commands are slow
- ✅ **Backup** - Always available if slash commands aren't loading
- ✅ **Same Features** - Every command has a `!!` version

### One Trade-off
- ⚠️ **No autocomplete** - Slash commands can suggest player names for `unique_id`; text commands need the raw ID. Use `!!find <name>` to look one up first.

### When to Use
- Slash commands taking too long to appear
- First time inviting bot to server (commands need to register)
- Discord having issues with slash commands
- You prefer typing commands quickly

## How to Use

Simply type `!!` followed by the command name and any arguments.

### Basic Format
```
!!commandname [arguments]
```

### Examples
```
!!help
!!status
!!players
!!find jerry
!!kick 12345
!!ban 12345 24 Cheating
!!announce Server restart in 10 minutes!
```

## Complete Command List

### 📖 Information Commands

#### `!!help`
Show all available commands
```
!!help
```

#### `!!join`
Get instructions to join the server
```
!!join
```

#### `!!status`
Get server status overview
```
!!status
```

#### `!!playercount`
Show number of online players
```
!!playercount
```

#### `!!players`
List all online players with details — name, unique ID, readable coordinates, vehicle, plus 💤 AFK and 🤖 Autopilot badges on server build 0.7.19+
```
!!players
```

#### `!!find`
Search online players by full or partial name and get their unique ID
```
!!find <name>

Example:
!!find jerry
```
💡 This is the text-command replacement for slash autocomplete — grab the ID here, then paste it into `!!kick`, `!!ban` or `!!addrole`.

#### `!!version`
Show server version
```
!!version
```

#### `!!deliveries`
View delivery sites
```
!!deliveries
```

#### `!!housing`
View housing information
```
!!housing
```

#### `!!company`
Show company profit figures for the last few days (default 7)
```
!!company [days]

Examples:
!!company
(Last 7 days)

!!company 30
(Last 30 days)
```
ℹ️ Requires a recent Motor Town dedicated server build. Older servers get a clear "not available" message instead.

#### `!!banlist`
List banned players
```
!!banlist
```

### 👥 Role Commands

#### `!!admins`
List server administrators
```
!!admins
```

#### `!!police`
List server police
```
!!police
```

#### `!!listadmins`
List bot admin users
```
!!listadmins
```

#### `!!playermapping`
View the configured player ID → name/Discord user mappings
```
!!playermapping
```

### 🔒 Admin Commands

💡 Text commands don't autocomplete names. Run `!!find <name>` (or `!!players`) first to get the `unique_id`.

#### `!!kick`
Kick a player from server
```
!!kick <unique_id>

Example:
!!kick 12345
```

#### `!!ban`
Ban a player (temporary or permanent)
```
!!ban <unique_id> [hours] [reason]

Examples:
!!ban 12345
(Permanent ban, no reason)

!!ban 12345 24
(24-hour ban, no reason)

!!ban 12345 48 Cheating
(48-hour ban with reason)

!!ban 12345 Toxic behavior
(Permanent ban with reason - just omit the hours)
```

**How the arguments are read:** if the argument right after the ID is a number, it's the ban duration in hours; otherwise everything after the ID is treated as the reason. So `!!ban 12345 Cheating` bans permanently with the reason "Cheating".

#### `!!unban`
Unban a player
```
!!unban <unique_id>

Example:
!!unban 12345
```

#### `!!announce`
Send server-wide announcement
```
!!announce <message>

Example:
!!announce Server restart in 10 minutes!
```

#### `!!serverchat`
Send colored chat message
```
!!serverchat <message> [color]

Examples:
!!serverchat Hello everyone!
(White text - default)

!!serverchat Welcome to the server! FF0000
(Red text)

!!serverchat Event starting now! 00FF00
(Green text)
```

**Color Codes:**
- `FF0000` - Red
- `00FF00` - Green
- `0000FF` - Blue
- `FFFF00` - Yellow
- `FF00FF` - Magenta
- `00FFFF` - Cyan
- `FFA500` - Orange
- `FFFFFF` - White

#### `!!addrole`
Grant a player the **admin** or **police** role on the game server
```
!!addrole <admin|police> <unique_id>

Example:
!!addrole police 12345
```
⚠️ Note the order: the role comes **first**, then the ID.

#### `!!removerole`
Revoke a player's **admin** or **police** role on the game server
```
!!removerole <admin|police> <unique_id>

Example:
!!removerole police 12345
```

#### `!!addadmin`
Add a Discord user as a bot admin (persistent — survives restarts)
```
!!addadmin @user

Example:
!!addadmin @JohnDoe
```
Saved to `admin_data.json`. Anyone listed in `ADMIN_USER_IDS` in `.env` is always an admin on startup.

#### `!!removeadmin`
Remove a Discord user from bot admins (persistent — survives restarts)
```
!!removeadmin @user

Example:
!!removeadmin @JohnDoe
```
⚠️ If their ID is in `ADMIN_USER_IDS` in `.env`, they'll be an admin again after a restart — the bot says so when that applies. The last remaining admin can't be removed.

#### `!!testmapping`
Test a single player ID mapping and show exactly how it will display
```
!!testmapping <unique_id>

Example:
!!testmapping 12345
```

#### `!!apiraw`
Call any Web API endpoint directly and print the raw JSON response
```
!!apiraw <endpoint> [key=value ...]

Examples:
!!apiraw /player/list

!!apiraw /company/profit days=7

!!apiraw /player/role/list role=admin
```
Handy for poking at endpoints added by new game updates before the bot has a proper command for them. Requests are sent as `GET`; the API password is added automatically and can't be overridden.

## Comparison: Slash vs Text Commands

| Feature | Slash Commands (`/`) | Text Commands (`!!`) |
|---------|---------------------|----------------------|
| **Speed** | Can be slow to load | Instant |
| **Player name autocomplete** | Yes (kick/ban/unban/roles) | No — use `!!find` |
| **Parameter hints** | Yes | No |
| **Availability** | Needs registration | Always works |
| **Visibility** | Only user sees result | Everyone sees command |
| **Modern UI** | Yes | No |
| **Permissions** | Same | Same |
| **Features** | All | All |

## Tips & Best Practices

### Getting Started
1. Try slash commands first (`/help`)
2. If slow, switch to text commands (`!!help`)
3. Both work identically - use whichever you prefer

### For Admins
- Use `!!` for quick actions when managing server
- Slash commands better for complex parameters
- Text commands faster for repetitive tasks

### Common Patterns

**Quick Status Check:**
```
!!status
!!players
```

**Player Management:**
```
!!find jerry       (Get unique_id by name)
!!kick 12345       (Kick the player)
```

**Ban with Reason:**
```
!!ban 12345 24 Verbal harassment
```

**Colored Announcements:**
```
!!serverchat Event in 5 minutes! FFD700
```

## Troubleshooting

### "Unknown command"
- Check spelling: `!!help` not `!!halp`
- Commands are case-insensitive: `!!HELP` works too

### "You do not have permission"
- You need to be in `ADMIN_USER_IDS` list
- Contact server owner to add your Discord User ID

### "Usage: ..."
- You're missing required parameters
- Example shown in error message
- Check this guide for proper syntax

### Commands not working
- Make sure you have Message Content Intent enabled in bot settings
- Check bot has "Send Messages" permission in channel
- Verify bot is online

### Admin commands (@mentions)
For `!!addadmin` and `!!removeadmin`:
```
✅ Correct:  !!addadmin @JohnDoe
❌ Wrong:    !!addadmin JohnDoe
```
Use a real @mention so Discord resolves the user for the bot. A raw Discord User ID only works if the bot already has that user cached, so the mention is always the safe option. If the user can't be resolved, the bot replies telling you to mention them directly.

## Examples by Use Case

### New Player Joining
```
!!join
(Shows connection instructions)
```

### Checking Server Activity
```
!!status
!!players
!!deliveries
```

### Moderating Players
```
!!find jerry
(Look up the troublemaker's unique_id)

!!kick 12345
(If they rejoin and continue)

!!ban 12345 48 Continued harassment
```

### Promoting a Player In-Game
```
!!find dave
(Get their unique_id)

!!addrole police 12345
(Give them the in-game police role)

!!police
(Confirm they're listed)
```

### Making Announcements
```
!!announce Server maintenance in 15 minutes. Please save your progress!

!!serverchat Event starting at spawn! FF00FF
```

### Managing Bot Admins
```
!!listadmins
(See current admins)

!!addadmin @NewModerator
(Grant bot admin access - saved and survives restarts)
```

## Quick Reference Card

```
INFORMATION           ADMIN ONLY
!!help               !!kick <id>
!!join               !!ban <id> [hrs] [reason]
!!status             !!unban <id>
!!players            !!announce <msg>
!!playercount        !!serverchat <msg> [color]
!!find <name>        !!addrole <admin|police> <id>
!!version            !!removerole <admin|police> <id>
!!deliveries         !!addadmin @user
!!housing            !!removeadmin @user
!!company [days]     !!testmapping <id>
!!banlist            !!apiraw <endpoint> [k=v ...]
!!admins
!!police
!!listadmins
!!playermapping
```

## FAQ

**Q: Do I need to choose between / and !! ?**
A: No! Use whichever you prefer at any time. Both work the same.

**Q: Are !! commands slower than / commands?**
A: Actually, !! commands are often faster! Slash commands need to register with Discord first.

**Q: Can I mix both types?**
A: Absolutely! Use `/status` one time and `!!players` the next.

**Q: Why won't `!!kick Jerry` work?**
A: Text commands take the `unique_id`, not the name. Run `!!find jerry` to get the ID, then `!!kick <id>`. (Slash commands autocomplete the name for you.)

**Q: Will !! commands show in everyone's chat?**
A: Yes, text commands are visible to everyone. Slash command responses can be private.

**Q: Do !! commands need special permissions?**
A: The bot needs "Read Messages" permission. You need the same admin permissions as slash commands.

**Q: Can I create my own !! commands?**
A: Not through Discord, but you can modify the bot code to add more commands.

**Q: What if I type !!! (three exclamation marks)?**
A: Won't work. Must be exactly `!!` (two exclamation marks).

**Q: Are arguments case-sensitive?**
A: Commands are not case-sensitive. Arguments like unique_id and colors depend on the command.

## Support

If you have issues with text commands:
1. Check the command spelling
2. Verify you have required permissions
3. Check bot has message permissions in channel
4. Try the slash command version as backup
5. Check console logs for errors
