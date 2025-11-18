# Player Mapping Guide

## Overview

Player Mapping allows you to associate server player unique IDs with friendly names or Discord usernames. This makes it easier to identify players in the `/players` command.

## Why Use Player Mapping?

### Benefits
- ✅ **Easy Identification** - See "Jerry" instead of just "Player_12345"
- ✅ **Discord Integration** - Associate game accounts with Discord users
- ✅ **Better Management** - Quickly identify who to kick/ban
- ✅ **Multiple Accounts** - Track players with multiple characters

### Example
**Without Mapping:**
```
Player_12345
ID: 12345
```

**With Mapping:**
```
Jerry (Player_12345)
ID: 12345
```

## How to Configure

### Step 1: Get Player IDs

Use the `/players` command to see online players and their unique IDs:
```
/players
```

You'll see something like:
```
Player_12345
ID: 12345

Player_67890
ID: 67890
```

### Step 2: Edit .env File

Add the `PLAYER_MAPPING` line to your `.env` file:

```env
PLAYER_MAPPING=12345:Jerry|67890:Bob|11111:Alice
```

### Format
```
unique_id:name|unique_id:name|unique_id:name
```

- **unique_id** - The player's unique ID from the server
- **:** - Separator between ID and name
- **name** - The friendly name OR a Discord User ID (17-19 digits)
- **|** - Separator between different mappings

### Discord User ID Integration

You can use Discord User IDs instead of names! The bot will automatically fetch and display the actual Discord username.

**Server Nickname Priority:**
- If the user has a **server nickname** (custom name in that Discord server), it will be shown
- If no server nickname, their **global Discord username** is shown
- This makes identification even easier for community members!

**How to get Discord User IDs:**
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click on a user's name/avatar
3. Select "Copy User ID"
4. Use that ID in your mapping

**Example:**
```env
PLAYER_MAPPING=12345:120343643381956608
```

**Will display as:**
- If user has server nickname "Jerry": `Jerry (InGameName)`
- If no nickname: `JerryTheGamer#1234 (InGameName)`

## Configuration Examples

### Simple Names
```env
PLAYER_MAPPING=12345:Jerry|67890:Bob the Builder|11111:Alice
```

### Discord User IDs (Recommended!)
```env
PLAYER_MAPPING=12345:120343643381956608|67890:987654321098765432
```
Bot will fetch and show: `Username#1234 (InGameName)`

### Mixed Format (Names + Discord IDs)
```env
PLAYER_MAPPING=12345:120343643381956608|67890:Bob|11111:Alice
```

### With Role Indicators
```env
PLAYER_MAPPING=12345:Jerry(Admin)|67890:120343643381956608|11111:Alice(VIP)
```

### Single Player
```env
PLAYER_MAPPING=12345:Jerry
```

### Many Players
```env
PLAYER_MAPPING=12345:Jerry|67890:Bob|11111:Alice|22222:Dave|33333:Eve|44444:Frank
```

## Viewing Mappings

### In Discord
Use the `/playermapping` command:
```
/playermapping
```

Or with text command:
```
!!playermapping
```

This shows:
- All current mappings
- Total number of mapped players
- How mappings appear in commands

### In Console
When the bot starts, you'll see:
```
Player mappings loaded: 3
Mapped players:
  12345 → Jerry
  67890 → Bob
  11111 → Alice
```

### In /players Command
**Without mapping:**
```
👥 Online Players (2)

Player_12345
ID: 12345
📍 X=100 Y=200 Z=50
```

**With name mapping:**
```
👥 Online Players (2)

Jerry (Player_12345)
ID: 12345
📍 X=100 Y=200 Z=50
```

**With Discord User ID (with nickname):**
```
👥 Online Players (2)

Jerry (Player_12345)
ID: 12345
📍 X=100 Y=200 Z=50
```

**With Discord User ID (no nickname):**
```
👥 Online Players (2)

JerryTheGamer#1234 (Player_12345)
ID: 12345
📍 X=100 Y=200 Z=50
```

### Format
- **Name mapping:** `MappedName (OriginalName)`
- **Discord ID with nickname:** `Nickname (OriginalName)`
- **Discord ID without nickname:** `DiscordUsername#1234 (OriginalName)`

The original name is always shown in parentheses so you can verify the correct player.

## Using Discord User IDs

### Why Use Discord User IDs?

