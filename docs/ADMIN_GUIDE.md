# Admin Setup Guide

## Quick Start

### 1. Get Your Discord User ID

1. Open Discord
2. Go to **Settings** → **Advanced** → Enable **Developer Mode**
3. Right-click your username anywhere in Discord
4. Click **Copy User ID**

### 2. Add Your User ID to .env

Edit your `.env` file and add your Discord User ID:

```env
ADMIN_USER_IDS=120343643381956608
```

**To add multiple admins, separate IDs with commas:**
```env
ADMIN_USER_IDS=120343643381956608,987654321098765432,123456789012345678
```

### 3. Restart the Bot

```bash
npm start
```

You should see in the console:
```
Admin users loaded: 1
Admin IDs: 120343643381956608
```

## Managing Admins

### View Current Admins
```
/listadmins
```
Shows all Discord users who have admin permissions.

### Add an Admin
```
/addadmin @username
```
- You must be an existing admin to use this
- **Saved to `admin_data.json` — it survives a restart.** No `.env` edit needed
- The bot also shows you the equivalent `ADMIN_USER_IDS` line if you'd rather bake it into `.env`

### Remove an Admin
```
/removeadmin @username
```
- You must be an existing admin to use this
- **Persistent** for admins that were added with `/addadmin`
- Cannot remove the last remaining admin
- If the user is listed in `ADMIN_USER_IDS` in `.env`, the removal only lasts until the next
  restart. The bot warns you when this happens — remove their ID from `.env` to make it permanent

## How Admin Storage Works

There are two sources of bot admins, and they're merged at startup:

| Source | File | Persistent? |
|--------|------|-------------|
| `ADMIN_USER_IDS` | `.env` | Yes — the base list, only editable by hand |
| `/addadmin` | `admin_data.json` (next to `bot.js`) | Yes — written automatically |

The rules:

- Anyone listed in **either** place can use admin commands.
- `/addadmin` writes to `admin_data.json` only, never to `.env`.
- `/removeadmin` can only permanently remove someone from `admin_data.json`. Removing someone
  who is listed in `.env` takes effect immediately but is undone on restart, because `.env` is
  re-read every time the bot starts.
- The last remaining admin can't be removed, so you can never lock yourself out.

> 💡 `admin_data.json` is created automatically. Back it up alongside your `.env`.

## Admin Commands

Only bot admins can use these commands:

| Command | Description |
|---------|-------------|
| `/kick` | Kick a player from the server |
| `/ban` | Ban a player temporarily or permanently |
| `/unban` | Remove a ban from a player |
| `/announce` | Send a server-wide announcement |
| `/serverchat` | Send a colored chat message |
| `/addrole` | Grant a player the in-game admin or police role |
| `/removerole` | Revoke a player's in-game admin or police role |
| `/addadmin` | Add a bot admin (persistent) |
| `/removeadmin` | Remove a bot admin (persistent) |
| `/testmapping` | Test a specific player mapping |
| `/apiraw` | Call any Web API endpoint directly and show the raw response |

`/kick`, `/ban`, `/unban`, `/addrole` and `/removerole` autocomplete player names from the live
server, so you can pick a player instead of hunting for their unique ID. `/unban` autocompletes
from the ban list.

## ⚠️ Bot Admins vs In-Game Roles

These are two completely different things, and mixing them up is the most common source of
confusion:

| | Bot admins | In-game roles |
|---|---|---|
| **Who** | Discord users | Motor Town players |
| **Grants** | Permission to run the bot's admin commands | Admin or police powers inside the game |
| **Stored in** | `ADMIN_USER_IDS` + `admin_data.json` | The game server itself |
| **Managed with** | `/addadmin`, `/removeadmin`, `/listadmins` | `/addrole`, `/removerole`, `/admins`, `/police` |

Making someone a bot admin gives them **no** in-game powers. Making someone an in-game admin
gives them **no** access to the bot's commands. Grant each one separately.

### In-Game Roles

```
/addrole admin 12345
/addrole police 12345
/removerole police 12345
```

Only `admin` and `police` are valid roles. The change is applied on the game server through its
Web API, so it applies to that player in-game regardless of whether they're in your Discord.
Use `/admins` and `/police` to see who currently holds each role.

### Raw API Access

```
/apiraw /player/list
/apiraw /company/profit days=7
```

