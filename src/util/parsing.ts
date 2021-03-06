import {
  Home,
  MatchData,
  PlayerData,
  Ranked,
  Higher,
  RawMatchData,
  RawRoundData,
  RoundData,
  NewRawMatchData,
} from "../types/statTypes";
import dayjs from "dayjs";

const USE_NEW_API = true;

export async function getJSON(url: string) {
  const response = await fetch(url);
  return response.json();
}

export function formatScore(match: MatchData): string {
  let score = "";
  for (const round of match.rounds) {
    score += `${round["score-formatted"]} `;
  }
  return score;
}

export function filterMatches(
  matches: Array<MatchData>,
  ranked: Ranked,
  home: Home,
  higher: Higher,
  startDate: Date,
  endDate: Date,
  dayCutoff: number,
  complete: boolean,
  selfRange: Array<number>,
  opponentRange: Array<number>
) {
  const parsedStart = dayjs(startDate).startOf("day").add(dayCutoff, "hours");
  const parsedEnd = dayjs(endDate).endOf("day").add(dayCutoff, "hours");
  return matches.filter((match) => {
    // Bugged matches
    if (complete) {
      if (match.rounds.length < 2) {
        return false;
      }
      if (!match.complete) {
        return false;
      }
      if (!match.ranked && match["elo-change-corrected"] != 0) {
        return false;
      }
    }
    // Regular filtering
    if (ranked !== Ranked.All) {
      if (match.ranked !== (ranked === Ranked.Ranked)) {
        return false;
      }
    }
    if (home !== Home.All) {
      if (match.home !== (home === Home.Home)) {
        return false;
      }
    }
    if (higher !== Higher.All) {
      if (
        higher === Higher.Higher &&
        match.opponent["match-elo"] < match.self["match-elo"]
      ) {
        return false;
      } else if (
        higher === Higher.Lower &&
        match.opponent["match-elo"] >= match.self["match-elo"]
      ) {
        return false;
      }
    }
    if (
      match.offsetDate.isBefore(parsedStart) ||
      match.offsetDate.isAfter(parsedEnd)
    ) {
      return false;
    }
    if (
      match.self["match-elo"] < selfRange[0] ||
      match.self["match-elo"] > selfRange[1]
    ) {
      return false;
    }
    if (
      match.opponent["match-elo"] < opponentRange[0] ||
      match.opponent["match-elo"] > opponentRange[1]
    ) {
      return false;
    }
    return true;
  });
}

export async function collectAndProcessData(
  id: string,
  pullLimit: number
): Promise<Array<MatchData>> {
  if (USE_NEW_API) {
    return await processDataNew(id, pullLimit);
  } else {
    return await processDataOld(id, pullLimit);
  }
}

