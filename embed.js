const Discord = require('discord.js');
const Moment = require('moment');

module.exports = embedMessageFactory;

function embedMessageFactory(matchDetails, rank, teamSquad) {
    const {
        date,
        duration,
        gameMode,
        mapName,
    } = matchDetails;

    const createdOn = Moment(date);
    const now = Moment();
    const when = Moment.duration(createdOn.diff(now)).humanize(true);
    const matchDuration = Moment.duration(duration, 'seconds').humanize();

    const embedMessage = new Discord.RichEmbed()
        .setColor('#FF001A')
        .setTitle('Your last match stats')
        .setDescription(`Date: ${when} - Map ${mapName.toUpperCase()} - Mode: ${gameMode.toUpperCase()} - Duration: ${matchDuration}`)
        .addBlankField()
        .addField('Rank Position', rank)
        .addBlankField()
    teamSquad.forEach(player => {
        const {name, kills, damageDealt, longestKill, killPlace} = player;

        embedMessage
            .addField(`Player`, name, true)
            .addField('Kills', kills, true)
            .addField('Damage Dealt', damageDealt, true)
            .addField('Killer Ranking', killPlace, true)
            .addField('Longest Kill', longestKill, true)
            .addBlankField();
    });

    embedMessage.setTimestamp();

    return embedMessage;
}