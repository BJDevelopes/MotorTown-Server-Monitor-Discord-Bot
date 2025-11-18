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

### Add an Admin (Temporary)
```
/addadmin @username
```
- Adds a user as admin until bot restart
- You must be an existing admin to use this
- To make permanent: add their ID to .env

### Remove an Admin (Temporary)
```
/removeadmin @username
```
- Removes admin permissions until bot restart
- You must be an existing admin to use this
- Cannot remove yourself if you're the last admin
- To make permanent: remove their ID from .env

## Admin Commands

Only users in `ADMIN_USER_IDS` can use these commands:

| Command | Description |
|---------|-------------|
| `/kick` | Kick a player from the server |
| `/ban` | Ban a player temporarily or permanently |
| `/unban` | Remove a ban from a player |
| `/announce` | Send a server-wide announcement |
| `/serverchat` | Send a colored chat message |
| `/addadmin` | Add a bot admin (temporary) |
| `/removeadmin` | Remove a bot admin (temporary) |

## Public Commands

These commands can be used by anyone:

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/join` | Get instructions to join the server |
| `/status` | Server status overview |
| `/players` | List online players |
| `/playercount` | Number of players online |
| `/version` | Server version |
| `/deliveries` | Delivery site info |
| `/housing` | Housing information |
| `/banlist` | View banned players |
| `/admins` | List server admins |
| `/police` | List server police |
| `/listadmins` | List bot admins |

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

### Changes don't persist after restart

**Problem:** `/addadmin` and `/removeadmin` changes are temporary.

**Solution:**
- Edit the `.env` file directly to make permanent changes
- Add/remove User IDs from `ADMIN_USER_IDS`
- Restart the bot

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

**Q: What happens if I remove all admins?**
A: Admin commands will be unavailable to everyone. Add at least one admin to `.env`.

**Q: Can I use Discord role IDs instead of user IDs?**
A: No, the bot uses individual user IDs for security and simplicity.

**Q: Will non-admins see the admin commands?**
A: Yes, they'll see them in the command list, but they'll get a permission error if they try to use them.