async function processDataNew(
  id: string,
  pullLimit: number
): Promise<Array<MatchData>> {
  const matches: Array<NewRawMatchData> = [];
  let page_size = 100
  if (pullLimit > 0 && pullLimit < page_size) {
    page_size = pullLimit;
  }
  var nexturl = `https://www.elevenvr.club/api/v1/accounts/${id}/matches?page[size]=${page_size}&unranked=true`;
  while (nexturl && (pullLimit == 0 || matches.length < pullLimit)) {
    const currentMatchData = await getJSON(nexturl);
    matches.push(...currentMatchData["data"]);
    nexturl = currentMatchData["links"]["next"];
  }
  console.log(`There are ${matches.length} ranked matches`)
  console.log(matches.filter(m => m.attributes.state != 1))
  console.log(matches.filter(m => m.attributes["winning-team"] < 0))
  console.log(matches.filter(m => m.attributes["winning-team"] > 1))
  console.log(matches.filter(m => m.attributes.rounds.length < 2))
  const processedMatches = new Array<MatchData>();
  matches.sort((m1, m2) => Number(m2.id) - Number(m1.id));
  for (const [index, match] of matches.entries()) {
    const home = match.attributes.players.find(p => p.id == parseInt(id))!.team == 0
    const newMatch: MatchData = {
      id: match.id,
      ranked: match.attributes.ranked,
      home: home,
      won: match.attributes["winning-team"] != Number(home),
      complete: match.attributes.state == 1 && match.attributes["winning-team"] > -1 && match.attributes["winning-team"] < 2,
      isBO5: false,
      self: createPlayerDataNew(id, match, true),
      opponent: createPlayerDataNew(id, match, false),
      "elo-diff": 0,
      "elo-diff-formatted": "",
      "elo-diff-now": 0,
      "elo-diff-now-formatted": "",
      "elo-change": match.attributes["elo-change"],
      "elo-change-corrected": 0,
      date: dayjs(match.attributes["created-at"]),
      offsetDate: dayjs(match.attributes["created-at"]),
      rounds: [],
    };
    newMatch["elo-diff"] =
      newMatch.self["match-elo"] - newMatch.opponent["match-elo"];
    newMatch["elo-diff-formatted"] = formatDiff(newMatch["elo-diff"]);
    newMatch["elo-diff-now"] =
      newMatch.self["current-elo"] - newMatch.opponent["current-elo"];
    newMatch["elo-diff-now-formatted"] = formatDiff(newMatch["elo-diff-now"]);
    for (const round of match.attributes.rounds) {
      const newRoundData: RoundData = {
        id: String(round.id),
        "opponent-id": newMatch.opponent.id,
        "opponent-username": newMatch.opponent.userName,
        "self-score": home
          ? round["home-score"]
          : round["away-score"],
        "opponent-score": home
          ? round["away-score"]
          : round["home-score"],
        "score-formatted": "",
        won: false,
        isDeuce:
          round["home-score"] >= 12 ||
          round["away-score"] >= 12,
        complete:
          round["home-score"] >= 11 ||
          round["away-score"] >= 11,
      };
      newRoundData[
        "score-formatted"
      ] = `${newRoundData["self-score"]}-${newRoundData["opponent-score"]}`;
      newRoundData["won"] =
        newRoundData["self-score"] > newRoundData["opponent-score"];
      newMatch.rounds.push(newRoundData);
    }
    newMatch.rounds.sort((r1, r2) => parseInt(r1.id) - parseInt(r2.id));
    newMatch.isBO5 =
      newMatch.rounds.length > 3 ||
      newMatch.rounds.filter((r) => r.won).length == 3 ||
      newMatch.rounds.filter((r) => !r.won).length == 3;
    processedMatches.push(newMatch);
  }
  processedMatches.forEach((m, index) => {
    m["elo-change-corrected"] =
      index > 0
        ? processedMatches[index - 1].self["match-elo"] - m.self["match-elo"]
        : m.self["current-elo"] - m.self["match-elo"];
  });
  return processedMatches;
}

