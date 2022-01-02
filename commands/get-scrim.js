const axios = require("axios").default
const moment = require('moment');
const stringtable = require('string-table');
const fs = require('fs');

const config = require('../config.json');


const summoners_api = axios.create({
    baseURL: "https://la1.api.riotgames.com/lol/summoner/v4/summoners",
    headers: { "X-Riot-Token": config.riot_api }
})

const matchs_api = axios.create({
    baseURL: "https://americas.api.riotgames.com/lol/match/v5/matches",
    headers: { "X-Riot-Token": config.riot_api }
})



exports.run = (_client, message, _args) => {

    (async () => {
        try {


            const [tag, enemy_team] = _args

            message.channel.send(`preparing file for last scrim of ${tag}`)


            const query_account = await summoners_api.get(`/by-name/${tag}`)
            const summoner = query_account.data
            
            const matchs_query = await matchs_api.get(`/by-puuid/${summoner.puuid}/ids`)
            const matchs = matchs_query.data

            const [last_match] = matchs

            const last_match_query = await matchs_api.get(`/${last_match}`)
            const last_match_info = last_match_query.data.info

            const participants = last_match_info.participants

            const our_team = participants.find(p => p.summonerName === tag).teamId
            const team_data = participants.filter(p => p.teamId === our_team)
            const enemy_data = participants.filter(p => p.teamId !== our_team)

            const today = moment().format("DD/MM/YYYY")
            const rows = []

            for (const player of team_data) {

                const row = {
                    scrim: enemy_team,
                    player: player.summonerName,
                    date: today,
                    side: our_team === 100 ? "BLUE" : "RED",
                    time: (player.timePlayed / 60).toFixed(0),
                    lane: player.individualPosition.replace("UTILITY", "SUPP"),
                    champion: player.championName,
                    champion_enemy: enemy_data.find(p => p.individualPosition === player.individualPosition).championName,
                    minions: player.totalMinionsKilled + player.neutralMinionsKilled,
                    kills: player.kills,
                    deaths: player.deaths,
                    assists: player.assists,
                    pinks: player.visionWardsBoughtInGame,
                    wards: player.wardsPlaced,
                    vision: player.visionScore,
                    total_kills: team_data.reduce((acc, row) => row.kills + acc, 0),
                    total_deaths: team_data.reduce((acc, row) => row.deaths + acc, 0),
                    total_assists: team_data.reduce((acc, row) => row.assists + acc, 0),
                    result: player.win ? "WIN" : "LOSE"

                }

                rows.push(row)

            }

            const table = stringtable.create(rows)
            fs.writeFileSync(`./${summoner.puuid}.txt`, table)


           await message.channel.send({
                content: 'Ready!',
                files: [{
                    attachment: `./${summoner.puuid}.txt`,
                    name: 'scrim.txt',
                    description: 'scrim file'
                }]
            })
            fs.unlinkSync(`./${summoner.puuid}.txt`)
        } catch (err) {
            message.channel.send(`something its broken D:\n pls try later`)

        }
    })()

}