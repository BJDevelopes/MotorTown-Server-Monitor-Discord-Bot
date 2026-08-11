const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, MessageFlags, Events } = require('discord.js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load .env from next to this file so the bot works regardless of the working directory.
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const MONITOR_DATA_FILE = path.join(__dirname, 'monitor_data.json');
const ADMIN_DATA_FILE = path.join(__dirname, 'admin_data.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Configuration from environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const API_HOST = process.env.API_HOST;
const API_PASSWORD = process.env.API_PASSWORD;
const API_PORT = process.env.API_PORT || '8080';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000', 10);
const BOT_NICKNAME = process.env.BOT_NICKNAME || null;
const CHAT_CHANNEL_ID = process.env.CHAT_CHANNEL_ID || null;
const MONITOR_CHANNEL_ID = process.env.MONITOR_CHANNEL_ID || null;
const MONITOR_INTERVAL_MS = parseInt(process.env.MONITOR_INTERVAL || '60', 10) * 1000;
const PLAYER_FEED_CHANNEL_ID = process.env.PLAYER_FEED_CHANNEL_ID || null;
const PLAYER_FEED_INTERVAL_MS = parseInt(process.env.PLAYER_FEED_INTERVAL || '60', 10) * 1000;

// /join command details
const JOIN_SERVER_NAME = process.env.JOIN_SERVER_NAME || process.env.SERVER_NAME || null;
const JOIN_PASSWORD = process.env.JOIN_PASSWORD || null;
const JOIN_LINK = process.env.JOIN_LINK || null;

// Fail fast with an actionable message instead of a confusing crash later.
const missingConfig = Object.entries({ DISCORD_TOKEN, CLIENT_ID, API_HOST, API_PASSWORD })
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingConfig.length > 0) {
    console.error('❌ Missing required configuration:');
    for (const key of missingConfig) {
        console.error(`   - ${key}`);
    }
    console.error(`\nCreate a .env file next to bot.js (copy .env.example) and fill these in.`);
    console.error(`Expected location: ${path.join(__dirname, '.env')}`);
    process.exit(1);
}

// Admin user IDs (comma-separated in .env, plus any added at runtime via /addadmin)
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS
    ? process.env.ADMIN_USER_IDS.split(',').map(id => id.trim()).filter(id => id)
    : [];

// Admins added with /addadmin persist here so they survive a restart.
function loadPersistedAdmins() {
    try {
        if (!fs.existsSync(ADMIN_DATA_FILE)) return;
        const saved = JSON.parse(fs.readFileSync(ADMIN_DATA_FILE, 'utf8'));
        for (const id of saved.admins || []) {
            if (!ADMIN_USER_IDS.includes(id)) ADMIN_USER_IDS.push(id);
        }
    } catch (error) {
        console.error('Failed to load persisted admins:', error.message);
    }
}

function savePersistedAdmins() {
    // Only persist admins that aren't already in .env, so removing one from .env actually removes it.
    const fromEnv = process.env.ADMIN_USER_IDS
        ? process.env.ADMIN_USER_IDS.split(',').map(id => id.trim()).filter(id => id)
        : [];
    const runtimeOnly = ADMIN_USER_IDS.filter(id => !fromEnv.includes(id));
    try {
        fs.writeFileSync(ADMIN_DATA_FILE, JSON.stringify({ admins: runtimeOnly }, null, 2));
    } catch (error) {
        console.error('Failed to save admins:', error.message);
    }
}

loadPersistedAdmins();

// Player mapping (unique_id:name pairs, pipe-separated in .env)
const PLAYER_MAPPING = new Map();
if (process.env.PLAYER_MAPPING) {
    const mappings = process.env.PLAYER_MAPPING.split('|').map(m => m.trim()).filter(m => m);
    for (const mapping of mappings) {
        const [uniqueId, name] = mapping.split(':').map(s => s.trim());
        if (uniqueId && name) {
            PLAYER_MAPPING.set(uniqueId, name);
        }
    }
}

// Construct base URL
const BASE_URL = `http://${API_HOST}:${API_PORT}`;

// Commands that require the caller to be a bot admin
const ADMIN_COMMANDS = [
    'kick', 'ban', 'unban', 'announce', 'serverchat',
    'addrole', 'removerole', 'addadmin', 'removeadmin', 'testmapping', 'apiraw'
];

// Helper function to check if user is admin
function isAdmin(userId) {
    return ADMIN_USER_IDS.includes(userId);
}

// Helper function to get player display name (mapped name or original)
async function getPlayerDisplayName(uniqueId, originalName, guildId = null) {
    if (PLAYER_MAPPING.has(uniqueId)) {
        const mapped = PLAYER_MAPPING.get(uniqueId);
        
        // Check if mapped value is a Discord user ID (numeric string)
        if (/^\d{17,19}$/.test(mapped)) {
            try {
                const user = await client.users.fetch(mapped);
                
                // If guildId provided, try to get server nickname
                if (guildId) {
                    try {
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) {
                            try {
                                const member = await guild.members.fetch(mapped);
                                // Use nickname if available, otherwise use username
                                if (member.nickname) {
                                    return `${member.nickname} (${originalName})`;
                                } else {
                                    // No nickname set, use username
                                    return `${user.username} (${originalName})`;
                                }
                            } catch (memberError) {
                                // Member not found in guild - they may not be a member
                                console.log(`User ${user.tag} (ID: ${mapped}) not found in guild ${guild.name} - using global username`);
                                return `${user.tag} (${originalName})`;
                            }
                        } else {
                            // Guild not in cache
                            console.warn(`Guild ID ${guildId} not found in cache`);
                        }
                    } catch (guildError) {
                        console.error(`Error fetching guild member for ${mapped}:`, guildError.message);
                    }
                }
                
                // Fall back to Discord username#discriminator or username
                return `${user.tag} (${originalName})`;
            } catch (error) {
                console.error(`Failed to fetch Discord user ${mapped}:`, error.message);
                return `<@${mapped}> (${originalName})`;
            }
        }
        
        return `${mapped} (${originalName})`;
    }
    return originalName;
}

// Server Monitor Function

// Kept in memory so a failed write to disk can't make the monitor post a duplicate message.
let monitorState = null;

function loadMonitorState() {
    if (monitorState) return monitorState;

    monitorState = { messageId: null, lastOnline: 'Never' };
    try {
        if (fs.existsSync(MONITOR_DATA_FILE)) {
            monitorState = { ...monitorState, ...JSON.parse(fs.readFileSync(MONITOR_DATA_FILE, 'utf8')) };
        }
    } catch (error) {
        console.error('Failed to read monitor data, starting fresh:', error.message);
    }
    return monitorState;
}

function saveMonitorState() {
    try {
        fs.writeFileSync(MONITOR_DATA_FILE, JSON.stringify(monitorState, null, 2));
    } catch (error) {
        console.error('Failed to save monitor data:', error.message);
    }
}

