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
- ✅ **Same Features** - All commands work identically

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
List all online players with details
```
!!players
```

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

### 🔒 Admin Commands

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

!!ban 12345 0 Toxic behavior
(Permanent ban with reason - use 0 or omit hours)
```

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

#### `!!addadmin`
Add a Discord user as bot admin (temporary)
```
!!addadmin @user

Example:
!!addadmin @JohnDoe
```

#### `!!removeadmin`
Remove a Discord user from bot admins (temporary)
```
!!removeadmin @user

Example:
!!removeadmin @JohnDoe
```

## Comparison: Slash vs Text Commands

| Feature | Slash Commands (`/`) | Text Commands (`!!`) |
|---------|---------------------|----------------------|
| **Speed** | Can be slow to load | Instant |
| **Autocomplete** | Yes | No |
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
!!players          (Get unique_id)
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
❌ Wrong:    !!addadmin 123456789
```

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
!!players
(Note the troublemaker's unique_id)

!!kick 12345
(If they rejoin and continue)

!!ban 12345 48 Continued harassment
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
(Give temporary access)
```

## Quick Reference Card

```
INFORMATION           ADMIN ONLY
!!help               !!kick <id>
!!join               !!ban <id> [hrs] [reason]
!!status             !!unban <id>
!!players            !!announce <msg>
!!playercount        !!serverchat <msg> [color]
!!version            !!addadmin @user
!!deliveries         !!removeadmin @user
!!housing
!!banlist
!!admins
!!police
!!listadmins
```

## FAQ

**Q: Do I need to choose between / and !! ?**
A: No! Use whichever you prefer at any time. Both work the same.

**Q: Are !! commands slower than / commands?**
A: Actually, !! commands are often faster! Slash commands need to register with Discord first.

**Q: Can I mix both types?**
A: Absolutely! Use `/status` one time and `!!players` the next.

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