`/apiraw` calls any Web API endpoint with a `GET` and prints the raw JSON response (truncated if
it's very long). It's the fastest way to check whether your dedicated server build supports a
given endpoint. Extra parameters are passed as `key=value` pairs; the `password` parameter is
always supplied by the bot and can't be overridden.

## Public Commands

These commands can be used by anyone:

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/join` | Get instructions to join the server |
| `/status` | Server status overview |
| `/players` | List online players |
| `/find` | Search for a player by name and get their ID |
| `/playercount` | Number of players online |
| `/version` | Server version |
| `/deliveries` | Delivery site info |
| `/housing` | Housing information |
| `/company` | Company profit figures |
| `/banlist` | View banned players |
| `/admins` | List in-game server admins |
| `/police` | List in-game server police |
| `/listadmins` | List bot admins |
| `/playermapping` | View player ID mappings |

## Security Tips

1. **Keep your .env file private** - Never share it or commit it to git
2. **Use strong API passwords** - Protect your game server
3. **Be selective with admins** - Only give access to trusted users
4. **Review regularly** - Use `/listadmins` to check who has access
5. **Backup your .env** - Keep a secure copy of your configuration

## Troubleshooting

### "You do not have permission to use this command"

**Problem:** You're not in the admin list.

**Solution:**
1. Check your Discord User ID is correct in `.env`
2. Make sure there are no spaces in the `ADMIN_USER_IDS` list
3. Restart the bot after editing `.env`
4. Verify your ID appears in the console on startup

### Can't add admins with /addadmin

**Problem:** Only existing admins can add other admins.

**Solution:**
1. Make sure your Discord User ID is in the `.env` file
2. Restart the bot
3. Try the command again

### A removed admin is back after a restart

**Problem:** The user is listed in `ADMIN_USER_IDS` in your `.env`, which is re-read on every
start. `/removeadmin` can't edit `.env` for you.

**Solution:**
1. Open `.env` and delete their ID from `ADMIN_USER_IDS`
2. Restart the bot
3. Confirm with `/listadmins`

### An added admin disappeared after a restart

**Problem:** `/addadmin` writes to `admin_data.json` next to `bot.js`. If that file can't be
written, the addition is lost.

**Solution:**
1. Check the console for `Failed to save admins:`
2. Make sure the bot's folder is writable and `admin_data.json` isn't read-only
3. As a fallback, add the ID to `ADMIN_USER_IDS` in `.env` by hand

### "Cannot remove the last remaining admin"

**Problem:** The bot refuses to leave you with zero admins, since that would lock everyone out
of admin commands.

**Solution:** add another admin first with `/addadmin`, then remove the original.

## Example Configuration

### Single Admin
```env
ADMIN_USER_IDS=120343643381956608
```

### Multiple Admins
```env
ADMIN_USER_IDS=120343643381956608,987654321098765432,456789012345678901
```

### Getting User IDs for Multiple People

1. Enable Developer Mode in Discord
2. Right-click each person's username
3. Click "Copy User ID"
4. Add all IDs to `.env` separated by commas
5. No spaces between IDs!

## FAQ

**Q: Can I have unlimited admins?**
A: Yes, add as many Discord User IDs as you need.

**Q: Do admins need any special Discord permissions?**
A: No, the bot checks Discord User IDs only. Discord server roles don't matter.

**Q: Do `/addadmin` and `/removeadmin` survive a restart?**
A: Yes. Additions are saved to `admin_data.json`. Removals are permanent too — unless the user
is listed in `ADMIN_USER_IDS` in `.env`, in which case you have to edit `.env` to make it stick.

**Q: What happens if I remove all admins?**
A: You can't — the bot refuses to remove the last remaining admin. If you empty
`ADMIN_USER_IDS` and delete `admin_data.json` by hand, admin commands become unavailable to
everyone until you add an ID back to `.env`.

**Q: Does `/addadmin` give someone in-game admin powers?**
A: No. That's `/addrole admin <unique_id>`. Bot admins and in-game roles are separate.

**Q: Can I use Discord role IDs instead of user IDs?**
A: No, the bot uses individual user IDs for security and simplicity.

**Q: Will non-admins see the admin commands?**
A: Yes, they'll see them in the command list, but they'll get a permission error if they try to use them.