async function refreshServerMonitor() {
    if (!MONITOR_CHANNEL_ID) return;

    try {
        const channel = await client.channels.fetch(MONITOR_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) {
            console.error(`Monitor channel ${MONITOR_CHANNEL_ID} is not a text channel.`);
            return;
        }

        const savedData = loadMonitorState();

        // 1. API Fetch — only count and version, to stay cheap at a 60s cadence
        let apiData;
        try {
            const [countRes, versionRes] = await Promise.all([
                apiCall('/player/count', 'GET'),
                apiCall('/version', 'GET')
            ]);

            apiData = {
                online: true,
                count: countRes.data.num_players,
                version: versionRes.data.version
            };

            // Track the daily peak so the dashboard shows how busy the server actually gets.
            const today = new Date().toLocaleDateString();
            if (savedData.peakDate !== today) {
                savedData.peakDate = today;
                savedData.peakCount = 0;
            }
            if (apiData.count > (savedData.peakCount || 0)) {
                savedData.peakCount = apiData.count;
            }

            savedData.lastOnline = new Date().toLocaleString();
            saveMonitorState();
        } catch (e) {
            apiData = { online: false };
        }

        // 2. Build the Compact Styled Embed
        const serverName = process.env.SERVER_NAME || 'Motor Town Server';
        const refreshSeconds = Math.round(MONITOR_INTERVAL_MS / 1000);
        const monitorEmbed = new EmbedBuilder()
            .setTitle(`**${serverName}**`)
            .setThumbnail(process.env.LOGO_URL || null)
            .setTimestamp()
            .setFooter({ text: `Auto-refreshes every ${refreshSeconds}s` });

        if (apiData.online) {
            monitorEmbed
                .setColor(0x2ecc71) // Green
                .addFields(
                    { name: '👥 Players', value: `\`${apiData.count} online\``, inline: true },
                    { name: '📡 Status', value: '🟢 **Online**', inline: true },
                    { name: '⚙️ Version', value: `\`${apiData.version}\``, inline: true },
                    { name: '📈 Peak Today', value: `\`${savedData.peakCount || apiData.count}\``, inline: true }
                );
        } else {
            monitorEmbed
                .setColor(0xe74c3c) // Red
                .addFields(
                    { name: '📡 Status', value: '🔴 **Offline**', inline: true },
                    { name: '🕒 Last Seen', value: `\`${savedData.lastOnline}\``, inline: true }
                )
                .setDescription('The server is currently unreachable or restarting.');
        }

        // 3. Persistence & Sending
        let message = null;
        if (savedData.messageId) {
            try { message = await channel.messages.fetch(savedData.messageId); } catch (e) {}
        }

        if (!message) {
            message = await channel.send({ embeds: [monitorEmbed] });
            savedData.messageId = message.id;
            saveMonitorState();
        } else {
            await message.edit({ embeds: [monitorEmbed], components: [] });
        }

    } catch (error) {
        console.error('Monitor Error:', error.message);
    }
}


// Player join/leave feed
//
// The Web API still has no way to read in-game chat, so the next best live feed is
// polling the player list and reporting the difference.
let knownPlayers = null; // null until the first successful poll, so a restart doesn't announce everyone

async function pollPlayerFeed() {
    if (!PLAYER_FEED_CHANNEL_ID) return;

    let players;
    try {
        const result = await apiCall('/player/list', 'GET');
        if (!result.succeeded) return;
        players = toArray(result.data);
    } catch (error) {
        // Server down or unreachable — hold the last known roster rather than
        // reporting every player as having left.
        return;
    }

    const current = new Map(players.map(p => [String(p.unique_id), p]));

    if (knownPlayers === null) {
        knownPlayers = current;
        console.log(`Player feed primed with ${current.size} player(s) online.`);
        return;
    }

    const joined = [...current.values()].filter(p => !knownPlayers.has(String(p.unique_id)));
    const left = [...knownPlayers.values()].filter(p => !current.has(String(p.unique_id)));
    knownPlayers = current;

    if (joined.length === 0 && left.length === 0) return;

    try {
        const channel = await client.channels.fetch(PLAYER_FEED_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) return;

        const guildId = channel.guild?.id || null;
        const lines = [];

        for (const player of joined) {
            const name = await getPlayerDisplayName(player.unique_id, player.name, guildId);
            lines.push(`🟢 **${name}** joined`);
        }
        for (const player of left) {
            const name = await getPlayerDisplayName(player.unique_id, player.name, guildId);
            lines.push(`🔴 **${name}** left`);
        }

        const list = buildEmbedList(lines);
        const embed = new EmbedBuilder()
            .setColor(joined.length >= left.length ? 0x2ecc71 : 0xe74c3c)
            .setDescription(list.text)
            .setFooter({ text: `${current.size} player${current.size === 1 ? '' : 's'} online` })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Player feed error:', error.message);
    }
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', params = {}) {
    try {
        // The Motor Town Web API reads every parameter from the query string, including on
        // POST requests. Sending them as a form body makes the server see no password at all
        // and reject the call with "Invalid password". axios handles the URL encoding.
        const response = await axios({
            method: method,
            url: `${BASE_URL}${endpoint}`,
            params: { password: API_PASSWORD, ...params },
            timeout: API_TIMEOUT
        });
        return response.data;
    } catch (error) {
        console.error(`API Error (${method} ${endpoint}): ${error.message}`);
        throw error;
    }
}

// Turns "X=2590.089 Y=1682.984 Z=98.927" into "X=2590 Y=1683" for readable embeds.
function formatLocation(location) {
    if (!location) return 'Unknown';
    const coords = String(location).match(/-?\d+(\.\d+)?/g);
    if (!coords || coords.length < 2) return String(location);
    return `X=${Math.round(coords[0])} Y=${Math.round(coords[1])}`;
}

// Discord rejects an embed description over 4096 characters and an embed with more than 25
// fields. Both limits are easy to hit on a busy server, so list-style commands build a
// description that fits and report whatever didn't make it.
const EMBED_DESCRIPTION_LIMIT = 3900;

function buildEmbedList(entries) {
    const lines = [];
    let length = 0;

    for (const entry of entries) {
        if (length + entry.length + 1 > EMBED_DESCRIPTION_LIMIT) break;
        lines.push(entry);
        length += entry.length + 1;
    }

    return {
        text: lines.join('\n'),
        shown: lines.length,
        omitted: entries.length - lines.length
    };
}

// Normalizes the API's object-keyed collections ({"0": {...}, "1": {...}}) into an array.
function toArray(collection) {
    if (!collection) return [];
    return Array.isArray(collection) ? collection : Object.values(collection);
}

// Autocomplete fires on every keystroke, so results are cached briefly to keep the
// game server from being hammered while an admin types a name.
const listCache = new Map();
const LIST_CACHE_MS = 5000;

async function getCachedList(endpoint, params = {}) {
    const key = `${endpoint}?${JSON.stringify(params)}`;
    const cached = listCache.get(key);
    if (cached && Date.now() - cached.at < LIST_CACHE_MS) return cached.value;

    const result = await apiCall(endpoint, 'GET', params);
    const value = result.succeeded ? toArray(result.data) : [];
    listCache.set(key, { at: Date.now(), value });
    return value;
}

// Turns raw errors into something a Discord admin can act on.
function describeError(error) {
    if (error.response?.data?.message) return error.response.data.message;

    switch (error.code) {
        case 'ECONNREFUSED':
            return `Cannot reach the game server at ${API_HOST}:${API_PORT}. Is the server running with the Web API enabled?`;
        case 'ETIMEDOUT':
        case 'ECONNABORTED':
            return `The game server at ${API_HOST}:${API_PORT} did not respond in time.`;
        case 'ENOTFOUND':
            return `Could not resolve the host \`${API_HOST}\`. Check API_HOST in your .env file.`;
        default:
            return error.message || 'An error occurred';
    }
}

