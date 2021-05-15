import {
  Home,
  MatchData,
  PlayerData,
  Ranked,
  Higher,
  RawMatchData,
  RawRoundData,
  RoundData,
} from "../types/stats";

export function filterMatches(
  matches: Array<MatchData>,
  ranked: Ranked,
  home: Home,
  higher: Higher
) {
  return matches.filter((match) => {
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
        match.opponent["game-elo"] < match.self["game-elo"]
      ) {
        return false;
      } else if (
        higher === Higher.Lower &&
        match.opponent["game-elo"] >= match.self["game-elo"]
      ) {
        return false;
      }
    }
    return true;
  });
}

export function processData(
  id: string,
  matches: Array<RawMatchData>,
  rounds: Array<RawRoundData>
): Array<MatchData> {
  const processedMatches = new Array<MatchData>();
  const hashedRounds = Object.fromEntries(rounds.map((r) => [r["id"], r]));
  for (const match of matches) {
    const home = match.attributes["home-team"][0]["id"] == parseInt(id);
    const newMatch: MatchData = {
      id: match.id,
      ranked: match.attributes.ranked,
      home: home,
      won: match.attributes["winner"] != Number(home),
      self: createPlayerData(home, match, true),
      opponent: createPlayerData(home, match, false),
      "elo-change": match.attributes["elo-change"],
      date: new Date(match.attributes["created-at"]),
      rounds: [],
    };
    for (const round of match.relationships.rounds.data) {
      const roundData = hashedRounds[round.id];
      const newRoundData: RoundData = {
        id: roundData.id,
        "self-score": home
          ? roundData.attributes["home-score"]
          : roundData.attributes["away-score"],
        "opponent-score": home
          ? roundData.attributes["away-score"]
          : roundData.attributes["home-score"],
        won: false,
        complete:
          roundData.attributes["home-score"] >= 11 ||
          roundData.attributes["away-score"] >= 11,
      };
      newRoundData["won"] =
        newRoundData["self-score"] > newRoundData["opponent-score"];
      newMatch.rounds.push(newRoundData);
    }
    processedMatches.push(newMatch);
  }
  return processedMatches;
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
    "game-elo": score,
    rank: raw.Rank,
    wins: raw.Wins,
    losses: raw.Losses,
    lastOnline: raw.LastOnline,
  };
}
