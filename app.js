require('dotenv').config();

const _ = require('lodash');

const Discord = require('discord.js');
const PubgApi = require('pubg.js');

const embedFactory = require('./embed');
const errorHandler = require('./error-handler');

const {
    API_KEY: apiKey,
    APP_NAME: appName,
    SHARD_REGION: region,
    SHARD_API_KEY: pubgApiKey
} = process.env;

const client = new Discord.Client();
const pubgApiClient = new PubgApi.Client(pubgApiKey, region);

client.once('ready', () => {
    console.info(`✔ ${appName} is running...`);
});

client.on('message', async (message) => {
    if (!message.content.startsWith('!pubgstats')) return;

    const playerName = message.content.substring(11);
    console.info(`Fetching player details for ${playerName}`);

    try {
        const player = await pubgApiClient
            .getPlayer({name: playerName})
            .catch(errorHandler(`Player "${playerName}" not found`))

        const matchId = _.get(player, 'relationships.matches[0].id');
        if (!matchId) {
            message.channel.send(`Player ${playerName} doesn't have any recent games. Matches metadata expire after 14 days.`);
            return;
        }

        const match = await pubgApiClient
            .getMatch(matchId)
            .catch(errorHandler(`Match "${matchId}" not found`));
        if (!match) {
            message.channel.send(`Match with ID "${matchId}" couldn't be retrieved. Please try again.`);
        }

        const matchDetails = {
            date: _.get(match, 'attributes.createdAt'),
            duration: _.get(match, 'attributes.duration'),
            gameMode: _.get(match, 'attributes.gameMode'),
            mapName: _.get(match, 'attributes.mapName'),
        };

        const rosters = _.get(match, 'relationships.rosters', []);
        const roster = rosters.find(roster => {
            const participants = _.get(roster, 'relationships.participants');
            return participants.some((participant) => {
                return _.get(participant, 'attributes.stats.playerId') === player.id;
            });
        });

        const rankPosition = _.get(roster, 'attributes.stats.rank');
        const teamSquad = _.get(roster, 'relationships.participants', []).map(participant => ({
            name: _.get(participant, 'attributes.stats.name'),
            kills: _.get(participant, 'attributes.stats.kills'),
            damageDealt: _.get(participant, 'attributes.stats.damageDealt'),
            longestKill: _.get(participant, 'attributes.stats.longestKill'),
            killPlace: _.get(participant, 'attributes.stats.killPlace'),
        }));

        const embedMessage = embedFactory(matchDetails, rankPosition, teamSquad);
        message.channel.send(embedMessage);
    } catch (err) {
        console.error(err);
        message.channel.send(err.message);
    }
});

console.info(`🚀 Launching ${appName}...`);
client.login(apiKey);