// Command definitions
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands and their descriptions'),
    
    new SlashCommandBuilder()
        .setName('join')
        .setDescription('Get instructions on how to join the server'),
    
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Get server status information'),
    
    new SlashCommandBuilder()
        .setName('players')
        .setDescription('Get list of online players'),
    
    new SlashCommandBuilder()
        .setName('playercount')
        .setDescription('Get the number of online players'),
    
    new SlashCommandBuilder()
        .setName('version')
        .setDescription('Get server version'),
    
    new SlashCommandBuilder()
        .setName('deliveries')
        .setDescription('Get delivery site information'),
    
    new SlashCommandBuilder()
        .setName('housing')
        .setDescription('Get housing information'),
    
    new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('Get list of banned players'),
    
    new SlashCommandBuilder()
        .setName('admins')
        .setDescription('Get list of server admins'),
    
    new SlashCommandBuilder()
        .setName('police')
        .setDescription('Get list of server police'),
    
    new SlashCommandBuilder()
        .setName('find')
        .setDescription('Search for an online player by name and get their unique ID')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Full or partial player name')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a player from the server')
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID (start typing a name to search)')
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a player from the server')
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID (start typing a name to search)')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('hours')
                .setDescription('Ban duration in hours (leave empty for permanent)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for ban')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a player')
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID (start typing a name to search the ban list)')
                .setRequired(true)
                .setAutocomplete(true)),
    
    new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to the server')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to send')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('serverchat')
        .setDescription('Send a chat message to the server')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to send')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Text color in hex (e.g., FF00FF)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Grant a player the admin or police role on the game server')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Role to grant')
                .setRequired(true)
                .addChoices(
                    { name: 'admin', value: 'admin' },
                    { name: 'police', value: 'police' }
                ))
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID (start typing a name to search)')
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Revoke a player\'s admin or police role on the game server')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Role to revoke')
                .setRequired(true)
                .addChoices(
                    { name: 'admin', value: 'admin' },
                    { name: 'police', value: 'police' }
                ))
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID (start typing a name to search)')
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName('company')
        .setDescription('Show company profit figures from the server economy')
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Number of days to report on (default 7)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('apiraw')
        .setDescription('Call any Web API endpoint directly and show the raw response (admin only)')
        .addStringOption(option =>
            option.setName('endpoint')
                .setDescription('Endpoint path, e.g. /player/list or /company/profit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('params')
                .setDescription('Extra query params as key=value pairs, e.g. days=7 role=admin')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('listadmins')
        .setDescription('List Discord users who can use admin commands'),
    
    new SlashCommandBuilder()
        .setName('addadmin')
        .setDescription('Add a Discord user as bot admin (requires current admin)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add as admin')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('removeadmin')
        .setDescription('Remove a Discord user from bot admins (requires current admin)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove from admins')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('playermapping')
        .setDescription('View current player ID to name mappings'),
    
    new SlashCommandBuilder()
        .setName('testmapping')
        .setDescription('Test a specific player mapping (admin only)')
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID to test')
                .setRequired(true)),
].map(command => command.toJSON());

