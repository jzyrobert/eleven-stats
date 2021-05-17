<template>
  <div>
    <form @submit.prevent="collectStats">
      <label class="p-m-2" for="id">Enter Eleven ID (exact) </label>
      <InputText
        type="text"
        class="p-m-2"
        @focus="resetName"
        v-model="id"
        name="id"
      />
      <label class="p-m-2" for="id"> or Eleven Name (exact) </label>
      <InputText
        type="text"
        class="p-m-2"
        @focus="resetID"
        v-model="name"
        name="name"
      />
      <Button class="p-m-2" label="submit" type="submit" />
      <label for="offset">UTC Offset:</label>
      <InputNumber
        id="offset"
        inputStyle="width: 4rem"
        showButtons
        v-model="utcOffset"
        suffix=":00"
        :max="12"
        :min="-12"
      />
      <label for="cutoff">Day cutoff:</label>
      <InputNumber
        id="cutoff"
        inputStyle="width: 5rem"
        showButtons
        v-model="dayCutoff"
        suffix=":00 am"
        :max="7"
        :min="0"
      />
    </form>

    <div v-if="message">{{ message }}</div>
    <ProgressSpinner v-if="!loaded" />
    <div v-if="loaded && matches.length > 0 && filteredMatches.length == 0">
      Your selection does not match any matches!
    </div>
    <div v-if="matches.length > 0">
      <label for="ranked">Match type: </label>
      <Dropdown
        name="ranked"
        v-model="ranked"
        :options="rankedOptions"
        optionLabel="name"
        optionValue="val"
      />
      <label for="home"> Match Location: </label>
      <Dropdown
        name="home"
        v-model="home"
        :options="homeOptions"
        optionLabel="name"
        optionValue="val"
      />
      <label for="higher"> Opponent ELO: </label>
      <Dropdown
        name="higher"
        v-model="higher"
        :options="higherOptions"
        optionLabel="name"
        optionValue="val"
      />
      <label for="startDate"> Start date:</label>
      <Calendar
        name="startDate"
        v-model="startDate"
        selectOtherMonths
        dateFormat="yy-mm-dd"
        :minDate="earliestDate"
        :maxDate="endDate"
      />
      <label for="endDate"> End date:</label>
      <Calendar
        name="endDate"
        v-model="endDate"
        selectOtherMonths
        dateFormat="yy-mm-dd"
        :minDate="startDate"
        :maxDate="latestDate"
      />
      <h2 v-html="formatDetailsHTML"></h2>
      <TabView>
        <TabPanel header="Statistics">
          <div class="p-grid">
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Matches</template>
                <template #content>
                  <p>
                    You <b>won</b> {{ all_match_stats.won }} out of
                    {{ matchNumber }} matches, a <b>winrate</b> of
                    {{ all_match_stats.winrate }}%
                  </p>
                  <p>
                    In that time, you played
                    <b
                      >{{
                        all_player_stats.unique_opponents.uniqueCount
                      }}
                      unique</b
                    >
                    opponents.
                  </p>
                  <p>
                    You played an <b>average</b> of
                    <b>{{ all_match_stats.perDay.average }}</b> matches per day,
                    counting <b>only</b> days you played.
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="all_match_stats.perDay.maxPlayed <= 5"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title>Step it up</template>
                <template #content>
                  <p>
                    You have never played more than
                    {{ all_match_stats.perDay.maxPlayed }}
                    {{
                      all_match_stats.perDay.maxPlayed < 2 ? "match" : "matches"
                    }}
                    on any day!
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="all_match_stats.perDay.maxPlayed > 5"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title>Marathon day</template>
                <template #content>
                  <p>
                    The <b>most</b> matches you played was on
                    {{
                      dayjs(all_match_stats.perDay.maxDate).format(
                        "YYYY-MM-DD"
                      )
                    }}, with an impressive
                    <b>{{ all_match_stats.perDay.maxPlayed }}</b> matches.
                  </p>
                  <p>
                    Of those, you <b>won</b>
                    {{ all_match_stats.perDay.maxWins }}, with a net ELO change
                    of <b>{{ all_match_stats.perDay.maxNetElo }}</b
                    >.
                  </p>
                  <p>
                    You started the day with
                    <b>{{ all_match_stats.perDay.maxStartElo }}</b> ELO and
                    ended with <b>{{ all_match_stats.perDay.maxEndElo }}</b> ELO
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="ranked !== 'unranked'"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title> ELO gains (Not accurate) </template>
                <template #content>
                  <DataTable :value="gains">
                    <Column field="type" header="" />
                    <Column field="average" header="Average" />
                    <Column field="total" header="Total" />
                  </DataTable>
                </template>
              </Card>
            </div>
            <div
              v-if="ranked !== 'unranked'"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title> Good days and bad days </template>
                <template #content>
                  <p>
                    You <b>gained</b> the most ELO on
                    <b>{{
                      all_ranked_stats.bestDay.date.format("YYYY-MM-DD")
                    }}</b
                    >. Starting at <b>{{ all_ranked_stats.bestDay.startElo }}</b
                    >, you gained <b>{{ all_ranked_stats.bestDay.gain }}</b> ELO
                    over {{ all_ranked_stats.bestDay.played }} matches, winning
                    {{ all_ranked_stats.bestDay.won }} and finishing at
                    <b>{{ all_ranked_stats.bestDay.endElo }}</b
                    >.
                  </p>
                  <p v-if="all_ranked_stats.worstDay.gain < 0">
                    You <b>lost</b> the most ELO on
                    <b>{{
                      all_ranked_stats.worstDay.date.format("YYYY-MM-DD")
                    }}</b
                    >. Starting at
                    <b>{{ all_ranked_stats.worstDay.startElo }}</b
                    >, you lost <b>{{ all_ranked_stats.worstDay.gain }}</b> ELO
                    over {{ all_ranked_stats.worstDay.played }} matches, winning
                    {{ all_ranked_stats.worstDay.won }} and finishing at
                    <b>{{ all_ranked_stats.worstDay.endElo }}</b
                    >.
                  </p>
                  <p v-if="all_ranked_stats.worstDay.gain >= 0">
                    Wow, you have <b>never</b> ended a day with a net loss! You
                    gained the <b>least</b> ELO on
                    {{ all_ranked_stats.worstDay.date.format("YYYY-MM-DD") }}.
                    Starting at <b>{{ all_ranked_stats.worstDay.startElo }}</b
                    >, you gained
                    <b>{{ all_ranked_stats.worstDay.gain }}</b> ELO over
                    {{ all_ranked_stats.worstDay.played }} matches, winning
                    {{ all_ranked_stats.worstDay.won }} and finishing at
                    <b>{{ all_ranked_stats.worstDay.endElo }}</b
                    >.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title> Average opponent </template>
                <template #content>
                  <p>
                    At match time, your <b>average</b> opponent ELO was
                    <b>{{ all_match_stats.average_elo }}</b>
                  </p>
                  <p>
                    On average, you played opponents
                    <b>{{ Math.abs(all_match_stats.average_elo_diff) }}</b> ELO
                    <b>{{
                      all_match_stats.average_elo_diff > 0 ? "below" : "above"
                    }}</b>
                    yourself.
                  </p>
                  <p>
                    On average, your opponents have a winrate of
                    <b>{{ all_player_stats.opponent_winrate }}%</b> (<b
                      >{{ all_player_stats.unique_opponents.winrate }}%</b
                    >
                    unique)
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title> Rematch time? </template>
                <template #content>
                  <p>
                    If you were to play each opponent <b>once</b> again, their
                    <b>average</b> ELO would be
                    {{ STATS["AVERAGE_ELO_UNIQUE"](filteredMatches) }}, putting
                    you
                    {{ all_player_stats.unique_opponents.averageEloDiff }} ELO
                    {{
                      all_player_stats.unique_opponents.averageEloDiff > 0
                        ? "above"
                        : "below"
                    }}
                    them.
                  </p>
                  <p>
                    Of those
                    {{ all_player_stats.unique_opponents.uniqueCount }}, you
                    have <b>never lost</b> to
                    {{ all_player_stats.unique_opponents.neverLostCount }} and
                    <b>never won</b> to
                    {{ all_player_stats.unique_opponents.neverWonCount }} of
                    them.
                  </p>
                  <p>
                    You have played
                    {{ all_player_stats.unique_opponents.playedOnceCount }}
                    <b>only once</b>, and
                    {{ all_player_stats.unique_opponents.playedMoreCount }}
                    <b>at least 5</b>
                    times.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title
                  >Final boss?
                  <Avatar
                    v-if="
                      all_player_stats.highestElo.last.opponent['match-elo'] >
                      3100
                    "
                    style="vertical-align: middle"
                    size="large"
                    image="./cat.png"
                /></template>
                <template #content>
                  <p>
                    Your <b>highest</b> ELO opponent was
                    {{ all_player_stats.highestElo.last.opponent.userName }} ({{
                      all_player_stats.highestElo.last.opponent.id
                    }}) at
                    <b>{{
                      all_player_stats.highestElo.last.opponent["match-elo"]
                    }}</b
                    >. You were
                    <b>{{
                      all_player_stats.highestElo.last.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.highestElo.last["elo-diff-formatted"]
                    }}) and
                    <b>{{
                      all_player_stats.highestElo.last.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.highestElo.last) }}
                  </p>
                  <p
                    v-if="
                      all_player_stats.highestElo.first.id !=
                      all_player_stats.highestElo.last.id
                    "
                  >
                    You <b>first</b> played at
                    <b>{{
                      all_player_stats.highestElo.first.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.highestElo.first["elo-diff-formatted"]
                    }}) vs
                    <b>{{
                      all_player_stats.highestElo.first.opponent["match-elo"]
                    }}</b
                    >, which you
                    <b>{{
                      all_player_stats.highestElo.first.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.highestElo.first) }}
                  </p>
                  <p>
                    They are currently rated
                    <b>{{
                      all_player_stats.highestElo.last.opponent["current-elo"]
                    }}</b>
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="
                all_player_stats.highestEloNow.last.opponent.id !==
                all_player_stats.highestElo.last.opponent.id
              "
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title>Hidden Boss</template>
                <template #content>
                  <p>
                    Your <b>highest</b> ELO opponent <b>now</b> would be
                    {{ all_player_stats.highestEloNow.last.opponent.userName }}
                    ({{ all_player_stats.highestEloNow.last.opponent.id }}) at
                    <b>{{
                      all_player_stats.highestEloNow.last.opponent[
                        "current-elo"
                      ]
                    }}</b
                    >.
                  </p>
                  <p>
                    Your <b>last</b> played at
                    <b>{{
                      all_player_stats.highestEloNow.last.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.highestEloNow.last["elo-diff-formatted"]
                    }}) vs
                    <b>{{
                      all_player_stats.highestEloNow.last.opponent["match-elo"]
                    }}</b
                    >, which you
                    <b>{{
                      all_player_stats.highestEloNow.last.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.highestEloNow.last) }}
                  </p>
                  <p
                    v-if="
                      all_player_stats.highestEloNow.first.id !=
                      all_player_stats.highestEloNow.last.id
                    "
                  >
                    You <b>first</b> played at
                    <b>{{
                      all_player_stats.highestEloNow.first.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.highestEloNow.first[
                        "elo-diff-formatted"
                      ]
                    }}) vs
                    <b>{{
                      all_player_stats.highestEloNow.first.opponent["match-elo"]
                    }}</b
                    >, which you
                    <b>{{
                      all_player_stats.highestEloNow.first.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.highestEloNow.first) }}
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Go easy on them</template>
                <template #content>
                  <p>
                    Your <b>lowest</b> ELO opponent was
                    {{ all_player_stats.lowestElo.last.opponent.userName }} ({{
                      all_player_stats.lowestElo.last.opponent.id
                    }}) at
                    <b>{{
                      all_player_stats.lowestElo.last.opponent["match-elo"]
                    }}</b
                    >. You were
                    <b>{{
                      all_player_stats.lowestElo.last.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.lowestElo.last["elo-diff-formatted"]
                    }}) and
                    <b>{{
                      all_player_stats.lowestElo.last.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.lowestElo.last) }}
                  </p>
                  <p>
                    They are currently rated
                    <b>{{
                      all_player_stats.lowestElo.last.opponent["current-elo"]
                    }}</b>
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="
                all_player_stats.lowestEloNow.last.opponent.id !=
                all_player_stats.lowestElo.last.opponent.id
              "
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title>Can it get worse?</template>
                <template #content>
                  <p>
                    The <b>lowest</b> ELO opponent <b>now</b> would be
                    {{ all_player_stats.lowestEloNow.last.opponent.userName }}
                    ({{ all_player_stats.lowestEloNow.last.opponent.id }}) at
                    <b>{{
                      all_player_stats.lowestEloNow.last.opponent["current-elo"]
                    }}</b
                    >.
                  </p>
                  <p>
                    You <b>first</b> played at
                    <b>{{
                      all_player_stats.lowestEloNow.last.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.lowestEloNow.last["elo-diff-formatted"]
                    }}) vs
                    <b>{{
                      all_player_stats.lowestEloNow.last.opponent["match-elo"]
                    }}</b
                    >, which you
                    <b>{{
                      all_player_stats.lowestEloNow.last.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.lowestEloNow.last) }}
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Old friends and enemies</template>
                <template #content>
                  <div v-if="ranked === 'unranked'">
                    <p>
                      <b>Most</b> matches:
                      {{ all_player_stats.mostPlayed.username }} ({{
                        all_player_stats.mostPlayed.id
                      }}) with
                      <b>{{ all_player_stats.mostPlayed.matches }}</b> matches,
                      winning <b>{{ all_player_stats.mostPlayed.won }}</b
                      >.
                    </p>
                    <p>
                      Most <b>wins</b>:
                      {{ all_player_stats.mostWon.username }} ({{
                        all_player_stats.mostWon.id
                      }}) with
                      <b>{{ all_player_stats.mostWon.matches }}</b> matches,
                      winning <b>{{ all_player_stats.mostWon.won }}</b
                      >.
                    </p>
                    <p>
                      Most <b>losses</b>:
                      {{ all_player_stats.mostLost.username }} ({{
                        all_player_stats.mostLost.id
                      }}) with
                      <b>{{ all_player_stats.mostLost.matches }}</b> matches,
                      losing
                      <b>{{
                        all_player_stats.mostLost.matches -
                        all_player_stats.mostLost.won
                      }}</b
                      >.
                    </p>
                  </div>
                  <div v-if="ranked !== 'unranked'">
                    <p>
                      <b>Most</b> matches:
                      {{ all_player_stats.mostPlayed.username }} ({{
                        all_player_stats.mostPlayed.id
                      }}) with
                      <b>{{ all_player_stats.mostPlayed.matches }}</b> matches,
                      winning {{ all_player_stats.mostPlayed.won }}, with a net
                      ELO change of {{ all_player_stats.mostPlayed.gain }}.
                    </p>
                    <p>
                      Most <b>wins</b>:
                      {{ all_player_stats.mostWon.username }} ({{
                        all_player_stats.mostWon.id
                      }}) with
                      <b>{{ all_player_stats.mostWon.matches }}</b> matches,
                      winning {{ all_player_stats.mostWon.won }}, with a net ELO
                      change of {{ all_player_stats.mostWon.gain }}.
                    </p>
                    <p>
                      Most <b>losses</b>:
                      {{ all_player_stats.mostLost.username }} ({{
                        all_player_stats.mostLost.id
                      }}) with
                      <b>{{ all_player_stats.mostLost.matches }}</b> matches,
                      losing
                      {{
                        all_player_stats.mostLost.matches -
                        all_player_stats.mostLost.won
                      }}, with a net ELO change of
                      {{ all_player_stats.mostLost.gain }}.
                    </p>
                  </div>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Rising talent</template>
                <template #content>
                  Your <b>most improved</b> opponent is
                  {{ all_player_stats.mostImproved.first.opponent.userName }}
                  ({{ all_player_stats.mostImproved.first.opponent.id }})
                  <p>
                    You <b>first</b> played at
                    <b>{{
                      all_player_stats.mostImproved.first.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.mostImproved.first["elo-diff-formatted"]
                    }}) vs
                    <b>{{
                      all_player_stats.mostImproved.first.opponent["match-elo"]
                    }}</b
                    >, which you
                    {{
                      all_player_stats.mostImproved.first.won ? "won" : "lost"
                    }}
                    with a score of
                    {{ formatScore(all_player_stats.mostImproved.first) }}
                  </p>
                  <p>
                    They have since <b>risen</b> to
                    <b>{{
                      all_player_stats.mostImproved.first.opponent[
                        "current-elo"
                      ]
                    }}</b>
                    ({{
                      all_player_stats.mostImproved.first.opponent[
                        "elo-gain-formatted"
                      ]
                    }})
                  </p>
                  <p
                    v-if="
                      all_player_stats.mostImproved.last.id !=
                      all_player_stats.mostImproved.first.id
                    "
                  >
                    You <b>last</b> played at
                    <b>{{
                      all_player_stats.mostImproved.last.self["match-elo"]
                    }}</b>
                    vs
                    <b>{{
                      all_player_stats.mostImproved.last.opponent["match-elo"]
                    }}</b>
                    , which you
                    {{
                      all_player_stats.mostImproved.last.won ? "won" : "lost"
                    }}
                    with a score of
                    {{ formatScore(all_player_stats.mostImproved.last) }}.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Fallen from grace</template>
                <template #content>
                  Your <b>most declined</b> opponent is
                  {{ all_player_stats.leastImproved.first.opponent.userName }}
                  ({{ all_player_stats.leastImproved.first.opponent.id }})
                  <p>
                    You <b>first</b> played at
                    <b>{{
                      all_player_stats.leastImproved.first.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.leastImproved.first[
                        "elo-diff-formatted"
                      ]
                    }}) vs
                    <b>{{
                      all_player_stats.leastImproved.first.opponent["match-elo"]
                    }}</b
                    >, which you
                    {{
                      all_player_stats.leastImproved.first.won ? "won" : "lost"
                    }}
                    with a score of
                    {{ formatScore(all_player_stats.leastImproved.first) }}
                  </p>
                  <p>
                    They have since <b>fallen</b> to
                    <b>{{
                      all_player_stats.leastImproved.first.opponent[
                        "current-elo"
                      ]
                    }}</b>
                    ({{
                      all_player_stats.leastImproved.first.opponent[
                        "elo-gain-formatted"
                      ]
                    }})
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="ranked !== 'unranked'"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-2">
                <template #title>Grand Theft ELO</template>
                <template #content>
                  <p>
                    The most ELO you <b>gained</b> is from
                    {{ all_ranked_stats.mostGained.username }} ({{
                      all_ranked_stats.mostGained.id
                    }}), taking a net
                    <b>{{ all_ranked_stats.mostGained.gain }}</b> from them.
                  </p>
                  <p>
                    The most ELO you <b>lost</b> is to
                    {{ all_ranked_stats.mostLost.username }} ({{
                      all_ranked_stats.mostLost.id
                    }}), losing a net
                    <b>{{ all_ranked_stats.mostLost.gain }}</b> to them.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Ready set go</template>
                <template #content>
                  <DataTable :value="setTable">
                    <Column field="type" header="Match outcome" />
                    <Column field="average" header="Average Sets" />
                    <Column field="total" header="Total sets" />
                  </DataTable>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Last chance</template>
                <template #content>
                  <p>
                    <b>{{ all_round_stats.matchesTo3 }}%</b> of your matches go
                    to <b>round 3</b>. Of those, you won
                    <b>{{ all_round_stats.matchesTo3Won }}%</b>.
                  </p>
                  <p>
                    <b>{{ all_round_stats.roundsToOvertime }}%</b> of your
                    rounds go <b>beyond</b> 11 points. Of those, you won
                    <b> {{ all_round_stats.roundsToOvertimeWon }}%</b>.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Fast win..or fast loss?</template>
                <template #content>
                  <p>
                    Of the remaining
                    {{ 100 - Number(all_round_stats.matchesTo3) }}% matches that
                    end in <b>2 rounds</b> (or less??), you won
                    <b>{{ all_round_stats.matchesTo2Won }}%</b> of them.
                  </p>
                  <p>
                    You won <b>{{ all_round_stats.hardWonRounds }}</b> ({{
                      all_round_stats.hardWonRoundsPercentage
                    }}%) and lost
                    <b>{{ all_round_stats.hardLostRounds }}</b> ({{
                      all_round_stats.hardLostRoundsPercentage
                    }}%) of your rounds <b>11-0</b>.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>First impressions</template>
                <template #content>
                  <p>
                    In matches where you <b>win</b> the <b>first</b> round,
                    <b>{{ all_round_stats.matchesFirstRoundWon }}%</b> of them
                    you win in 2 rounds.
                  </p>
                  <p>
                    In matches where you <b>lose</b> the <b>first</b> round,
                    <b>{{ all_round_stats.matchesFirstRoundLost }}%</b> result
                    in a comeback win.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Points...</template>
                <template #content>
                  <DataTable :value="pointsTable">
                    <Column field="type" header="Set outcome" />
                    <Column field="setAverage" header="Average Set points" />
                    <Column field="setAverageWon" header="Average points won" />
                    <Column field="setAverageWinrate" header="Point Winrate">
                      <template #body="{ data }">
                        {{ data.setAverageWinrate }}%
                      </template>
                    </Column>
                    <Column field="setTotal" header="Total points" />
                  </DataTable>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>and more Points</template>
                <template #content>
                  <DataTable :value="pointsTable">
                    <Column field="type" header="Match outcome" />
                    <Column field="matchAverage" header="Average match points" />
                    <Column field="matchAverageWon" header="Average points won" />
                    <Column field="matchAverageWinrate" header="Point Winrate">
                      <template #body="{ data }">
                        {{ data.matchAverageWinrate }}%
                      </template>
                    </Column>
                    <Column field="matchTotal" header="Total points" />
                  </DataTable>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Ping-Pong</template>
                <template #content>
                  <p>
                    The <b>longest</b> round you <b>won</b> ended in
                    <b>{{
                      all_round_stats.longestRoundWon["score-formatted"]
                    }}</b>
                    against
                    {{ all_round_stats.longestRoundWon["opponent-username"] }}
                    ({{ all_round_stats.longestRoundWon["opponent-id"] }})
                  </p>
                  <p>
                    The <b>longest</b> round you <b>lost</b> ended in
                    <b>{{
                      all_round_stats.longestRoundLost["score-formatted"]
                    }}</b>
                    against
                    {{ all_round_stats.longestRoundLost["opponent-username"] }}
                    ({{ all_round_stats.longestRoundLost["opponent-id"] }})
                  </p>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Graphs">
          <div class="p-grid">
            <div class="cardbox p-col-12 p-md-6 p-lg-4">
              <Card class="p-p-2">
                <template #title>Totally Real reasons you're losing</template>
                <!-- <template #content> <LossChart /> </template> -->
              </Card>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script lang="ts">
