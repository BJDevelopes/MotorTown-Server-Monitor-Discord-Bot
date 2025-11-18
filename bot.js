const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

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
const BOT_NICKNAME = process.env.BOT_NICKNAME || null;

// Admin user IDs (comma-separated in .env)
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS 
    ? process.env.ADMIN_USER_IDS.split(',').map(id => id.trim())
    : [];

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

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', params = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            method: method,
            url: url,
            params: { password: API_PASSWORD, ...params }
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        throw error;
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
        .setName('kick')
        .setDescription('Kick a player from the server')
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a player from the server')
        .addStringOption(option =>
            option.setName('unique_id')
                .setDescription('Player unique ID')
                .setRequired(true))
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
                .setDescription('Player unique ID')
                .setRequired(true)),
    
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
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', async () => {
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
    
    // Set bot activity status
    client.user.setActivity('Motortown', { type: 0 }); // Type 0 = Playing
    console.log('Bot activity set to: Playing Motortown');
    
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

// Set nickname when bot joins a new server
client.on('guildCreate', async (guild) => {
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

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Define admin-only commands
    const adminCommands = ['kick', 'ban', 'unban', 'announce', 'serverchat', 'addadmin', 'removeadmin', 'testmapping'];

    // Check if command requires admin and user is not admin
    if (adminCommands.includes(commandName) && !isAdmin(interaction.user.id)) {
        await interaction.reply({
            content: '❌ You do not have permission to use this command.',
            ephemeral: true
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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        await interaction.editReply(`Error: ${errorMessage}`);
    }
});

// Message command handler for !! prefix (backup when slash commands are slow)
client.on('messageCreate', async message => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message starts with !!
    if (!message.content.startsWith('!!')) return;

    // Parse command and arguments
    const args = message.content.slice(2).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Define admin-only commands
    const adminCommands = ['kick', 'ban', 'unban', 'announce', 'serverchat', 'addadmin', 'removeadmin', 'testmapping'];

    // Check if command requires admin and user is not admin
    if (adminCommands.includes(commandName) && !isAdmin(message.author.id)) {
        await message.reply('❌ You do not have permission to use this command.');
        return;
    }

    try {
        // Create a mock interaction object for compatibility with existing handlers
        const mockInteraction = {
            user: message.author,
            options: {
                getString: (name) => {
                    if (name === 'unique_id') return args[0] || null;
                    if (name === 'message') return args.join(' ') || null;
                    if (name === 'reason' && args.length > 2) return args.slice(2).join(' ');
                    if (name === 'color' && args.length > 0) {
                        const lastArg = args[args.length - 1];
                        if (/^[0-9A-Fa-f]{6}$/.test(lastArg)) return lastArg;
                    }
                    return null;
                },
                getInteger: (name) => {
                    if (name === 'hours' && args[1]) {
                        const hours = parseInt(args[1]);
                        return isNaN(hours) ? null : hours;
                    }
                    return null;
                },
                getUser: (name) => {
                    // For user mentions in !! commands
                    const mention = args[0];
                    if (mention && mention.startsWith('<@') && mention.endsWith('>')) {
                        const userId = mention.slice(2, -1).replace('!', '');
                        return message.guild.members.cache.get(userId)?.user || null;
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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        await message.reply(`❌ Error: ${errorMessage}`);
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
            '`/version` - Server version information\n' +
            '`/deliveries` - View delivery sites and cargo\n' +
            '`/housing` - View housing ownership info\n' +
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
                '`/addadmin <user>` - Add bot admin (temporary)\n' +
                '`/removeadmin <user>` - Remove bot admin (temporary)',
            inline: false
        });
    } else {
        embed.addFields({
            name: '🔒 Admin Commands (Restricted)',
            value:
                '`/kick`, `/ban`, `/unban` - Player management\n' +
                '`/announce`, `/serverchat` - Server communication\n' +
                '`/addadmin`, `/removeadmin` - Bot admin management\n\n' +
                '❌ You need admin permissions to use these commands.',
            inline: false
        });
    }

    // Additional Info
    embed.addFields({
        name: '💡 Tips',
        value:
            '• Use `/players` to get player unique_ids for kick/ban commands\n' +
            '• Color codes for `/serverchat` are in hex format (e.g., FF0000 for red)\n' +
            '• Admin permissions are managed via Discord User IDs in the bot configuration\n' +
            '• **Slash commands slow?** Use `!!` prefix instead (e.g., `!!help`, `!!status`)',
        inline: false
    });

    embed.setFooter({ text: `Bot connected to: ${API_HOST}` });

    await interaction.editReply({ embeds: [embed] });
}

async function handleJoin(interaction) {
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
                value: 'Look up **Bjs Town** in the server list.',
                inline: false
            },
            {
                name: '4️⃣ Enter Password',
                value: '🔑 Password: `jerry`',
                inline: false
            },
            {
                name: '5️⃣ Connect!',
                value: 'Click join and you\'ll be in the server! 🎉',
                inline: false
            }
        )
        .addFields({
            name: '📋 Quick Reference',
            value: '**Server Name:** Bjs Town\n**Password:** `jerry`',
            inline: false
        })
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

    const players = result.data;
    const playerCount = Object.keys(players).length;

    if (playerCount === 0) {
        await interaction.editReply('No players currently online.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`👥 Online Players (${playerCount})`)
        .setTimestamp();

    // Get guild ID for nickname lookup
    const guildId = interaction.guild?.id || null;

    for (const [index, player] of Object.entries(players)) {
        const vehicleInfo = player.vehicle ? `\n🚗 Vehicle: ${player.vehicle.name}` : '';
        const locationInfo = `📍 ${player.location}`;
        const displayName = await getPlayerDisplayName(player.unique_id, player.name, guildId);
        
        embed.addFields({
            name: displayName,
            value: `ID: \`${player.unique_id}\`\n${locationInfo}${vehicleInfo}`,
            inline: false
        });
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

    const sites = result.data;
    const siteCount = Object.keys(sites).length;

    if (siteCount === 0) {
        await interaction.editReply('No delivery sites available.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0xFFAA00)
        .setTitle(`📦 Delivery Sites (${siteCount})`)
        .setTimestamp();

    let siteIndex = 0;
    for (const [id, site] of Object.entries(sites)) {
        if (siteIndex >= 10) break; // Discord embed field limit
        
        const deliveryCount = site.Deliveries ? Object.keys(site.Deliveries).length : 0;
        const outputCount = site.OutputInventory ? Object.keys(site.OutputInventory).length : 0;
        
        embed.addFields({
            name: site.name,
            value: `📍 ${site.location}\n📦 Active Deliveries: ${deliveryCount}\n📤 Output Items: ${outputCount}`,
            inline: false
        });
        
        siteIndex++;
    }

    if (siteCount > 10) {
        embed.setFooter({ text: `Showing 10 of ${siteCount} sites` });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleHousing(interaction) {
    const result = await apiCall('/housing/list', 'GET');
    
    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch housing information.');
        return;
    }

    const houses = result.data;
    const houseCount = Object.keys(houses).length;

    if (houseCount === 0) {
        await interaction.editReply('No houses owned.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x00AAFF)
        .setTitle(`🏠 Housing (${houseCount} owned)`)
        .setTimestamp();

    for (const [name, house] of Object.entries(houses)) {
        embed.addFields({
            name: name,
            value: `👤 Owner ID: \`${house.owner_unique_id}\`\n⏱️ Expires: ${house.expire_time}`,
            inline: false
        });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleBanlist(interaction) {
    const result = await apiCall('/player/banlist', 'GET');
    
    if (!result.succeeded) {
        await interaction.editReply('Failed to fetch ban list.');
        return;
    }

    const bans = result.data;
    const banCount = Object.keys(bans).length;

    if (banCount === 0) {
        await interaction.editReply('No players are currently banned.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`🚫 Banned Players (${banCount})`)
        .setTimestamp();

    for (const [index, player] of Object.entries(bans)) {
        embed.addFields({
            name: player.name,
            value: `ID: \`${player.unique_id}\``,
            inline: true
        });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleRoleList(interaction, role) {
    const result = await apiCall('/player/role/list', 'GET', { role });
    
    if (!result.succeeded) {
        await interaction.editReply(`Failed to fetch ${role} list.`);
        return;
    }

    const roleData = result.data[role] || {};
    const count = Object.keys(roleData).length;

    if (count === 0) {
        await interaction.editReply(`No ${role}s currently assigned.`);
        return;
    }

    const emoji = role === 'admin' ? '👑' : '👮';
    const embed = new EmbedBuilder()
        .setColor(role === 'admin' ? 0xFFD700 : 0x0066FF)
        .setTitle(`${emoji} ${role.charAt(0).toUpperCase() + role.slice(1)}s (${count})`)
        .setTimestamp();

    for (const [index, player] of Object.entries(roleData)) {
        embed.addFields({
            name: player.nickname,
            value: `ID: \`${player.unique_id}\``,
            inline: true
        });
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
        await interaction.editReply(`Failed to kick player: ${result.message}`);
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
        await interaction.editReply(`Failed to ban player: ${result.message}`);
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
        await interaction.editReply(`Failed to unban player: ${result.message}`);
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
        await interaction.editReply(`Failed to send announcement: ${result.message}`);
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
        await interaction.editReply(`Failed to send message: ${result.message}`);
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
    const targetUserId = targetUser.id;

    if (ADMIN_USER_IDS.includes(targetUserId)) {
        await interaction.editReply(`ℹ️ ${targetUser.tag} is already an admin.`);
        return;
    }

    ADMIN_USER_IDS.push(targetUserId);

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Admin Added')
        .setDescription(`${targetUser.tag} has been added as a bot admin.`)
        .addFields({
            name: 'Note',
            value: '⚠️ This change is temporary. To make it permanent, add their ID to the ADMIN_USER_IDS in your .env file:\n```\nADMIN_USER_IDS=120343643381956608,' + targetUserId + '\n```'
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
    const targetUserId = targetUser.id;

    // Prevent removing yourself if you're the last admin
    if (targetUserId === interaction.user.id && ADMIN_USER_IDS.length === 1) {
        await interaction.editReply('❌ Cannot remove yourself as the last admin.');
        return;
    }

    const index = ADMIN_USER_IDS.indexOf(targetUserId);
    if (index === -1) {
        await interaction.editReply(`ℹ️ ${targetUser.tag} is not an admin.`);
        return;
    }

    ADMIN_USER_IDS.splice(index, 1);

    const embed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('✅ Admin Removed')
        .setDescription(`${targetUser.tag} has been removed from bot admins.`)
        .addFields({
            name: 'Note',
            value: '⚠️ This change is temporary. To make it permanent, remove their ID from the ADMIN_USER_IDS in your .env file.'
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

client.login(DISCORD_TOKEN);