// Register slash commands
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
    } catch (error) {
        console.error('❌ Failed to register slash commands:', error.message);
        console.error('   Check that CLIENT_ID matches your bot\'s application ID and DISCORD_TOKEN is valid.');
        console.error('   The bot will still start; !! text commands will work in the meantime.');
    }
})();

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Connected to API: ${BASE_URL}`);
    console.log(`Admin users loaded: ${ADMIN_USER_IDS.length}`);
    if (ADMIN_USER_IDS.length > 0) {
        console.log(`Admin IDs: ${ADMIN_USER_IDS.join(', ')}`);
    }
    console.log(`Player mappings loaded: ${PLAYER_MAPPING.size}`);
    if (PLAYER_MAPPING.size > 0) {
        console.log('Mapped players (nicknames vary by server):');
        for (const [id, name] of PLAYER_MAPPING) {
            // Check if it's a Discord user ID
            if (/^\d{17,19}$/.test(name)) {
                try {
                    const user = await client.users.fetch(name);
                    console.log(`  ${id} → ${user.tag} (Discord User)`);
                    // Show nicknames per guild
                    const guildsWithNickname = [];
                    let userFoundInAnyGuild = false;
                    for (const [guildId, guild] of client.guilds.cache) {
                        try {
                            const member = await guild.members.fetch(name);
                            userFoundInAnyGuild = true;
                            if (member.nickname) {
                                guildsWithNickname.push(`    └─ ${guild.name}: "${member.nickname}"`);
                            } else {
                                guildsWithNickname.push(`    └─ ${guild.name}: (no nickname, will show ${user.username})`);
                            }
                        } catch (memberError) {
                            guildsWithNickname.push(`    └─ ${guild.name}: (user not a member of this server)`);
                        }
                    }
                    if (guildsWithNickname.length > 0) {
                        guildsWithNickname.forEach(line => console.log(line));
                    }
                    if (!userFoundInAnyGuild) {
                        console.log(`    ⚠️  User not found in any guilds - will show ${user.tag}`);
                    }
                } catch (error) {
                    console.log(`  ${id} → Discord User ID: ${name} (ERROR: ${error.message})`);
                }
            } else {
                console.log(`  ${id} → ${name}`);
            }
        }
    }
    
    if (CHAT_CHANNEL_ID) {
        console.log(`Chat channel configured: ${CHAT_CHANNEL_ID}`);
    }
    
    // Set initial bot activity status
    await updateBotStatus();
    console.log('Bot activity set with player count');

    // Update status every 60 seconds
    setInterval(updateBotStatus, 60000);

    // Server monitor: run once now, then keep it refreshing on its own interval
    if (MONITOR_CHANNEL_ID) {
        await refreshServerMonitor();
        setInterval(refreshServerMonitor, MONITOR_INTERVAL_MS);
        console.log(`Server monitor active in channel ${MONITOR_CHANNEL_ID} (every ${Math.round(MONITOR_INTERVAL_MS / 1000)}s)`);
    }

    // Player join/leave feed
    if (PLAYER_FEED_CHANNEL_ID) {
        await pollPlayerFeed();
        setInterval(pollPlayerFeed, PLAYER_FEED_INTERVAL_MS);
        console.log(`Player feed active in channel ${PLAYER_FEED_CHANNEL_ID} (every ${Math.round(PLAYER_FEED_INTERVAL_MS / 1000)}s)`);
    }


    // Set bot nickname in all guilds if configured
    if (BOT_NICKNAME) {
        console.log(`Setting bot nickname to: ${BOT_NICKNAME}`);
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const me = await guild.members.fetchMe();
                if (me.nickname !== BOT_NICKNAME) {
                    await me.setNickname(BOT_NICKNAME);
                    console.log(`✓ Nickname set in guild: ${guild.name}`);
                }
            } catch (error) {
                console.error(`✗ Failed to set nickname in guild ${guild.name}:`, error.message);
            }
        }
    }
});

// Function to update bot status with player count
async function updateBotStatus() {
    try {
        const result = await apiCall('/player/count', 'GET');
        if (result.succeeded) {
            const playerCount = result.data.num_players;
            // You can adjust the max player count or make it dynamic
            client.user.setActivity(`${playerCount} players online`, { type: 0 }); // Type 0 = Playing
        }
    } catch (error) {
        console.error('Failed to update bot status:', error.message);
        // Fallback to default status
        client.user.setActivity('Motortown', { type: 0 });
    }
}

// Function to send in-game chat to Discord channel
async function sendChatToDiscord(message, username = 'Server') {
    if (!CHAT_CHANNEL_ID) return;
    
    try {
        const channel = await client.channels.fetch(CHAT_CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            // Create embed for in-game chat message
            const embed = new EmbedBuilder()
                .setColor(0x00AA00)
                .setAuthor({ name: username })
                .setDescription(message)
                .setTimestamp();
            
            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Failed to send chat to Discord:', error.message);
    }
}

// Note: The Motortown Web API doesn't currently provide a chat monitoring endpoint
// This function is prepared for future API updates or webhook integration
// For now, this serves as a placeholder for the CHAT_CHANNEL_ID feature

// Set nickname when bot joins a new server
client.on(Events.GuildCreate, async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    
    if (BOT_NICKNAME) {
        try {
            const me = await guild.members.fetchMe();
            await me.setNickname(BOT_NICKNAME);
            console.log(`✓ Nickname set to "${BOT_NICKNAME}" in ${guild.name}`);
        } catch (error) {
            console.error(`✗ Failed to set nickname in ${guild.name}:`, error.message);
        }
    }
});

// Suggests live players (or banned players for /unban) as an admin types a name,
// so nobody has to copy unique IDs around by hand.
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isAutocomplete()) return;

    try {
        const usesBanList = interaction.commandName === 'unban';
        const players = await getCachedList(usesBanList ? '/player/banlist' : '/player/list');
        const typed = (interaction.options.getFocused() || '').toLowerCase();

        const choices = players
            .filter(p => !typed || (p.name || '').toLowerCase().includes(typed) || String(p.unique_id).includes(typed))
            .slice(0, 25) // Discord allows at most 25 autocomplete choices
            .map(p => ({
                name: `${p.name || 'Unknown'} (${p.unique_id})`.slice(0, 100),
                value: String(p.unique_id)
            }));

        await interaction.respond(choices);
    } catch (error) {
        // An unreachable server shouldn't make the option box hang — just offer nothing.
        try { await interaction.respond([]); } catch (e) {}
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Check if command requires admin and user is not admin
    if (ADMIN_COMMANDS.includes(commandName) && !isAdmin(interaction.user.id)) {
        await interaction.reply({
            content: '❌ You do not have permission to use this command.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    try {
        await interaction.deferReply();

        switch (commandName) {
            case 'help':
                await handleHelp(interaction);
                break;
            case 'join':
                await handleJoin(interaction);
                break;
            case 'status':
                await handleStatus(interaction);
                break;
            case 'players':
                await handlePlayers(interaction);
                break;
            case 'find':
                await handleFind(interaction);
                break;
            case 'company':
                await handleCompany(interaction);
                break;
            case 'apiraw':
                await handleApiRaw(interaction);
                break;
            case 'playercount':
                await handlePlayerCount(interaction);
                break;
            case 'version':
                await handleVersion(interaction);
                break;
            case 'deliveries':
                await handleDeliveries(interaction);
                break;
            case 'housing':
                await handleHousing(interaction);
                break;
            case 'banlist':
                await handleBanlist(interaction);
                break;
            case 'admins':
                await handleRoleList(interaction, 'admin');
                break;
            case 'police':
                await handleRoleList(interaction, 'police');
                break;
            case 'kick':
                await handleKick(interaction);
                break;
            case 'ban':
                await handleBan(interaction);
                break;
            case 'unban':
                await handleUnban(interaction);
                break;
            case 'announce':
                await handleAnnounce(interaction);
                break;
            case 'serverchat':
                await handleServerChat(interaction);
                break;
            case 'addrole':
                await handleRoleChange(interaction, 'add');
                break;
            case 'removerole':
                await handleRoleChange(interaction, 'remove');
                break;
            case 'listadmins':
                await handleListAdmins(interaction);
                break;
            case 'addadmin':
                await handleAddAdmin(interaction);
                break;
            case 'removeadmin':
                await handleRemoveAdmin(interaction);
                break;
            case 'playermapping':
                await handlePlayerMapping(interaction);
                break;
            case 'testmapping':
                await handleTestMapping(interaction);
                break;
            default:
                await interaction.editReply('Unknown command.');
        }
    } catch (error) {
        console.error(`Error handling ${commandName}:`, error);
        try {
            await interaction.editReply(`❌ ${describeError(error)}`);
        } catch (replyError) {
            console.error('Could not deliver error message to Discord:', replyError.message);
        }
    }
});

// Message command handler for !! prefix (backup when slash commands are slow)
client.on(Events.MessageCreate, async message => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message starts with !!
    if (!message.content.startsWith('!!')) return;

    // Parse command and arguments
    const args = message.content.slice(2).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if command requires admin and user is not admin
    if (ADMIN_COMMANDS.includes(commandName) && !isAdmin(message.author.id)) {
        await message.reply('❌ You do not have permission to use this command.');
        return;
    }

    try {
        // Role commands take the role first (!!addrole admin 12345), everything else
        // that takes an ID takes it first (!!ban 12345 24 Cheating).
        const isRoleCommand = commandName === 'addrole' || commandName === 'removerole';
        const role = isRoleCommand ? (args[0] || '').toLowerCase() : null;
        const uniqueId = isRoleCommand ? args[1] : args[0];

        // `hours` is optional, so treat arg 1 as a duration only when it's actually a number.
        // Otherwise the rest of the line is the reason (!!ban 12345 Cheating).
        const hours = /^\d+$/.test(args[1] || '') ? parseInt(args[1], 10) : null;
        const reason = (hours !== null ? args.slice(2) : args.slice(1)).join(' ') || null;

        // Create a mock interaction object for compatibility with existing handlers
        const mockInteraction = {
            user: message.author,
            options: {
                getString: (name) => {
                    if (name === 'unique_id') return uniqueId || null;
                    if (name === 'role') return role;
                    if (name === 'message') return args.join(' ') || null;
                    if (name === 'reason') return reason;
                    if (name === 'name') return args.join(' ') || null;
                    if (name === 'endpoint') return args[0] || null;
                    if (name === 'params') return args.slice(1).join(' ') || null;
                    if (name === 'color' && args.length > 0) {
                        const lastArg = args[args.length - 1];
                        if (/^[0-9A-Fa-f]{6}$/.test(lastArg)) return lastArg;
                    }
                    return null;
                },
                getInteger: (name) => {
                    if (name === 'hours') return hours;
                    if (name === 'days') return /^\d+$/.test(args[0] || '') ? parseInt(args[0], 10) : null;
                    return null;
                },
                getUser: () => {
                    // Discord already parsed any mentions for us, so this handles
                    // <@id>, <@!id> and plain user IDs alike.
                    const mentioned = message.mentions.users.first();
                    if (mentioned) return mentioned;
                    if (/^\d{17,19}$/.test(args[0] || '')) {
                        return client.users.cache.get(args[0]) || null;
                    }
                    return null;
                }
            },
            editReply: async (content) => {
                if (typeof content === 'string') {
                    await message.reply(content);
                } else if (content.embeds) {
                    await message.reply({ embeds: content.embeds });
                }
            },
            guild: message.guild
        };

        switch (commandName) {
            case 'help':
                await handleHelp(mockInteraction);
                break;
            case 'join':
                await handleJoin(mockInteraction);
                break;
            case 'status':
                await handleStatus(mockInteraction);
                break;
            case 'players':
                await handlePlayers(mockInteraction);
                break;
            case 'find':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!find <name>`\nExample: `!!find jerry`');
                    return;
                }
                await handleFind(mockInteraction);
                break;
            case 'company':
                await handleCompany(mockInteraction);
                break;
            case 'apiraw':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!apiraw <endpoint> [key=value ...]`\nExample: `!!apiraw /company/profit days=7`');
                    return;
                }
                await handleApiRaw(mockInteraction);
                break;
            case 'playercount':
                await handlePlayerCount(mockInteraction);
                break;
            case 'version':
                await handleVersion(mockInteraction);
                break;
            case 'deliveries':
                await handleDeliveries(mockInteraction);
                break;
            case 'housing':
                await handleHousing(mockInteraction);
                break;
            case 'banlist':
                await handleBanlist(mockInteraction);
                break;
            case 'admins':
                await handleRoleList(mockInteraction, 'admin');
                break;
            case 'police':
                await handleRoleList(mockInteraction, 'police');
                break;
            case 'kick':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!kick <unique_id>`\nExample: `!!kick 12345`');
                    return;
                }
                await handleKick(mockInteraction);
                break;
            case 'ban':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!ban <unique_id> [hours] [reason]`\nExample: `!!ban 12345 24 Cheating`');
                    return;
                }
                await handleBan(mockInteraction);
                break;
            case 'unban':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!unban <unique_id>`\nExample: `!!unban 12345`');
                    return;
                }
                await handleUnban(mockInteraction);
                break;
            case 'announce':
                if (args.length === 0) {
                    await message.reply('❌ Usage: `!!announce <message>`\nExample: `!!announce Server restart in 10 minutes`');
                    return;
                }
                await handleAnnounce(mockInteraction);
                break;
            case 'serverchat':
                if (args.length === 0) {
                    await message.reply('❌ Usage: `!!serverchat <message> [color]`\nExample: `!!serverchat Hello! FF0000`');
                    return;
                }
                // Check if last arg is a color and adjust message accordingly
                const lastArg = args[args.length - 1];
                const isColor = /^[0-9A-Fa-f]{6}$/.test(lastArg);
                mockInteraction.options.getString = (name) => {
                    if (name === 'message') {
                        return isColor ? args.slice(0, -1).join(' ') : args.join(' ');
                    }
                    if (name === 'color') {
                        return isColor ? lastArg : null;
                    }
                    return null;
                };
                await handleServerChat(mockInteraction);
                break;
            case 'addrole':
            case 'removerole':
                if (!['admin', 'police'].includes(role) || !uniqueId) {
                    await message.reply(`❌ Usage: \`!!${commandName} <admin|police> <unique_id>\`\nExample: \`!!${commandName} police 12345\``);
                    return;
                }
                await handleRoleChange(mockInteraction, commandName === 'addrole' ? 'add' : 'remove');
                break;
            case 'listadmins':
                await handleListAdmins(mockInteraction);
                break;
            case 'addadmin':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!addadmin @user`\nExample: `!!addadmin @JohnDoe`');
                    return;
                }
                await handleAddAdmin(mockInteraction);
                break;
            case 'removeadmin':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!removeadmin @user`\nExample: `!!removeadmin @JohnDoe`');
                    return;
                }
                await handleRemoveAdmin(mockInteraction);
                break;
            case 'playermapping':
                await handlePlayerMapping(mockInteraction);
                break;
            case 'testmapping':
                if (!args[0]) {
                    await message.reply('❌ Usage: `!!testmapping <unique_id>`\nExample: `!!testmapping 12345`');
                    return;
                }
                await handleTestMapping(mockInteraction);
                break;
            default:
                await message.reply(`❓ Unknown command: \`!!${commandName}\`\nUse \`!!help\` to see available commands.`);
        }
    } catch (error) {
        console.error(`Error handling !!${commandName}:`, error);
        try {
            await message.reply(`❌ ${describeError(error)}`);
        } catch (replyError) {
            console.error('Could not deliver error message to Discord:', replyError.message);
        }
    }
});