import * as STATS from "../util/stats";
import { processData, filterMatches } from "../util/parsing";
// import * as SAMPLE from "../util/sample";
import * as SAMPLE_HUGE from "../util/sampleLarge";
// import * as SAMPLE_TEST from "../util/predator";
import {
  Ref,
  ref,
  defineComponent,
  onMounted,
  computed,
  ComputedRef,
} from "vue";
import {
  Higher,
  Home,
  MatchData,
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  Ranked,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import dayjs from "dayjs";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputNumber from "primevue/inputnumber";
import Avatar from "primevue/avatar";
import LossChart from "./LossChart.vue";

export default defineComponent({
  name: "ElevenStats",
  components: {
    Calendar,
    InputText,
    Button,
    Dropdown,
    ProgressSpinner,
    Card,
    DataTable,
    Column,
    TabView,
    TabPanel,
    InputNumber,
    Avatar,
    LossChart
  },
  setup() {
    const loaded = ref(true);

    const id = ref("");
    const name = ref("");
    // Displays status or error messages
    const message = ref("");

    const ranked = ref(Ranked.All);
    const rankedOptions = ref([
      { name: "All", val: Ranked.All },
      { name: "Ranked", val: Ranked.Ranked },
      { name: "Unranked", val: Ranked.Unranked },
    ]);
    const home = ref(Home.All);
    const homeOptions = ref([
      { name: "All", val: Home.All },
      { name: "Home", val: Home.Home },
      { name: "Away", val: Home.Away },
    ]);
    const higher = ref(Higher.All);
    const higherOptions = ref([
      { name: "All", val: Higher.All },
      { name: "Higher Opponent ELO", val: Higher.Higher },
      { name: "Lower Opponent ELO", val: Higher.Lower },
    ]);
    const details = computed(() => {
      var message = `<i>${ranked.value}</i> ${filteredMatches.value.length} matches `;
      if (ranked.value !== Ranked.All) {
        message = `${filteredMatches.value.length} <i>${ranked.value}</i> matches `;
      }
      if (home.value !== Home.All) {
        if (home.value === Home.Home) {
          message += "that you <i>challenged</i> ";
        } else {
          message += "that you <i>accepted</i> ";
        }
      }
      if (higher.value !== Higher.All) {
        if (higher.value === Higher.Higher) {
          message += "against <i>higher</i> ranked opponents ";
        } else {
          message += "against <i>lower</i> ranked opponents ";
        }
      }
      if (
        startDate.value.getTime() == earliestDate.value.getTime() &&
        endDate.value.getTime() != latestDate.value.getTime()
      ) {
        message += `<i>before</i> ${endDate.value.toDateString()}`;
      } else if (
        endDate.value.getTime() == latestDate.value.getTime() &&
        startDate.value.getTime() != earliestDate.value.getTime()
      ) {
        message += `<i>after</i> ${startDate.value.toDateString()}`;
      } else if (
        startDate.value.getTime() != earliestDate.value.getTime() &&
        endDate.value.getTime() != latestDate.value.getTime()
      ) {
        message += `<i>between</i> ${startDate.value.toDateString()} and ${endDate.value.toDateString()}`;
      }
      return message;
    });

    const matches = ref(new Array<MatchData>());
    const filteredMatches: ComputedRef<Array<MatchData>> = computed(() =>
      filterMatches(
        matches.value,
        ranked.value,
        home.value,
        higher.value,
        startDate.value,
        endDate.value,
        dayCutoff.value
      )
    );
    const matchNumber = computed(() => filteredMatches.value.length);

    const startDate: Ref<Date> = ref(new Date());
    const endDate: Ref<Date> = ref(new Date());
    const earliestDate = computed(() => {
      if (matches.value.length > 0) {
        return matches.value[matches.value.length - 1].offsetDate
          .startOf("day")
          .toDate();
      } else {
        return new Date();
      }
    });

    const latestDate = computed(() => {
      if (matches.value.length > 0) {
        return matches.value[0].offsetDate.startOf("day").toDate();
      } else {
        return new Date();
      }
    });

    const utcOffset = ref(0);
    const dayCutoff = ref(0);

    onMounted(() => {
      matches.value = processData(
        // SAMPLE.SAMPLE_ID_BIG,
        // SAMPLE.SAMPLE_MATCHES_BIG,
        // SAMPLE.SAMPLE_ROUNDS_BIG
        SAMPLE_HUGE.SAMPLE_ID_HUGE,
        SAMPLE_HUGE.SAMPLE_MATCHES_HUGE,
        SAMPLE_HUGE.SAMPLE_ROUNDS_HUGE
        // SAMPLE_TEST.SAMPLE_ID_TEST,
        //     SAMPLE_TEST.SAMPLE_MATCHES_TEST,
        //     SAMPLE_TEST.SAMPLE_ROUNDS_TEST
      );
    });

    return {
      loaded,

      id,
      name,
      message,

      ranked,
      home,
      higher,
      details,

      rankedOptions,
      homeOptions,
      higherOptions,

      matches,
      filteredMatches,
      matchNumber,
      startDate,
      endDate,
      earliestDate,
      latestDate,

      utcOffset,
      dayCutoff,

      STATS,
    };
  },
  computed: {
    formatDetailsHTML(): string {
      return `You selected ${this.details}`;
    },
    all_match_stats(): MatchStatistics {
      return STATS.ALL_MATCH_STATS(this.filteredMatches);
    },
    all_ranked_stats(): RankedStatistics {
      return STATS.ALL_RANKED_STATS(this.filteredMatches);
    },
    all_player_stats(): PlayerStatistics {
      return STATS.ALL_PLAYER_STATS(this.filteredMatches);
    },
    all_round_stats(): RoundStatistics {
      return STATS.ALL_ROUND_STATS(this.filteredMatches);
    },
    all_point_stats(): PointStatistics {
      return STATS.ALL_POINT_STATS(this.filteredMatches);
    },
    gains(): Array<Object> {
      return [
        {
          type: "Gain",
          average: this.all_ranked_stats.average_gain,
          total: this.all_ranked_stats.total_gain,
        },
        {
          type: "Loss",
          average: this.all_ranked_stats.average_loss,
          total: this.all_ranked_stats.total_loss,
        },
        {
          type: "Net",
          average: this.all_ranked_stats.average_change.toLocaleString(
            undefined,
            { maximumFractionDigits: 1, minimumFractionDigits: 1 }
          ),
          total: this.all_ranked_stats.total_change.toLocaleString(undefined, {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }),
        },
      ];
    },
    setTable(): Array<Object> {
      return [
        {
          type: "Won",
          average: this.all_round_stats.averageRoundsWon,
          total: this.all_round_stats.roundsWon,
        },
        {
          type: "Lost",
          average: this.all_round_stats.averageRoundsLost,
          total:
            this.all_round_stats.roundsPlayed - this.all_round_stats.roundsWon,
        },
        {
          type: "Overall",
          average: this.all_round_stats.averageRounds,
          total: this.all_round_stats.roundsPlayed,
        },
      ];
    },
    pointsTable(): Array<Object> {
      return [
        {
          type: "Won",
          setAverage: this.all_point_stats.wonSet.average,
          setAverageWon: this.all_point_stats.wonSet.averageWon,
          setAverageWinrate: this.all_point_stats.wonSet.winrate,
          setTotal: this.all_point_stats.wonSet.total,
          matchAverage: this.all_point_stats.wonMatch.average,
          matchAverageWon: this.all_point_stats.wonMatch.averageWon,
          matchAverageWinrate: this.all_point_stats.wonMatch.winrate,
          matchTotal: this.all_point_stats.wonMatch.total,
        },
        {
          type: "Lost",
          setAverage: this.all_point_stats.lostSet.average,
          setAverageWon: this.all_point_stats.lostSet.averageWon,
          setAverageWinrate: this.all_point_stats.lostSet.winrate,
          setTotal: this.all_point_stats.lostSet.total,
          matchAverage: this.all_point_stats.lostMatch.average,
          matchAverageWon: this.all_point_stats.lostMatch.averageWon,
          matchAverageWinrate: this.all_point_stats.lostMatch.winrate,
          matchTotal: this.all_point_stats.lostMatch.total,
        },
        {
          type: "Overall",
          setAverage: this.all_point_stats.set.average,
          setAverageWon: this.all_point_stats.set.averageWon,
          setAverageWinrate: this.all_point_stats.set.winrate,
          setTotal: this.all_point_stats.set.total,
          matchAverage: this.all_point_stats.match.average,
          matchAverageWon: this.all_point_stats.match.averageWon,
          matchAverageWinrate: this.all_point_stats.match.winrate,
          matchTotal: this.all_point_stats.match.total,
        },
      ];
    },
  },
  watch: {
    utcOffset() {
      this.matches = this.matches.map((m) => {
        m.offsetDate = m.date.add(this.utcOffset, "hours");
        return m;
      });
    },
    latestDate() {
      this.startDate = new Date(this.earliestDate.getTime());
      this.endDate = new Date(this.latestDate.getTime());
    },
  },
  methods: {
    dayjs: dayjs,
    resetName() {
      this.name = "";
    },
    resetID() {
      this.id = "";
    },
    formatScore(match: MatchData): string {
      let score = "";
      for (const round of match.rounds) {
        score += `${round["score-formatted"]} `;
      }
      return score;
    },
    async getJSON(url: string) {
      const response = await fetch(url);
      return response.json();
    },
    async validateID() {
      if (!this.name && !this.id) {
        return false;
      } else if (!this.id) {
        const results = await this.getJSON(
          `https://www.elevenvr.club/accounts/search/${encodeURIComponent(
            this.name
          )}`
        );
        for (const user of results.data) {
          if (user["attributes"]["user-name"] === this.name) {
            return user["id"];
          }
        }
        this.message = "No matching name found!";
        return false;
      } else {
        const check = await fetch(
          `https://www.elevenvr.club/accounts/${this.id}`
        );
        if (check.status === 404) {
          this.message = "No matching ID found!";
          return false;
        }
        this.name = (await check.json()).data.attributes["user-name"];
        return this.id;
      }
    },
    resetValues() {
      this.matches = [];
      this.loaded = false;
      this.ranked = Ranked.All;
      this.home = Home.All;
      this.higher = Higher.All;
      this.utcOffset = 0;
      this.dayCutoff = 0;
    },
    async collectStats() {
      this.resetValues();
      const id = await this.validateID();
      if (!id) {
        this.loaded = true;
        return;
      } else {
        this.id = id;
      }
      const matches = [];
      const rounds = [];
      var nexturl = `https://www.elevenvr.club/accounts/${this.id}/matches`;
      // let currentPage = 0;
      // let totalPages = 0;
      while (nexturl) {
        // this.message = `Collecting match data: ${currentPage} of ${totalPages} pages`;
        const currentMatchData = await this.getJSON(nexturl);
        matches.push(...currentMatchData["data"]);
        rounds.push(...currentMatchData["included"]);
        // currentPage++;
        // if (currentPage <= 1) {
        //   totalPages = parseInt(
        //     (currentMatchData["links"]["last"] as string).match(
        //       /page%5Bnumber%5D=(\d+)/
        //     )![1]
        //   );
        // }
        nexturl = currentMatchData["links"]["next"];
      }
      this.matches = processData(id, matches, rounds);
      this.message = "";
      this.loaded = true;
      this.startDate = this.earliestDate;
      this.endDate = this.latestDate;
    },
  },
});
</script>

<style scoped>
a {
  color: #42b983;
}

p {
  margin: 10px;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}

.cardbox {
  padding: 5px;
}

.p-card {
  height: 100%;
}
</style>