async function processDataOld(
  id: string,
  pullLimit: number
): Promise<Array<MatchData>> {
  const matches: Array<RawMatchData> = [];
  const rounds: Array<RawRoundData> = [];
  var nexturl = `https://www.elevenvr.club/accounts/${id}/matches`;
  while (nexturl && (pullLimit == 0 || matches.length < pullLimit)) {
    const currentMatchData = await getJSON(nexturl);
    matches.push(...currentMatchData["data"]);
    rounds.push(...currentMatchData["included"]);
    nexturl = currentMatchData["links"]["next"];
  }
  const processedMatches = new Array<MatchData>();
  const hashedRounds = Object.fromEntries(rounds.map((r) => [r["id"], r]));
  matches.sort((m1, m2) => Number(m2.id) - Number(m1.id));
  for (const [index, match] of matches.entries()) {
    const home = match.attributes["home-team"][0]["id"] == parseInt(id);
    const newMatch: MatchData = {
      id: match.id,
      ranked: match.attributes.ranked,
      home: home,
      won: match.attributes["winner"] != Number(home),
      complete: match.attributes.state == 1 && match.attributes.winner > -1,
      isBO5: false,
      self: createPlayerData(home, match, true),
      opponent: createPlayerData(home, match, false),
      "elo-diff": 0,
      "elo-diff-formatted": "",
      "elo-diff-now": 0,
      "elo-diff-now-formatted": "",
      "elo-change": match.attributes["elo-change"],
      "elo-change-corrected": 0,
      date: dayjs(match.attributes["created-at"]),
      offsetDate: dayjs(match.attributes["created-at"]),
      rounds: [],
    };
    newMatch["elo-diff"] =
      newMatch.self["match-elo"] - newMatch.opponent["match-elo"];
    newMatch["elo-diff-formatted"] = formatDiff(newMatch["elo-diff"]);
    newMatch["elo-diff-now"] =
      newMatch.self["current-elo"] - newMatch.opponent["current-elo"];
    newMatch["elo-diff-now-formatted"] = formatDiff(newMatch["elo-diff-now"]);
    for (const round of match.relationships.rounds.data) {
      const roundData = hashedRounds[round.id];
      // console.log(round)
      const newRoundData: RoundData = {
        id: roundData.id,
        "opponent-id": newMatch.opponent.id,
        "opponent-username": newMatch.opponent.userName,
        "self-score": home
          ? roundData.attributes["home-score"]
          : roundData.attributes["away-score"],
        "opponent-score": home
          ? roundData.attributes["away-score"]
          : roundData.attributes["home-score"],
        "score-formatted": "",
        won: false,
        isDeuce:
          roundData.attributes["home-score"] >= 12 ||
          roundData.attributes["away-score"] >= 12,
        complete:
          roundData.attributes["home-score"] >= 11 ||
          roundData.attributes["away-score"] >= 11,
      };
      newRoundData[
        "score-formatted"
      ] = `${newRoundData["self-score"]}-${newRoundData["opponent-score"]}`;
      newRoundData["won"] =
        newRoundData["self-score"] > newRoundData["opponent-score"];
      newMatch.rounds.push(newRoundData);
    }
    newMatch.rounds.sort((r1, r2) => parseInt(r1.id) - parseInt(r2.id));
    newMatch.isBO5 =
      newMatch.rounds.length > 3 ||
      newMatch.rounds.filter((r) => r.won).length == 3 ||
      newMatch.rounds.filter((r) => !r.won).length == 3;
    processedMatches.push(newMatch);
  }
  processedMatches.forEach((m, index) => {
    m["elo-change-corrected"] =
      index > 0
        ? processedMatches[index - 1].self["match-elo"] - m.self["match-elo"]
        : m.self["current-elo"] - m.self["match-elo"];
  });
  return processedMatches;
}

function createPlayerDataNew(
  id: string,
  match: NewRawMatchData,
  self: boolean
): PlayerData {
  let raw = match.attributes.players.find(p => p.id == parseInt(id))!
  if (!self) {
    raw = match.attributes.players.find(p => p.id != parseInt(id))!
  }
  return {
    id: raw.id,
    userName: raw.username,
    "current-elo": raw["current-elo"],
    "match-elo": raw.elo,
    "elo-gain": raw["current-elo"] - raw.elo,
    "elo-gain-formatted": formatDiff(raw["current-elo"] - raw.elo),
    rank: raw.rank,
    wins: raw.wins,
    losses: raw.losses,
    lastOnline: raw["last-online"],
  };
}

function createPlayerData(
  home: boolean,
  match: RawMatchData,
  self: boolean
): PlayerData {
  let raw = match.attributes["home-team"][0];
  let score = match.attributes["home-elo"];
  if (home != self) {
    raw = match.attributes["away-team"][0];
    score = match.attributes["away-elo"];
  }
  return {
    id: raw.id,
    userName: raw.UserName,
    "current-elo": raw.ELO,
    "match-elo": score,
    "elo-gain": raw.ELO - score,
    "elo-gain-formatted": formatDiff(raw.ELO - score),
    rank: raw.Rank,
    wins: raw.Wins,
    losses: raw.Losses,
    lastOnline: raw.LastOnline,
  };
}

export function formatDiff(diff: number) {
  if (diff == 0) {
    return "=";
  } else if (diff > 0) {
    return `+${Math.round(diff)}`;
  } else {
    return Math.round(diff).toString();
  }
}