// Command handlers
async function handleHelp(interaction) {
    const isUserAdmin = isAdmin(interaction.user.id);
    
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📖 Bot Commands Help')
        .setDescription('Here are all available commands:\n\n💡 **Tip:** You can also use `!!` prefix for any command!\nExample: `!!status` or `/status`')
        .setTimestamp();

    // Server Information Commands
    embed.addFields({
        name: '📊 Server Information',
        value: 
            '`/join` - How to join the server\n' +
            '`/status` - Complete server status overview\n' +
            '`/playercount` - Number of players online\n' +
            '`/players` - Detailed list of online players\n' +
            '`/find <name>` - Search for a player and get their ID\n' +
            '`/version` - Server version information\n' +
            '`/deliveries` - View delivery sites and cargo\n' +
            '`/housing` - View housing ownership info\n' +
            '`/company [days]` - Company profit figures\n' +
            '`/banlist` - List of banned players',
        inline: false
    });

    // Role Information Commands
    embed.addFields({
        name: '👥 Role Information',
        value:
            '`/admins` - List server administrators\n' +
            '`/police` - List server police officers\n' +
            '`/listadmins` - List bot admin users\n' +
            '`/playermapping` - View player ID mappings',
        inline: false
    });

    // Admin Commands
    if (isUserAdmin) {
        embed.addFields({
            name: '🔒 Admin Commands (You have access)',
            value:
                '`/kick <unique_id>` - Kick a player\n' +
                '`/ban <unique_id> [hours] [reason]` - Ban a player\n' +
                '`/unban <unique_id>` - Unban a player\n' +
                '`/announce <message>` - Send server announcement\n' +
                '`/serverchat <message> [color]` - Send chat message\n' +
                '`/addrole <admin|police> <unique_id>` - Grant in-game role\n' +
                '`/removerole <admin|police> <unique_id>` - Revoke in-game role\n' +
                '`/addadmin <user>` - Add bot admin\n' +
                '`/removeadmin <user>` - Remove bot admin\n' +
                '`/apiraw <endpoint>` - Call any Web API endpoint directly',
            inline: false
        });
    } else {
        embed.addFields({
            name: '🔒 Admin Commands (Restricted)',
            value:
                '`/kick`, `/ban`, `/unban` - Player management\n' +
                '`/announce`, `/serverchat` - Server communication\n' +
                '`/addrole`, `/removerole` - In-game role management\n' +
                '`/addadmin`, `/removeadmin` - Bot admin management\n\n' +
                '❌ You need admin permissions to use these commands.',
            inline: false
        });
    }

    // Additional Info
    embed.addFields({
        name: '💡 Tips',
        value:
            '• `/kick`, `/ban`, `/unban` and the role commands autocomplete player names — just start typing\n' +
            '• Use `/find <name>` or `/players` to look up a unique_id by hand\n' +
            '• Color codes for `/serverchat` are in hex format (e.g., FF0000 for red)\n' +
            '• Admin permissions are managed via Discord User IDs in the bot configuration\n' +
            '• **Slash commands slow?** Use `!!` prefix instead (e.g., `!!help`, `!!status`)',
        inline: false
    });

    embed.setFooter({ text: `Bot connected to: ${API_HOST}` });

    await interaction.editReply({ embeds: [embed] });
}