**Benefits:**
- ✅ Automatic username updates (if Discord user changes name)
- ✅ Shows actual Discord tag (Username#1234)
- ✅ **Prioritizes server nicknames** - Shows the name they use in your Discord
- ✅ Perfect for community servers
- ✅ Easy to identify Discord members in-game

### Server Nickname Priority

When using Discord User IDs, the bot follows this priority **for each Discord server**:

1. **Server Nickname** (if set in that specific server) - Shows custom nickname in the Discord server where the command is used
2. **Discord Username** (fallback) - Shows global Discord username
3. **User ID** (error fallback) - Shows raw ID if user not found

**Important:** Nicknames are **server-specific**! The same user can have different nicknames in different Discord servers, and the bot will show the correct one for each server.

**Example Scenarios:**

In **Server A** - User has nickname "Jerry":
```
/players shows: Jerry (InGameName)
```

In **Server B** - Same user has nickname "Admin J":
```
/players shows: Admin J (InGameName)
```

In **Server C** - Same user has no nickname:
```
/players shows: JerryTheGamer#1234 (InGameName)
```

### How to Get Discord User IDs

1. **Enable Developer Mode**
   - Open Discord Settings
   - Go to "Advanced" or "App Settings → Advanced"
   - Enable "Developer Mode"

2. **Copy User ID**
   - Right-click on any user's name or avatar
   - Click "Copy User ID"
   - You'll get a number like: `120343643381956608`

3. **Add to Mapping**
   ```env
   PLAYER_MAPPING=12345:120343643381956608
   ```

### Discord ID vs Name Comparison

**Using Names:**
```env
PLAYER_MAPPING=12345:Jerry
```
- Displays as: `Jerry (Player_12345)`
- Manual entry
- Stays as you typed it
- Always the same

**Using Discord User IDs:**
```env
PLAYER_MAPPING=12345:120343643381956608
```
- Displays as: `Jerry (Player_12345)` if they have server nickname "Jerry"
- Or: `JerryTheGamer#1234 (Player_12345)` if no nickname
- Automatic Discord lookup
- Shows real Discord name/nickname
- Updates if they change Discord name or nickname
- **Prioritizes server nickname for easier recognition**

### Mixed Usage

You can mix both methods:
```env
PLAYER_MAPPING=12345:120343643381956608|67890:Bob|11111:Alice|22222:987654321012345678
```

- Player 12345: Shows Discord nickname (or username)
- Player 67890: Shows "Bob"
- Player 11111: Shows "Alice"
- Player 22222: Shows Discord nickname (or username)

### Multi-Server Support

If your bot is in **multiple Discord servers**, nicknames work correctly for each:

**Bot in 3 servers:**
- Server A: User has nickname "Jerry" → Shows "Jerry"
- Server B: User has nickname "Admin J" → Shows "Admin J"  
- Server C: User has no nickname → Shows "JerryTheGamer#1234"

The bot automatically detects which server the command is used in and shows the appropriate nickname for **that server**.

## How Mappings Appear

## Complete Example

### 1. Check who's online
```
/players
```

Output:
```
Player_12345 - ID: 12345
Player_67890 - ID: 67890
```

### 2. Get Discord User IDs
- Right-click on Jerry in Discord → Copy User ID → `120343643381956608`
- Right-click on Bob in Discord → Copy User ID → `987654321098765432`

### 3. Edit .env file
```env
PLAYER_MAPPING=12345:120343643381956608|67890:987654321098765432
```

### 4. Restart bot
```bash
npm start
```

### 5. Check console
```
Player mappings loaded: 2
Mapped players:
  12345 → Jerry (JerryTheGamer) (Discord User)
  67890 → Admin Bob (BobTheBuilder) (Discord User)
```
*Note: Shows "Nickname (Username)" if they have a server nickname*

### 6. Use /players again
```
/players
```

Now shows (with server nicknames):
```
Jerry (Player_12345) - ID: 12345
Admin Bob (Player_67890) - ID: 67890
```

Or (without nicknames):
```
JerryTheGamer#1234 (Player_12345) - ID: 12345
BobTheBuilder#5678 (Player_67890) - ID: 67890
```

### 7. View mappings anytime
```
/playermapping
```

Shows:
```
12345 → JerryTheGamer#1234 (Discord User)
67890 → BobTheBuilder#5678 (Discord User)
```

## Best Practices

### Naming Conventions

**Good Names:**
- `Jerry` - Simple and clear
- `Jerry (Admin)` - Shows role
- `@Jerry#1234` - Discord username
- `Jerry - Main Account` - Distinguishes accounts

**Avoid:**
- Very long names (keep under 30 characters)
- Special characters that might break formatting
- Duplicate names (makes identification harder)

### Maintenance

1. **Update regularly** - Add new players as they join
2. **Remove old entries** - Clean up inactive players
3. **Verify IDs** - Use `/players` to confirm unique IDs
4. **Document** - Keep a separate note of who maps to what

### Organization

**For small servers (< 10 players):**
```env
PLAYER_MAPPING=12345:Jerry|67890:Bob|11111:Alice
```

**For larger servers, consider grouping by role:**
```env
# Admins: Jerry, Bob
# Members: Alice, Dave, Eve
PLAYER_MAPPING=12345:Jerry(Admin)|67890:Bob(Admin)|11111:Alice|22222:Dave|33333:Eve
```

## Troubleshooting

### Mapping not showing
**Problem:** Names don't appear in `/players`
**Solutions:**
1. Check `.env` syntax - must be `unique_id:name|unique_id:name`
2. Restart the bot after editing `.env`
3. Verify unique IDs are correct with `/players`
4. Check console for "Player mappings loaded" message

### Wrong format error
**Problem:** Bot doesn't start or mappings not loaded
**Solutions:**
- Use `:` between ID and name (not `=` or space)
- Use `|` between different mappings (not `,` or `;`)
- No spaces around `:` or `|`
- Example: `12345:Jerry|67890:Bob` ✅
- Not: `12345 : Jerry | 67890 : Bob` ❌

### Some mappings work, others don't
**Problem:** Only some players show mapped names
**Solutions:**
- Check each unique_id is exactly as shown in `/players`
- IDs are case-sensitive (though usually just numbers)
- Ensure complete mapping pairs (both ID and name)

### How to find unique IDs
**Problem:** Don't know player's unique ID
**Solutions:**
1. Ask player to join server
2. Use `/players` to see their ID
3. Note the ID from the output
4. Add to `.env` file

## Advanced Usage

### Tracking Multiple Accounts
If a player has multiple characters:
```env
PLAYER_MAPPING=12345:Jerry-Main|98765:Jerry-Alt|55555:Jerry-Mining
```

### Role Indicators
Show player roles in mappings:
```env
PLAYER_MAPPING=12345:Jerry👑|67890:Bob🛡️|11111:Alice⭐
```

### Temporary Mappings
For testing or temporary players:
```env
# Regular players
PLAYER_MAPPING=12345:Jerry|67890:Bob
# Temporary: 99999:TestAccount (remove after testing)
```

## FAQ

**Q: Does the bot work in multiple Discord servers?**
A: Yes! The bot shows the correct nickname for each server. If a user has different nicknames in different servers, the bot shows the right one based on where the command is used.

**Q: Will it show server nicknames or Discord usernames?**
A: Server nicknames are prioritized for the specific Discord server where the command is used! If the user has a nickname in that server, it shows that. Otherwise, it shows their Discord username#tag.

**Q: What if someone changes their server nickname?**
A: The bot will automatically show the updated nickname next time `/players` is used. No need to update the .env file!

**Q: Can the same user have different nicknames in different servers?**
A: Absolutely! Discord allows users to have different nicknames in each server they're in. The bot will show the correct nickname for whichever server the command is used in.

**Q: Should I use names or Discord User IDs?**
A: Discord User IDs are recommended! They automatically show server nicknames (or Discord usernames) and update when users change them.

**Q: How do I know if it's working?**
A: Check the console when bot starts. Discord User IDs will show as "Nickname (Username) (Discord User)" or "Username#1234 (Discord User)". Also use `/playermapping` to verify.

**Q: What if the Discord user leaves the server?**
A: The bot can still fetch their username from Discord as long as the user exists on Discord. If the user ID is invalid, it will show the raw ID.

**Q: Can I use Discord user IDs in mappings?**
A: Yes! Just use the Discord User ID (17-19 digits) as the value. The bot will automatically fetch and display their Discord username.

**Q: Do I need to map all players?**
A: No, only map players you want to identify easily. Unmapped players show their normal names.

**Q: Can I change mappings while bot is running?**
A: You must restart the bot after editing `.env` for changes to take effect.

**Q: How many players can I map?**
A: No hard limit, but keep it reasonable (under 100 for performance).

**Q: What if two players have the same mapped name?**
A: Avoid this - it makes identification confusing. Use unique names or add identifiers.

**Q: Can I use emojis in mapped names?**
A: Yes! `12345:Jerry👑` works fine.

**Q: What characters are allowed in names?**
A: Most characters work: letters, numbers, spaces, dashes, parentheses, emojis. Avoid: pipes `|` and colons `:`

**Q: Do mappings affect kick/ban commands?**
A: No, you still use the unique_id for commands. Mappings are display-only.

**Q: Can I import/export mappings?**
A: Yes, the entire `PLAYER_MAPPING` line can be copied to other bots or backed up.

## Example Configurations

### Small Friend Group
```env
PLAYER_MAPPING=12345:Jerry|67890:Mike|11111:Sarah|22222:Tom
```

### Gaming Community
```env
PLAYER_MAPPING=12345:Jerry[Admin]|67890:Bob[Mod]|11111:Alice|22222:Dave|33333:Eve[VIP]
```

### Roleplay Server
```env
PLAYER_MAPPING=12345:Sheriff Jerry|67890:Mechanic Bob|11111:Doctor Alice
```

### Testing/Development
```env
PLAYER_MAPPING=12345:Main Account|67890:Test Account|11111:Dev Account
```

## Quick Reference

### Syntax
```
PLAYER_MAPPING=id:name|id:name|id:name
```

### Commands
- `/playermapping` - View current mappings
- `/players` - See mappings in action
- `!!playermapping` - Text command alternative

### Console Check
```
Player mappings loaded: X
Mapped players:
  id → name
```

### Display Format
```
MappedName (OriginalName)
ID: unique_id
```

## Support

Need help with player mapping?
1. Check console for "Player mappings loaded" message
2. Verify syntax in `.env` file
3. Use `/playermapping` to see what's loaded
4. Test with `/players` to see it in action
