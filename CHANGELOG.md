# Changelog

## Version 2.0.0 - Audit, Fixes & Modern API Support

### 🐛 Bug Fixes
- **Fixed "Invalid password" on `/announce`, `/serverchat`, `/kick`, `/ban` and `/unban`**
  ([#1](https://github.com/BJDevelopes/motortown-discord-bot/issues/1)) - The Motor Town Web API
  reads every parameter from the query string, including on POST requests. Version 1.6.0 moved
  POST parameters into a form-encoded request body, so the server saw no password at all and
  rejected every write command. All POST endpoints now send parameters as query parameters again,
  with axios handling the encoding (which also fixes the spaces-in-messages issue 1.6.0 was
  originally trying to solve).
- **Fixed the server monitor never refreshing** - The 60-second interval only updated the bot's
  activity status; the dashboard embed was drawn once at startup and then left stale forever,
  despite its footer promising otherwise.
- **Fixed API passwords containing special characters** - The monitor built request URLs by string
  interpolation, so a password containing `&`, `#`, `+` or a space silently failed to authenticate
  while the rest of the bot worked. The monitor now goes through the shared, properly-encoded API layer.
- **Fixed crashes on busy servers** - `/players`, `/housing`, `/banlist`, `/admins` and `/police`
  added one embed field per entry with no limit, so the 26th entry exceeded Discord's 25-field cap
  and the command failed outright. These now render compact lists that fit Discord's limits and
  report anything that didn't fit.
- **Fixed `!!ban <id> <reason>` dropping the reason** - The text-command parser assumed the reason
  always started at the third argument, so omitting the optional duration silently discarded it.
- **Fixed `!!addadmin` / `!!removeadmin` failing on uncached users** - Now resolves users through
  Discord's mention parser instead of a cache lookup, and reports clearly when no user was found.
- **Fixed the bot loading no configuration when started from another directory** - `.env` is now
  read relative to `bot.js` rather than the current working directory.

### ✨ New Features
- **Player name autocomplete** - `/kick`, `/ban`, `/unban`, `/addrole` and `/removerole` suggest
  players as you type, so admins never have to copy unique IDs by hand. `/unban` autocompletes from
  the ban list. Results are cached for a few seconds to avoid hammering the game server.
- **`/find <name>`** - Search online players by full or partial name and get their unique ID.
- **`/addrole` and `/removerole`** - Grant and revoke in-game admin/police roles, using the
  `/player/role/add` and `/player/role/remove` endpoints the bot previously never called.
- **Player join/leave feed** - Optional `PLAYER_FEED_CHANNEL_ID` posts when players connect and
  disconnect. It stays silent while the server is unreachable rather than reporting a mass exodus,
  and doesn't announce the existing roster after a restart.
- **`/company [days]`** - Reads company profit figures from the `/company/profit` endpoint added in
  a 2026 server update, degrading gracefully on older server builds.
- **`/apiraw <endpoint> [key=value ...]`** - Admin-only raw Web API access, so new endpoints from
  future game updates can be explored without waiting for a bot update.
- **AFK and autopilot indicators** in `/players`, using fields added to `/player/list` in the
  0.7.19 server update. Older servers simply show no badge.
- **Daily peak player count** in the server monitor dashboard.
- **Persistent bot admins** - Admins added with `/addadmin` are saved to `admin_data.json` and now
  survive a restart instead of being silently lost.
- **Configurable refresh intervals** - `MONITOR_INTERVAL` and `PLAYER_FEED_INTERVAL`.

### 🔒 Security
- **Removed the hardcoded game server name and join password from the source** - `/join` now reads
  `JOIN_SERVER_NAME`, `JOIN_PASSWORD` and `JOIN_LINK` from the environment. If you ran a previous
  version, rotate your server password: it was published in this repository.
- Documented that the Web API is unencrypted and should never be exposed to the public internet,
  replacing the previous advice to open the port in your firewall.
- `.gitignore` now covers all `.env.*` files and the runtime state files, and `monitor_data.json`
  is no longer tracked in git.

### 🔧 Technical Changes
- Startup now validates required configuration and exits with a readable message listing exactly
  what is missing, instead of failing later with a cryptic Discord error.
- API errors are translated into actionable messages (unreachable host, DNS failure, timeout)
  rather than surfacing raw error codes.
- Request timeouts are configurable via `API_TIMEOUT` and applied to every call.
- Migrated to non-deprecated discord.js APIs: `MessageFlags.Ephemeral` instead of `ephemeral: true`,
  and `Events.*` constants instead of raw event-name strings.
- Added `unhandledRejection`, client error, and SIGINT/SIGTERM handlers so transient failures no
  longer take the bot down silently.
- Failed slash-command registration no longer prevents the bot from starting.
- Player coordinates are formatted for readability instead of printing raw Unreal vectors.
- Dependencies updated (discord.js 14.27, axios 1.19, dotenv 17.4); Node 18+ is now required.

### 📝 Configuration Changes
- New optional variables: `JOIN_SERVER_NAME`, `JOIN_PASSWORD`, `JOIN_LINK`,
  `PLAYER_FEED_CHANNEL_ID`, `PLAYER_FEED_INTERVAL`, `MONITOR_INTERVAL`, `API_TIMEOUT`
- Removed unused `MONITOR_MESSAGE_ID` (the monitor has managed its own message ID since 1.7)
- `CHAT_CHANNEL_ID` remains reserved: the Web API still provides no way to read in-game chat

---

## Version 1.6.0 - Dynamic Status & Chat Fixes

### ✨ New Features
- **Dynamic Bot Status** - Shows live player count (e.g., "5 players online")
- **Auto-updating Status** - Refreshes every 60 seconds
- **Chat Channel Integration** - Optional `CHAT_CHANNEL_ID` for future in-game chat mirroring

### 🐛 Bug Fixes
- **Fixed spaces in announce/serverchat** - Messages with spaces now send correctly
- **Fixed URL encoding** - POST requests now properly encode parameters
- Messages like "test message" no longer appear as "test+message"

### 🔧 Technical Changes
- Updated `apiCall()` function to use proper form encoding for POST requests
- Added `updateBotStatus()` function with interval timer
- Added `sendChatToDiscord()` function (prepared for future API updates)
- Changed from query parameters to request body for POST endpoints
- Added URLSearchParams for proper form encoding

### 📝 Configuration Changes
- New optional variable: `CHAT_CHANNEL_ID` in `.env`
- Bot status now shows player count instead of static "Playing Motortown"

### 📚 Documentation Updates
- Updated README.md with new features
- Updated CONFIGURATION.md with CHAT_CHANNEL_ID details
- Updated .env.example with chat channel configuration

---

## Version 1.5.2 - Server Nickname Priority

### ✨ New Features
- **Server Nickname Priority** - Bot now shows Discord server nicknames when available
- **Per-Server Nicknames** - Correctly shows different nicknames in different Discord servers
- **Better User Recognition** - Uses the name people know them by in each Discord community
- **Automatic Detection** - No configuration needed, works automatically per server
- **Fallback System** - Shows Discord username if no nickname set

### 🎯 How It Works

**Priority order (per Discord server):**
1. **Server Nickname** (if user has one in that specific Discord server)
2. **Discord Username** (if no nickname in that server)
3. **User ID** (if user not found)

**Multi-Server Example:**

Same player, different servers:
- Server A (nickname "Jerry"): Shows `Jerry (InGameName)`
- Server B (nickname "Admin J"): Shows `Admin J (InGameName)`
- Server C (no nickname): Shows `JerryTheGamer#1234 (InGameName)`

### 💡 Why This Matters

- ✅ Shows names people actually use in your community
- ✅ Easier to identify community members
- ✅ More natural and familiar
- ✅ No extra configuration needed

### 📝 Changes
- Updated `getPlayerDisplayName()` to check for server nicknames
- Enhanced guild member lookup with error handling
- Updated console logging to show nicknames
- Improved `/playermapping` display with nickname info
- Pass guild ID through command handlers

### 🔧 Technical Details
- Fetches guild member object from cache
- Checks `member.nickname` property
- Falls back gracefully if member not in guild
- Async handling for member lookups
- Works across multiple servers

### 📚 Documentation Updates
- Updated PLAYER_MAPPING.md with nickname priority section
- Enhanced examples showing nickname vs username
- Updated README.md with nickname info
- Updated CONFIGURATION.md with display formats

---

## Version 1.5.1 - Discord User ID Support in Player Mapping

### ✨ New Features
- **Discord User ID Integration** - Use Discord User IDs in player mappings
- **Automatic Username Lookup** - Bot fetches actual Discord usernames
- **Real-time Display** - Shows `Username#1234 (InGameName)` format
- **Mixed Mapping Support** - Combine names and Discord IDs in same config

### 🎯 How It Works

**Configuration:**
```env
PLAYER_MAPPING=12345:120343643381956608|67890:Bob
```

**What you see:**
```
JerryTheGamer#1234 (Player_12345)  ← Discord User ID
Bob (Player_67890)                  ← Custom name
```

### 💡 Getting Discord User IDs
1. Enable Developer Mode in Discord
2. Right-click any user → Copy User ID
3. Use that 17-19 digit number in mapping

### 📝 Changes
- Updated `getPlayerDisplayName()` to detect and fetch Discord users
- Enhanced console logging to show Discord usernames
- Improved `/playermapping` command to display user types
- Automatic fallback if Discord user not found

### 🔧 Technical Details
- Detects Discord User IDs by checking for 17-19 digit numbers
- Uses `client.users.fetch()` to get Discord user info
- Async handling for username lookups
- Error handling if user ID is invalid

### 📚 Documentation Updates
- Updated `.env.example` with Discord User ID examples
- Enhanced PLAYER_MAPPING.md with Discord ID section
- Added "Using Discord User IDs" guide
- Updated README.md configuration examples
- Updated CONFIGURATION.md variable documentation

### ✅ Benefits
- Automatic username updates (if Discord user changes name)
- Perfect for community servers
- Easy Discord-to-game identification
- No manual username entry needed

---

## Version 1.5.0 - Player Mapping System

### ✨ New Features
- **Player ID Mapping** - Associate server player IDs with friendly names
- **Easy Configuration** - Set mappings in `.env` file
- **Display Integration** - Mapped names appear in `/players` command
- **Mapping Command** - View current mappings with `/playermapping`
- **Console Output** - See loaded mappings on bot startup

### 🎯 Player Mapping Format
```env
PLAYER_MAPPING=12345:Jerry|67890:Bob|11111:Alice
```

**How it appears:**
```
Before: Player_12345
After:  Jerry (Player_12345)
```

### 💡 Use Cases
- Map player IDs to Discord usernames
- Track players with multiple characters
- Identify players easier for moderation
- Associate friendly names with game accounts

### 📝 Commands
- `/playermapping` or `!!playermapping` - View all current mappings
- Mappings automatically appear in `/players` command

### 📚 Documentation
- Created **PLAYER_MAPPING.md** - Comprehensive mapping guide
- Updated `.env.example` with mapping examples
- Updated README.md with mapping section
- Updated CONFIGURATION.md with mapping variable

### 🔧 Technical
- Map stored in memory on bot startup
- Helper function `getPlayerDisplayName()` for consistent display
- Console logging shows loaded mappings
- Format: `MappedName (OriginalName)`

---

## Version 1.4.0 - Text Commands & Bot Status

### ✨ New Features
- **Text Command Support** - All commands now work with `!!` prefix as backup
- **Bot Activity Status** - Bot shows "Playing Motortown" status
- **Dual Command System** - Use `/` slash commands or `!!` text commands
- **Instant Response** - Text commands work immediately without waiting for Discord registration

### 🎯 Command Examples
```
Slash:  /status    or    Text: !!status
Slash:  /players   or    Text: !!players
Slash:  /kick 123  or    Text: !!kick 123
```

### 💡 Why Text Commands?
- Works immediately when bot joins new servers
- Faster when slash commands are slow to load
- Always available as backup option
- Same permissions and features as slash commands

### 📝 Changes
- Bot now displays "Playing Motortown" in Discord status
- Help command updated to mention `!!` prefix option
- Added usage hints for text commands
- All commands fully compatible with both methods

### 📚 Documentation Updates
- Updated README.md with dual command system
- Updated QUICKSTART.md with `!!` examples
- Created TEXT_COMMANDS.md - comprehensive text command guide
- Updated help embed with prefix tips

### 🔧 Technical Changes
- Added `messageCreate` event handler for `!!` prefix
- Mock interaction system for command compatibility
- Activity status set on bot ready
- Proper argument parsing for text commands

---

## Version 1.3.0 - Join Command

### ✨ New Features
- Added `/join` command with step-by-step server connection instructions
- Beautiful embed showing how to find and connect to the server
- Includes server name (**Bjs Town**) and password (`jerry`)
- Quick reference section for easy access to connection details

### 📝 Changes
- Updated `/help` command to include `/join`
- Added join instructions to all documentation

### 📚 Documentation Updates
- Updated README.md with `/join` command
- Updated QUICKSTART.md test commands
- Updated ADMIN_GUIDE.md public commands list
- Updated COMMANDS.md with detailed join instructions

---

## Version 1.2.0 - Help Command

### ✨ New Features
- Added `/help` command to display all available commands
- Help command shows different information based on user's admin status
- Includes tips for using commands effectively
- Shows server connection information

### 📝 Changes
- Non-admin users see restricted admin commands with explanation
- Admin users see full command descriptions with access confirmation

### 📚 Documentation Updates
- Updated README.md with `/help` command
- Updated QUICKSTART.md test commands
- Updated ADMIN_GUIDE.md public commands list

---

## Version 1.1.0 - Bot Nickname Support

### ✨ New Features
- Added `BOT_NICKNAME` environment variable to customize bot's display name
- Bot automatically sets nickname in all servers on startup
- Bot sets nickname when joining new servers
- Console logging for nickname changes

### 📝 Configuration Changes
- New optional variable: `BOT_NICKNAME` in `.env`
- Example: `BOT_NICKNAME=Server Monitor`
- Leave empty to use default bot username

### 📚 Documentation Updates
- Updated `.env.example` with `BOT_NICKNAME`
- Updated README.md with nickname configuration
- Updated QUICKSTART.md with nickname setup
- Added troubleshooting for nickname issues
- Created CONFIGURATION.md reference guide

### ⚠️ Requirements
- Bot needs "Change Nickname" permission in Discord servers
- Bot's role must be positioned appropriately in role hierarchy

---

## Version 1.0.0 - Initial Release with Admin System

### 🎮 Core Features

#### Server Monitoring
- `/status` - Complete server status overview
- `/playercount` - Quick player count check
- `/players` - Detailed player list with locations and vehicles
- `/version` - Server version information
- `/deliveries` - Delivery site and cargo information
- `/housing` - Housing ownership and expiration details

#### Player Management (Admin Only)
- `/kick <unique_id>` - Remove players from server
- `/ban <unique_id> [hours] [reason]` - Ban players temporarily or permanently
- `/unban <unique_id>` - Remove player bans
- `/banlist` - View all banned players

#### Role Information
- `/admins` - List server administrators
- `/police` - List server police officers

#### Communication (Admin Only)
- `/announce <message>` - Send server-wide announcements
- `/serverchat <message> [color]` - Send colored chat messages

### 🔒 Admin System

#### Access Control
- Discord User ID-based permission system
- Configurable via `ADMIN_USER_IDS` environment variable
- Default admin: `120343643381956608`
- Support for multiple admins (comma-separated)

#### Admin Management Commands
- `/listadmins` - View current bot admins
- `/addadmin <user>` - Add temporary bot admin (requires existing admin)
- `/removeadmin <user>` - Remove temporary bot admin (requires existing admin)

#### Protected Commands
Only admins can execute:
- `/kick`
- `/ban`
- `/unban`
- `/announce`
- `/serverchat`
- `/addadmin`
- `/removeadmin`

### 🛠️ Technical Features

#### API Integration
- Full integration with game server Web API
- Automatic password authentication
- Error handling and validation
- Configurable host and port

#### Discord Features
- Modern slash commands
- Rich embed responses
- Ephemeral error messages for unauthorized access
- Automatic command registration
- Console logging

### 📋 Configuration

#### Required Environment Variables
- `DISCORD_TOKEN` - Discord bot token
- `CLIENT_ID` - Discord application ID
- `API_HOST` - Game server IP/hostname
- `API_PASSWORD` - Web API password
- `ADMIN_USER_IDS` - Comma-separated Discord User IDs

#### Optional Environment Variables
- `API_PORT` - Web API port (default: 8080)
- `BOT_NICKNAME` - Custom bot nickname (added in v1.1.0)

### 📚 Documentation

#### Included Guides
- **README.md** - Complete setup and feature documentation
- **QUICKSTART.md** - 5-minute setup guide
- **ADMIN_GUIDE.md** - Detailed admin system documentation
- **CONFIGURATION.md** - Complete configuration reference (added in v1.1.0)
- **.env.example** - Configuration template

### 🔧 Setup Requirements

#### Discord Requirements
- Discord Bot Token
- Application Client ID
- Bot invited with proper permissions:
  - Send Messages
  - Use Slash Commands
  - Embed Links
  - Change Nickname (for nickname feature)

#### Server Requirements
- Game server with Web API enabled
- `bEnableHostWebAPIServer: true`
- Configured password and port
- Port opened in firewall

#### System Requirements
- Node.js v16.9.0 or higher
- npm (included with Node.js)

### 📦 Dependencies
- `discord.js` ^14.14.1 - Discord API wrapper
- `axios` ^1.6.5 - HTTP client for API calls
- `dotenv` ^16.3.1 - Environment variable management

### 🔐 Security Features
- Environment variable based configuration
- `.gitignore` configured to protect secrets
- User ID based admin authentication
- API password protection
- Permission checking on all admin commands

### 🎯 Future Considerations
- Potential role-based permissions
- Enhanced delivery tracking
- Player statistics
- Scheduled announcements
- Multi-language support
- Web dashboard

---

## Installation Summary

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start bot
npm start
```

## Support & Documentation

- Check README.md for full feature list
- See QUICKSTART.md for quick setup
- See ADMIN_GUIDE.md for admin system details
- See CONFIGURATION.md for all configuration options
- Console logs provide runtime information
- Use `/listadmins` to verify admin configuration

## Known Limitations

- Admin changes via `/addadmin` and `/removeadmin` are temporary (reset on restart)
- Bot must have appropriate permissions to set nickname
- Slash commands may take 1-2 minutes to register in Discord
- Delivery site list limited to 10 entries due to Discord embed limits

## Contributing

Feel free to:
- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests

## License

MIT License - Free to use and modify

## Version 1.5.2 - Server Nickname Priority

### ✨ New Features
- **Server Nickname Priority** - Bot now shows Discord server nicknames when available
- **Per-Server Nicknames** - Correctly shows different nicknames in different Discord servers
- **Better User Recognition** - Uses the name people know them by in each Discord community
- **Automatic Detection** - No configuration needed, works automatically per server
- **Fallback System** - Shows Discord username if no nickname set

### 🎯 How It Works

**Priority order (per Discord server):**
1. **Server Nickname** (if user has one in that specific Discord server)
2. **Discord Username** (if no nickname in that server)
3. **User ID** (if user not found)

**Multi-Server Example:**

Same player, different servers:
- Server A (nickname "Jerry"): Shows `Jerry (InGameName)`
- Server B (nickname "Admin J"): Shows `Admin J (InGameName)`
- Server C (no nickname): Shows `JerryTheGamer#1234 (InGameName)`

### 💡 Why This Matters

- ✅ Shows names people actually use in your community
- ✅ Easier to identify community members
- ✅ More natural and familiar
- ✅ No extra configuration needed

### 📝 Changes
- Updated `getPlayerDisplayName()` to check for server nicknames
- Enhanced guild member lookup with error handling
- Updated console logging to show nicknames
- Improved `/playermapping` display with nickname info
- Pass guild ID through command handlers

### 🔧 Technical Details
- Fetches guild member object from cache
- Checks `member.nickname` property
- Falls back gracefully if member not in guild
- Async handling for member lookups
- Works across multiple servers

### 📚 Documentation Updates
- Updated PLAYER_MAPPING.md with nickname priority section
- Enhanced examples showing nickname vs username
- Updated README.md with nickname info
- Updated CONFIGURATION.md with display formats

---

## Version 1.5.1 - Discord User ID Support in Player Mapping

### ✨ New Features
- **Discord User ID Integration** - Use Discord User IDs in player mappings
- **Automatic Username Lookup** - Bot fetches actual Discord usernames
- **Real-time Display** - Shows `Username#1234 (InGameName)` format
- **Mixed Mapping Support** - Combine names and Discord IDs in same config

### 🎯 How It Works

**Configuration:**
```env
PLAYER_MAPPING=12345:120343643381956608|67890:Bob
```

**What you see:**
```
JerryTheGamer#1234 (Player_12345)  ← Discord User ID
Bob (Player_67890)                  ← Custom name
```

### 💡 Getting Discord User IDs
1. Enable Developer Mode in Discord
2. Right-click any user → Copy User ID
3. Use that 17-19 digit number in mapping

### 📝 Changes
- Updated `getPlayerDisplayName()` to detect and fetch Discord users
- Enhanced console logging to show Discord usernames
- Improved `/playermapping` command to display user types
- Automatic fallback if Discord user not found

### 🔧 Technical Details
- Detects Discord User IDs by checking for 17-19 digit numbers
- Uses `client.users.fetch()` to get Discord user info
- Async handling for username lookups
- Error handling if user ID is invalid

### 📚 Documentation Updates
- Updated `.env.example` with Discord User ID examples
- Enhanced PLAYER_MAPPING.md with Discord ID section
- Added "Using Discord User IDs" guide
- Updated README.md configuration examples
- Updated CONFIGURATION.md variable documentation

### ✅ Benefits
- Automatic username updates (if Discord user changes name)
- Perfect for community servers
- Easy Discord-to-game identification
- No manual username entry needed

---

## Version 1.5.0 - Player Mapping System

### ✨ New Features
- **Player ID Mapping** - Associate server player IDs with friendly names
- **Easy Configuration** - Set mappings in `.env` file
- **Display Integration** - Mapped names appear in `/players` command
- **Mapping Command** - View current mappings with `/playermapping`
- **Console Output** - See loaded mappings on bot startup

### 🎯 Player Mapping Format
```env
PLAYER_MAPPING=12345:Jerry|67890:Bob|11111:Alice
```

**How it appears:**
```
Before: Player_12345
After:  Jerry (Player_12345)
```

### 💡 Use Cases
- Map player IDs to Discord usernames
- Track players with multiple characters
- Identify players easier for moderation
- Associate friendly names with game accounts

### 📝 Commands
- `/playermapping` or `!!playermapping` - View all current mappings
- Mappings automatically appear in `/players` command

### 📚 Documentation
- Created **PLAYER_MAPPING.md** - Comprehensive mapping guide
- Updated `.env.example` with mapping examples
- Updated README.md with mapping section
- Updated CONFIGURATION.md with mapping variable

### 🔧 Technical
- Map stored in memory on bot startup
- Helper function `getPlayerDisplayName()` for consistent display
- Console logging shows loaded mappings
- Format: `MappedName (OriginalName)`

---

## Version 1.4.0 - Text Commands & Bot Status

### ✨ New Features
- **Text Command Support** - All commands now work with `!!` prefix as backup
- **Bot Activity Status** - Bot shows "Playing Motortown" status
- **Dual Command System** - Use `/` slash commands or `!!` text commands
- **Instant Response** - Text commands work immediately without waiting for Discord registration

### 🎯 Command Examples
```
Slash:  /status    or    Text: !!status
Slash:  /players   or    Text: !!players
Slash:  /kick 123  or    Text: !!kick 123
```

### 💡 Why Text Commands?
- Works immediately when bot joins new servers
- Faster when slash commands are slow to load
- Always available as backup option
- Same permissions and features as slash commands

### 📝 Changes
- Bot now displays "Playing Motortown" in Discord status
- Help command updated to mention `!!` prefix option
- Added usage hints for text commands
- All commands fully compatible with both methods

### 📚 Documentation Updates
- Updated README.md with dual command system
- Updated QUICKSTART.md with `!!` examples
- Created TEXT_COMMANDS.md - comprehensive text command guide
- Updated help embed with prefix tips

### 🔧 Technical Changes
- Added `messageCreate` event handler for `!!` prefix
- Mock interaction system for command compatibility
- Activity status set on bot ready
- Proper argument parsing for text commands

---

## Version 1.3.0 - Join Command

### ✨ New Features
- Added `/join` command with step-by-step server connection instructions
- Beautiful embed showing how to find and connect to the server
- Includes server name (**Bjs Town**) and password (`jerry`)
- Quick reference section for easy access to connection details

### 📝 Changes
- Updated `/help` command to include `/join`
- Added join instructions to all documentation

### 📚 Documentation Updates
- Updated README.md with `/join` command
- Updated QUICKSTART.md test commands
- Updated ADMIN_GUIDE.md public commands list
- Updated COMMANDS.md with detailed join instructions

---

## Version 1.2.0 - Help Command

### ✨ New Features
- Added `/help` command to display all available commands
- Help command shows different information based on user's admin status
- Includes tips for using commands effectively
- Shows server connection information

### 📝 Changes
- Non-admin users see restricted admin commands with explanation
- Admin users see full command descriptions with access confirmation

### 📚 Documentation Updates
- Updated README.md with `/help` command
- Updated QUICKSTART.md test commands
- Updated ADMIN_GUIDE.md public commands list

---

## Version 1.1.0 - Bot Nickname Support

### ✨ New Features
- Added `BOT_NICKNAME` environment variable to customize bot's display name
- Bot automatically sets nickname in all servers on startup
- Bot sets nickname when joining new servers
- Console logging for nickname changes

### 📝 Configuration Changes
- New optional variable: `BOT_NICKNAME` in `.env`
- Example: `BOT_NICKNAME=Server Monitor`
- Leave empty to use default bot username

### 📚 Documentation Updates
- Updated `.env.example` with `BOT_NICKNAME`
- Updated README.md with nickname configuration
- Updated QUICKSTART.md with nickname setup
- Added troubleshooting for nickname issues
- Created CONFIGURATION.md reference guide

### ⚠️ Requirements
- Bot needs "Change Nickname" permission in Discord servers
- Bot's role must be positioned appropriately in role hierarchy

---

## Version 1.0.0 - Initial Release with Admin System

### 🎮 Core Features

#### Server Monitoring
- `/status` - Complete server status overview
- `/playercount` - Quick player count check
- `/players` - Detailed player list with locations and vehicles
- `/version` - Server version information
- `/deliveries` - Delivery site and cargo information
- `/housing` - Housing ownership and expiration details

#### Player Management (Admin Only)
- `/kick <unique_id>` - Remove players from server
- `/ban <unique_id> [hours] [reason]` - Ban players temporarily or permanently
- `/unban <unique_id>` - Remove player bans
- `/banlist` - View all banned players

#### Role Information
- `/admins` - List server administrators
- `/police` - List server police officers

#### Communication (Admin Only)
- `/announce <message>` - Send server-wide announcements
- `/serverchat <message> [color]` - Send colored chat messages

### 🔒 Admin System

#### Access Control
- Discord User ID-based permission system
- Configurable via `ADMIN_USER_IDS` environment variable
- Default admin: `120343643381956608`
- Support for multiple admins (comma-separated)

#### Admin Management Commands
- `/listadmins` - View current bot admins
- `/addadmin <user>` - Add temporary bot admin (requires existing admin)
- `/removeadmin <user>` - Remove temporary bot admin (requires existing admin)

#### Protected Commands
Only admins can execute:
- `/kick`
- `/ban`
- `/unban`
- `/announce`
- `/serverchat`
- `/addadmin`
- `/removeadmin`

### 🛠️ Technical Features

#### API Integration
- Full integration with game server Web API
- Automatic password authentication
- Error handling and validation
- Configurable host and port

#### Discord Features
- Modern slash commands
- Rich embed responses
- Ephemeral error messages for unauthorized access
- Automatic command registration
- Console logging

### 📋 Configuration

#### Required Environment Variables
- `DISCORD_TOKEN` - Discord bot token
- `CLIENT_ID` - Discord application ID
- `API_HOST` - Game server IP/hostname
- `API_PASSWORD` - Web API password
- `ADMIN_USER_IDS` - Comma-separated Discord User IDs

#### Optional Environment Variables
- `API_PORT` - Web API port (default: 8080)
- `BOT_NICKNAME` - Custom bot nickname (added in v1.1.0)

### 📚 Documentation

#### Included Guides
- **README.md** - Complete setup and feature documentation
- **QUICKSTART.md** - 5-minute setup guide
- **ADMIN_GUIDE.md** - Detailed admin system documentation
- **CONFIGURATION.md** - Complete configuration reference (added in v1.1.0)
- **.env.example** - Configuration template

### 🔧 Setup Requirements

#### Discord Requirements
- Discord Bot Token
- Application Client ID
- Bot invited with proper permissions:
  - Send Messages
  - Use Slash Commands
  - Embed Links
  - Change Nickname (for nickname feature)

#### Server Requirements
- Game server with Web API enabled
- `bEnableHostWebAPIServer: true`
- Configured password and port
- Port opened in firewall

#### System Requirements
- Node.js v16.9.0 or higher
- npm (included with Node.js)

### 📦 Dependencies
- `discord.js` ^14.14.1 - Discord API wrapper
- `axios` ^1.6.5 - HTTP client for API calls
- `dotenv` ^16.3.1 - Environment variable management

### 🔐 Security Features
- Environment variable based configuration
- `.gitignore` configured to protect secrets
- User ID based admin authentication
- API password protection
- Permission checking on all admin commands

### 🎯 Future Considerations
- Potential role-based permissions
- Enhanced delivery tracking
- Player statistics
- Scheduled announcements
- Multi-language support
- Web dashboard

---

## Installation Summary

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start bot
npm start
```

## Support & Documentation

- Check README.md for full feature list
- See QUICKSTART.md for quick setup
- See ADMIN_GUIDE.md for admin system details
- See CONFIGURATION.md for all configuration options
- Console logs provide runtime information
- Use `/listadmins` to verify admin configuration

## Known Limitations

- Admin changes via `/addadmin` and `/removeadmin` are temporary (reset on restart)
- Bot must have appropriate permissions to set nickname
- Slash commands may take 1-2 minutes to register in Discord
- Delivery site list limited to 10 entries due to Discord embed limits

## Contributing

Feel free to:
- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests

## License

MIT License - Free to use and modify