async function handleJoin(interaction) {
    if (!JOIN_SERVER_NAME) {
        await interaction.editReply(
            '⚠️ Join instructions are not configured.\n' +
            'Set `JOIN_SERVER_NAME` (and optionally `JOIN_PASSWORD`) in your `.env` file.'
        );
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🎮 How to Join the Server')
        .setDescription('Follow these simple steps to connect to our server:')
        .addFields(
            {
                name: '1️⃣ Launch the Game',
                value: 'Start up the game and wait for it to load completely.',
                inline: false
            },
            {
                name: '2️⃣ Open Multiplayer',
                value: 'Click on the **Join** button in the main menu.',
                inline: false
            },
            {
                name: '3️⃣ Search for Server',
                value: `Look up **${JOIN_SERVER_NAME}** in the server list.`,
                inline: false
            }
        );

    if (JOIN_PASSWORD) {
        embed.addFields({
            name: '4️⃣ Enter Password',
            value: `🔑 Password: \`${JOIN_PASSWORD}\``,
            inline: false
        });
    }

    embed.addFields({
        name: JOIN_PASSWORD ? '5️⃣ Connect!' : '4️⃣ Connect!',
        value: 'Click join and you\'ll be in the server! 🎉',
        inline: false
    });

    embed.addFields({
        name: '📋 Quick Reference',
        value: `**Server Name:** ${JOIN_SERVER_NAME}` +
            (JOIN_PASSWORD ? `\n**Password:** \`${JOIN_PASSWORD}\`` : '\n**Password:** None') +
            (JOIN_LINK ? `\n**More info:** ${JOIN_LINK}` : ''),
        inline: false
    });

    embed
        .setFooter({ text: 'See you in-game!' })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleStatus(interaction) {
    const [playerCount, version] = await Promise.all([
        apiCall('/player/count', 'GET'),
        apiCall('/version', 'GET')
    ]);

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🖥️ Server Status')
        .addFields(
            { name: '👥 Players Online', value: `${playerCount.data.num_players}`, inline: true },
            { name: '📦 Version', value: version.data.version, inline: true },
            { name: '🌐 Host', value: API_HOST, inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handlePlayers(interaction) {
    const result = await apiCall('/player/list', 'GET');

    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch player list.');
        return;
    }

    const players = toArray(result.data);

    if (players.length === 0) {
        await interaction.editReply('No players currently online.');
        return;
    }

    // Get guild ID for nickname lookup
    const guildId = interaction.guild?.id || null;

    const entries = [];
    for (const player of players) {
        const displayName = await getPlayerDisplayName(player.unique_id, player.name, guildId);
        const vehicleInfo = player.vehicle?.name ? ` · 🚗 ${player.vehicle.name}` : '';

        // AFK and autopilot were added to /player/list in the 0.7.19 update. Older servers
        // simply won't send these fields, in which case no badge is shown.
        const badges = [];
        if (player.afk || player.is_afk || player.bIsAFK) badges.push('💤 AFK');
        if (player.autopilot || player.is_autopilot || player.bIsAutopilot) badges.push('🤖 Autopilot');
        const badgeText = badges.length ? ` · ${badges.join(' · ')}` : '';

        entries.push(`**${displayName}**${badgeText}\n\`${player.unique_id}\` · 📍 ${formatLocation(player.location)}${vehicleInfo}`);
    }

    const list = buildEmbedList(entries);

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`👥 Online Players (${players.length})`)
        .setDescription(list.text)
        .setTimestamp();

    if (list.omitted > 0) {
        embed.setFooter({ text: `Showing ${list.shown} of ${players.length} players` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handlePlayerCount(interaction) {
    const result = await apiCall('/player/count', 'GET');
    
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('👥 Player Count')
        .setDescription(`**${result.data.num_players}** players online`)
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleVersion(interaction) {
    const result = await apiCall('/version', 'GET');
    
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📦 Server Version')
        .setDescription(result.data.version)
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleDeliveries(interaction) {
    const result = await apiCall('/delivery/sites', 'GET');
    
    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch delivery information.');
        return;
    }

    const sites = Object.entries(result.data || {});

    if (sites.length === 0) {
        await interaction.editReply('No delivery sites available.');
        return;
    }

    const entries = sites.map(([id, site]) => {
        const deliveryCount = site.Deliveries ? Object.keys(site.Deliveries).length : 0;
        const outputCount = site.OutputInventory ? Object.keys(site.OutputInventory).length : 0;
        return `**${site.name || id}**\n📍 ${formatLocation(site.location)} · 📦 ${deliveryCount} deliveries · 📤 ${outputCount} items`;
    });

    const list = buildEmbedList(entries);

    const embed = new EmbedBuilder()
        .setColor(0xFFAA00)
        .setTitle(`📦 Delivery Sites (${sites.length})`)
        .setDescription(list.text)
        .setTimestamp();

    if (list.omitted > 0) {
        embed.setFooter({ text: `Showing ${list.shown} of ${sites.length} sites` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleHousing(interaction) {
    const result = await apiCall('/housing/list', 'GET');

    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch housing information.');
        return;
    }

    const houses = Object.entries(result.data || {});

    if (houses.length === 0) {
        await interaction.editReply('No houses owned.');
        return;
    }

    const guildId = interaction.guild?.id || null;

    const entries = [];
    for (const [name, house] of houses) {
        const owner = await getPlayerDisplayName(house.owner_unique_id, house.owner_unique_id, guildId);
        entries.push(`**${name}**\n👤 ${owner} · ⏱️ ${house.expire_time}`);
    }

    const list = buildEmbedList(entries);

    const embed = new EmbedBuilder()
        .setColor(0x00AAFF)
        .setTitle(`🏠 Housing (${houses.length} owned)`)
        .setDescription(list.text)
        .setTimestamp();

    if (list.omitted > 0) {
        embed.setFooter({ text: `Showing ${list.shown} of ${houses.length} houses` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleBanlist(interaction) {
    const result = await apiCall('/player/banlist', 'GET');

    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch ban list.');
        return;
    }

    const bans = toArray(result.data);

    if (bans.length === 0) {
        await interaction.editReply('No players are currently banned.');
        return;
    }

    const list = buildEmbedList(bans.map(player => `**${player.name}** · \`${player.unique_id}\``));

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`🚫 Banned Players (${bans.length})`)
        .setDescription(list.text)
        .setTimestamp();

    if (list.omitted > 0) {
        embed.setFooter({ text: `Showing ${list.shown} of ${bans.length} bans` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleRoleList(interaction, role) {
    const result = await apiCall('/player/role/list', 'GET', { role });

    if (!result.succeeded) {
        await interaction.editReply(`Failed to fetch ${role} list.`);
        return;
    }

    const members = toArray(result.data?.[role]);

    if (members.length === 0) {
        await interaction.editReply(`No ${role}s currently assigned.`);
        return;
    }

    const list = buildEmbedList(members.map(player => `**${player.nickname || 'Unknown'}** · \`${player.unique_id}\``));

    const emoji = role === 'admin' ? '👑' : '👮';
    const embed = new EmbedBuilder()
        .setColor(role === 'admin' ? 0xFFD700 : 0x0066FF)
        .setTitle(`${emoji} ${role.charAt(0).toUpperCase() + role.slice(1)}s (${members.length})`)
        .setDescription(list.text)
        .setTimestamp();

    if (list.omitted > 0) {
        embed.setFooter({ text: `Showing ${list.shown} of ${members.length}` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleKick(interaction) {
    const uniqueId = interaction.options.getString('unique_id');
    
    const result = await apiCall('/player/kick', 'POST', { unique_id: uniqueId });
    
    if (result.succeeded) {
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('✅ Player Kicked')
            .setDescription(`Player with ID \`${uniqueId}\` has been kicked from the server.`)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply(`Failed to kick player: ${result.message || 'Unknown error'}`);
    }
}

async function handleBan(interaction) {
    const uniqueId = interaction.options.getString('unique_id');
    const hours = interaction.options.getInteger('hours');
    const reason = interaction.options.getString('reason');
    
    const params = { unique_id: uniqueId };
    if (hours) params.hours = hours;
    if (reason) params.reason = reason;
    
    const result = await apiCall('/player/ban', 'POST', params);
    
    if (result.succeeded) {
        const duration = hours ? `for ${hours} hours` : 'permanently';
        const reasonText = reason ? `\nReason: ${reason}` : '';
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🚫 Player Banned')
            .setDescription(`Player with ID \`${uniqueId}\` has been banned ${duration}.${reasonText}`)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply(`Failed to ban player: ${result.message || 'Unknown error'}`);
    }
}

async function handleUnban(interaction) {
    const uniqueId = interaction.options.getString('unique_id');
    
    const result = await apiCall('/player/unban', 'POST', { unique_id: uniqueId });
    
    if (result.succeeded) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Player Unbanned')
            .setDescription(`Player with ID \`${uniqueId}\` has been unbanned.`)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply(`Failed to unban player: ${result.message || 'Unknown error'}`);
    }
}

async function handleAnnounce(interaction) {
    const message = interaction.options.getString('message');
    
    const result = await apiCall('/chat', 'POST', { 
        message: message,
        type: 'announce'
    });
    
    if (result.succeeded) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📢 Announcement Sent')
            .setDescription(message)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply(`Failed to send announcement: ${result.message || 'Unknown error'}`);
    }
}

async function handleServerChat(interaction) {
    const message = interaction.options.getString('message');
    const color = interaction.options.getString('color');
    
    const params = { 
        message: message,
        type: 'message'
    };
    if (color) params.color = color;
    
    const result = await apiCall('/chat', 'POST', params);
    
    if (result.succeeded) {
        const embed = new EmbedBuilder()
            .setColor(color ? parseInt(color, 16) : 0xFFFFFF)
            .setTitle('💬 Message Sent')
            .setDescription(message)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply(`Failed to send message: ${result.message || 'Unknown error'}`);
    }
}

async function handleFind(interaction) {
    const query = (interaction.options.getString('name') || '').toLowerCase();
    const result = await apiCall('/player/list', 'GET');

    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch player list.');
        return;
    }

    const matches = toArray(result.data).filter(p =>
        (p.name || '').toLowerCase().includes(query) || String(p.unique_id).includes(query)
    );

    if (matches.length === 0) {
        await interaction.editReply(`No online player matches \`${query}\`.`);
        return;
    }

    const guildId = interaction.guild?.id || null;
    const entries = [];
    for (const player of matches) {
        const displayName = await getPlayerDisplayName(player.unique_id, player.name, guildId);
        entries.push(`**${displayName}**\n\`${player.unique_id}\` · 📍 ${formatLocation(player.location)}`);
    }

    const list = buildEmbedList(entries);
    const embed = new EmbedBuilder()
        .setColor(0x00AAFF)
        .setTitle(`🔍 Found ${matches.length} player${matches.length === 1 ? '' : 's'}`)
        .setDescription(list.text)
        .setFooter({ text: 'Use the ID with /kick, /ban or /addrole' })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleCompany(interaction) {
    const days = interaction.options.getInteger('days') || 7;

    let result;
    try {
        result = await apiCall('/company/profit', 'GET', { days });
    } catch (error) {
        // This endpoint arrived in a 2026 server update; older servers 404 on it.
        await interaction.editReply(
            `❌ Could not read company profit data: ${describeError(error)}\n` +
            'This endpoint requires a recent Motor Town dedicated server build.'
        );
        return;
    }

    if (!result.succeeded) {
        await interaction.editReply(
            `❌ Server rejected the request: ${result.message || 'Unknown error'}\n` +
            'This endpoint requires a recent Motor Town dedicated server build.'
        );
        return;
    }

    const entries = Object.entries(result.data || {});
    if (entries.length === 0) {
        await interaction.editReply(`No company profit data reported for the last ${days} day(s).`);
        return;
    }

    // The exact response shape isn't documented, so render whatever the server sends
    // rather than guessing at field names and showing "undefined".
    const lines = entries.map(([key, value]) => {
        if (value !== null && typeof value === 'object') {
            const inner = Object.entries(value)
                .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                .join(' · ');
            return `**${key}**\n${inner}`;
        }
        return `**${key}**: ${value}`;
    });

    const list = buildEmbedList(lines);
    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`💰 Company Profit (last ${days} day${days === 1 ? '' : 's'})`)
        .setDescription(list.text)
        .setTimestamp();

    if (list.omitted > 0) {
        embed.setFooter({ text: `Showing ${list.shown} of ${entries.length} entries` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleApiRaw(interaction) {
    let endpoint = interaction.options.getString('endpoint').trim();
    if (!endpoint.startsWith('/')) endpoint = `/${endpoint}`;

    // Parse "key=value key=value" into params
    const params = {};
    const rawParams = interaction.options.getString('params');
    if (rawParams) {
        for (const pair of rawParams.split(/\s+/).filter(Boolean)) {
            const index = pair.indexOf('=');
            if (index > 0) params[pair.slice(0, index)] = pair.slice(index + 1);
        }
    }

    // Never let someone override the password through this command.
    delete params.password;

    let result;
    try {
        result = await apiCall(endpoint, 'GET', params);
    } catch (error) {
        await interaction.editReply(`❌ \`GET ${endpoint}\` failed: ${describeError(error)}`);
        return;
    }

    let json = JSON.stringify(result, null, 2);
    let truncated = false;
    if (json.length > 1900) {
        json = json.slice(0, 1900);
        truncated = true;
    }

    await interaction.editReply(
        `\`GET ${endpoint}\`\n\`\`\`json\n${json}\n\`\`\`` +
        (truncated ? '\n*(response truncated)*' : '')
    );
}

async function handleRoleChange(interaction, action) {
    const role = interaction.options.getString('role');
    const uniqueId = interaction.options.getString('unique_id');

    if (!['admin', 'police'].includes(role)) {
        await interaction.editReply('❌ Role must be either `admin` or `police`.');
        return;
    }

    const result = await apiCall(`/player/role/${action}`, 'POST', { role, unique_id: uniqueId });

    if (result.succeeded) {
        const granted = action === 'add';
        const embed = new EmbedBuilder()
            .setColor(granted ? 0x00FF00 : 0xFF6600)
            .setTitle(granted ? '✅ Role Granted' : '✅ Role Revoked')
            .setDescription(
                granted
                    ? `Player \`${uniqueId}\` is now **${role}**.`
                    : `Player \`${uniqueId}\` is no longer **${role}**.`
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply(`Failed to ${action} role: ${result.message || 'Unknown error'}`);
    }
}

async function handleListAdmins(interaction) {
    if (ADMIN_USER_IDS.length === 0) {
        await interaction.editReply('⚠️ No admin users configured. Set ADMIN_USER_IDS in your .env file.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('👑 Bot Admin Users')
        .setDescription('Users who can execute admin commands:')
        .setTimestamp();

    for (const userId of ADMIN_USER_IDS) {
        try {
            const user = await client.users.fetch(userId);
            embed.addFields({
                name: user.tag,
                value: `ID: \`${userId}\``,
                inline: true
            });
        } catch (error) {
            embed.addFields({
                name: 'Unknown User',
                value: `ID: \`${userId}\``,
                inline: true
            });
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleAddAdmin(interaction) {
    // Check if user executing command is admin
    if (!isAdmin(interaction.user.id)) {
        await interaction.editReply('❌ You must be an admin to add other admins.');
        return;
    }

    const targetUser = interaction.options.getUser('user');
    if (!targetUser) {
        await interaction.editReply('❌ Could not find that user. Mention them directly, e.g. `!!addadmin @JohnDoe`.');
        return;
    }
    const targetUserId = targetUser.id;

    if (ADMIN_USER_IDS.includes(targetUserId)) {
        await interaction.editReply(`ℹ️ ${targetUser.tag} is already an admin.`);
        return;
    }

    ADMIN_USER_IDS.push(targetUserId);
    savePersistedAdmins();

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Admin Added')
        .setDescription(`${targetUser.tag} has been added as a bot admin.`)
        .addFields({
            name: 'Note',
            value: 'Saved to `admin_data.json`, so this survives a restart. To bake it into your config instead, add their ID to `ADMIN_USER_IDS` in `.env`:\n```\nADMIN_USER_IDS=' + ADMIN_USER_IDS.join(',') + '\n```'
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleRemoveAdmin(interaction) {
    // Check if user executing command is admin
    if (!isAdmin(interaction.user.id)) {
        await interaction.editReply('❌ You must be an admin to remove other admins.');
        return;
    }

    const targetUser = interaction.options.getUser('user');
    if (!targetUser) {
        await interaction.editReply('❌ Could not find that user. Mention them directly, e.g. `!!removeadmin @JohnDoe`.');
        return;
    }
    const targetUserId = targetUser.id;

    // Prevent removing the last admin, which would lock everyone out of admin commands
    if (ADMIN_USER_IDS.length === 1 && ADMIN_USER_IDS[0] === targetUserId) {
        await interaction.editReply('❌ Cannot remove the last remaining admin.');
        return;
    }

    const index = ADMIN_USER_IDS.indexOf(targetUserId);
    if (index === -1) {
        await interaction.editReply(`ℹ️ ${targetUser.tag} is not an admin.`);
        return;
    }

    ADMIN_USER_IDS.splice(index, 1);
    savePersistedAdmins();

    const fromEnv = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).includes(targetUserId);

    const embed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('✅ Admin Removed')
        .setDescription(`${targetUser.tag} has been removed from bot admins.`)
        .addFields({
            name: 'Note',
            value: fromEnv
                ? '⚠️ This user is listed in `ADMIN_USER_IDS` in your `.env`, so they will be an admin again on restart. Remove their ID from `.env` to make this permanent.'
                : 'Saved to `admin_data.json`, so this survives a restart.'
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handlePlayerMapping(interaction) {
    if (PLAYER_MAPPING.size === 0) {
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🎮 Player Mapping')
            .setDescription('No player mappings configured.')
            .addFields({
                name: 'How to Add Mappings',
                value: 'Edit your `.env` file and add:\n```\nPLAYER_MAPPING=12345:Jerry|67890:Bob|11111:123456789012345678\n```\nFormat: `unique_id:name` or `unique_id:discordUserID`\nSeparate with `|` for multiple mappings.'
            })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x00AAFF)
        .setTitle(`🎮 Player Mapping (${PLAYER_MAPPING.size} mapped)`)
        .setDescription('Current player ID to name mappings:')
        .setTimestamp();

    const guildId = interaction.guild?.id || null;
    let mappingText = '';
    
    for (const [uniqueId, name] of PLAYER_MAPPING) {
        // Check if name is a Discord user ID
        if (/^\d{17,19}$/.test(name)) {
            try {
                const user = await client.users.fetch(name);
                let displayName = user.tag;
                
                // Try to get server nickname
                if (guildId) {
                    try {
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) {
                            const member = await guild.members.fetch(name);
                            if (member.nickname) {
                                displayName = `${member.nickname} (${user.username})`;
                            }
                        }
                    } catch (guildError) {
                        // Member not in guild, use global name
                    }
                }
                
                mappingText += `\`${uniqueId}\` → **${displayName}** (Discord User)\n`;
            } catch (error) {
                mappingText += `\`${uniqueId}\` → **Discord User ID: ${name}** (User not found)\n`;
            }
        } else {
            mappingText += `\`${uniqueId}\` → **${name}**\n`;
        }
    }

    embed.addFields({
        name: 'Mappings',
        value: mappingText || 'None',
        inline: false
    });

    embed.addFields({
        name: 'Usage',
        value: 'These names will appear in `/players` command.\n**With name:** `Jerry (InGameName)`\n**With Discord user:** `Nickname (InGameName)` or `Username#1234 (InGameName)`\n\n💡 Server nicknames are used when available!',
        inline: false
    });

    embed.setFooter({ text: 'Mappings are configured in the .env file' });

    await interaction.editReply({ embeds: [embed] });
}

async function handleTestMapping(interaction) {
    const uniqueId = interaction.options.getString('unique_id');
    
    if (!PLAYER_MAPPING.has(uniqueId)) {
        await interaction.editReply(`❌ No mapping found for player ID: \`${uniqueId}\`\n\nUse \`/playermapping\` to see all mappings.`);
        return;
    }

    const mapped = PLAYER_MAPPING.get(uniqueId);
    const guildId = interaction.guild?.id || null;
    const guildName = interaction.guild?.name || 'Unknown Server';

    const embed = new EmbedBuilder()
        .setColor(0x00AAFF)
        .setTitle('🔍 Player Mapping Test')
        .setDescription(`Testing mapping for player ID: \`${uniqueId}\``)
        .setTimestamp();

    // Check if it's a Discord User ID
    if (/^\d{17,19}$/.test(mapped)) {
        embed.addFields({
            name: 'Mapping Type',
            value: 'Discord User ID',
            inline: false
        });

        embed.addFields({
            name: 'Discord User ID',
            value: `\`${mapped}\``,
            inline: false
        });

        // Try to fetch the user
        try {
            const user = await client.users.fetch(mapped);
            embed.addFields({
                name: '✅ User Found',
                value: `**${user.tag}**\nID: ${user.id}`,
                inline: false
            });

            // Try to get guild member info
            if (guildId) {
                try {
                    const guild = client.guilds.cache.get(guildId);
                    if (guild) {
                        try {
                            const member = await guild.members.fetch(mapped);
                            
                            if (member.nickname) {
                                embed.addFields({
                                    name: `✅ Member of "${guildName}"`,
                                    value: `**Server Nickname:** ${member.nickname}\n**Will display as:** \`${member.nickname} (InGameName)\``,
                                    inline: false
                                });
                            } else {
                                embed.addFields({
                                    name: `✅ Member of "${guildName}"`,
                                    value: `**No server nickname set**\n**Will display as:** \`${user.username} (InGameName)\``,
                                    inline: false
                                });
                            }
                        } catch (memberError) {
                            embed.addFields({
                                name: `❌ Not a Member of "${guildName}"`,
                                value: `User is not in this Discord server.\n**Will display as:** \`${user.tag} (InGameName)\`\n\n**Error:** ${memberError.message}`,
                                inline: false
                            });
                        }
                    } else {
                        embed.addFields({
                            name: '⚠️ Guild Not Found',
                            value: 'Could not find guild in cache',
                            inline: false
                        });
                    }
                }catch (guildError) {
                    embed.addFields({
                        name: '❌ Error',
                        value: `Failed to check guild membership: ${guildError.message}`,
                        inline: false
                    });
                }
            } else {
                embed.addFields({
                    name: '⚠️ No Guild Context',
                    value: 'Command not used in a server, cannot check nickname',
                    inline: false
                });
            }

        } catch (userError) {
            embed.addFields({
                name: '❌ User Not Found',
                value: `Failed to fetch Discord user.\n**Will display as:** \`<@${mapped}> (InGameName)\`\n\n**Error:** ${userError.message}`,
                inline: false
            });
        }
    } else {
        // Custom name mapping
        embed.addFields({
            name: 'Mapping Type',
            value: 'Custom Name',
            inline: false
        });

        embed.addFields({
            name: 'Mapped Name',
            value: `**${mapped}**`,
            inline: false
        });

        embed.addFields({
            name: 'Display',
            value: `Will display as: \`${mapped} (InGameName)\``,
            inline: false
        });
    }

    await interaction.editReply({ embeds: [embed] });
}

// Keep the bot alive on transient failures instead of dying silently.
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

client.on('error', (error) => {
    console.error('Discord client error:', error.message);
});

// Tear down cleanly. Calling process.exit() while sockets are still closing trips an
// assertion inside libuv on Windows, so let the event loop drain and only force the
// exit if something is still holding it open a second later.
function shutdown(code) {
    process.exitCode = code;
    client.destroy().catch(() => {});
    setTimeout(() => process.exit(code), 1000).unref();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        console.log(`\nReceived ${signal}, shutting down...`);
        shutdown(0);
    });
}

client.login(DISCORD_TOKEN).catch(error => {
    console.error('❌ Failed to log in to Discord:', error.message);
    console.error('   Check that DISCORD_TOKEN in your .env file is correct and has not been reset.');
    shutdown(1);
});