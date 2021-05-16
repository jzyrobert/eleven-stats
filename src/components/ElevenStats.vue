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
              <Card class="p-p-4">
                <template #title>Matches</template>
                <template #content>
                  <p>
                    You <b>won</b> {{ STATS["WINS"](filteredMatches) }} out of
                    {{ matchNumber }} matches, a <b>winrate</b> of
                    {{ STATS["WINRATE"](filteredMatches) }}%
                  </p>
                  <p>
                    In that time, you played
                    {{ unique_opponents.uniqueCount }} <b>unique</b>
                    opponents.
                  </p>
                  <p>
                    You played an average of {{ matchCounts.average }} matches
                    per day, counting <b>only</b> days you played.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Marathon day</template>
                <template #content>
                  <p>
                    The <b>most</b> matches you played was on
                    {{ matchCounts.maxDate.toDateString() }}, with an impressive
                    <b>{{ matchCounts.max }}</b> matches.
                  </p>
                  <p>
                    Of those, you <b>won</b> {{ matchCounts.maxDateWins }}, with
                    a net ELO change of {{ matchCounts.maxDateElo }}.
                  </p>
                  <p>
                    You started the day with {{ matchCounts.maxDateStart }} ELO
                    and ended with {{ matchCounts.maxDateEnd }} ELO
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="ranked !== 'unranked'"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-4">
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
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title> Average opponent </template>
                <template #content>
                  <p>
                    At match time, your <b>average</b> opponent ELO was
                    {{ STATS["AVERAGE_ELO_MATCH"](filteredMatches) }}
                  </p>
                  <p>
                    On average, you played opponents
                    {{ Math.abs(average_elo_diff) }} ELO
                    <b>{{ average_elo_diff > 0 ? "below" : "above" }}</b>
                    yourself.
                  </p>
                  <p>
                    On average, your opponents have a winrate of
                    {{ STATS["AVERAGE_OPPONENT_WINRATE"](filteredMatches) }}%
                    ({{
                      STATS["AVERAGE_OPPONENT_WINRATE_UNIQUE"](filteredMatches)
                    }}% unique)
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title> Rematch time? </template>
                <template #content>
                  <p>
                    If you were to play each opponent <b>once</b> again, their
                    <b>average</b> ELO would be
                    {{ STATS["AVERAGE_ELO_UNIQUE"](filteredMatches) }}, putting
                    you {{ average_elo_diff_unique }} ELO
                    {{ average_elo_diff_unique > 0 ? "above" : "below" }} them.
                  </p>
                  <p>
                    Of those {{ unique_opponents.uniqueCount }}, you have
                    <b>never lost</b> to
                    {{ unique_opponents.neverLostCount }} and
                    <b>never won</b> to {{ unique_opponents.neverWonCount }} of
                    them.
                  </p>
                  <p>
                    You have played {{ unique_opponents.playedOnceCount }}
                    <b>only once</b>, and
                    {{ unique_opponents.playedMoreCount }} <b>at least 5</b>
                    times.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title
                  >Final boss? <Avatar style="vertical-align: middle" size="xlarge" image="src/assets/cat.png"
                /></template>
                <template #content>
                  <p>
                    The <b>highest</b> ELO opponent you played was
                    {{ highest_match_last.opponent.userName }} ({{
                      highest_match_last.opponent.id
                    }}) at {{ highest_match_last.opponent["match-elo"] }}.
                  </p>
                  <p>
                    You were {{ highest_match_last.self["match-elo"] }} ({{
                      highest_match_last["elo-diff-formatted"]
                    }}) and they are now
                    {{ highest_match_last.opponent["current-elo"] }}
                  </p>
                  <p>
                    You
                    <b>{{ highest_match_last.won ? "won" : "lost" }}</b> with a
                    score of {{ formatScore(highest_match_last) }}
                  </p>
                  <p v-if="highest_match_first.id != highest_match_last.id">
                    Your first match against
                    {{ highest_match_first.opponent.userName }} was at
                    {{ highest_match_first.self["match-elo"] }}-{{
                      highest_match_first.opponent["match-elo"]
                    }}. You
                    <b>{{ highest_match_first.won ? "won" : "lost" }}</b> with a
                    score of {{ formatScore(highest_match_first) }}
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Hidden Boss</template>
                <template #content>
                  <p>
                    The <b>highest</b> ELO opponent <b>now</b> would be
                    {{ highest_now_last.opponent.userName }} ({{
                      highest_now_last.opponent.id
                    }}) at {{ highest_now_last.opponent["current-elo"] }}.
                  </p>
                  <p>
                    You were {{ highest_now_last.self["match-elo"] }} ({{
                      highest_now_last["elo-diff-formatted"]
                    }}) and they were
                    {{ highest_now_last.opponent["match-elo"] }} when you last
                    played them.
                  </p>
                  <p>
                    You <b>{{ highest_now_last.won ? "won" : "lost" }}</b> with
                    a score of {{ formatScore(highest_now_last) }}
                  </p>
                  <p v-if="highest_now_first.id != highest_now_last.id">
                    Your first match against
                    {{ highest_now_first.opponent.userName }} was at
                    {{ highest_now_first.self["match-elo"] }}-{{
                      highest_now_first.opponent["match-elo"]
                    }}. You
                    <b>{{ highest_now_first.won ? "won" : "lost" }}</b> with a
                    score of {{ formatScore(highest_now_first) }}
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Go easy on them</template>
                <template #content>
                  <p>
                    The <b>lowest</b> ELO opponent you played was
                    {{ lowest_match.opponent.userName }} ({{
                      lowest_match.opponent.id
                    }}) at {{ lowest_match.opponent["match-elo"] }}.
                  </p>
                  <p>
                    You were {{ lowest_match.self["match-elo"] }} ({{
                      lowest_match["elo-diff-formatted"]
                    }}) and they are now
                    {{ lowest_match.opponent["current-elo"] }}
                  </p>
                  <p>
                    You <b>{{ lowest_match.won ? "won" : "lost" }}</b> with a
                    score of {{ formatScore(lowest_match) }}
                  </p>
                </template>
              </Card>
            </div>

            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Can it get worse?</template>
                <template #content>
                  <p>
                    The <b>lowest</b> ELO opponent <b>now</b> would be
                    {{ lowest_now.opponent.userName }} ({{
                      lowest_now.opponent.id
                    }}) at {{ lowest_now.opponent["current-elo"] }}.
                  </p>
                  <p>
                    You were {{ lowest_now.self["match-elo"] }} ({{
                      lowest_now["elo-diff-formatted"]
                    }}) and they were
                    {{ lowest_now.opponent["match-elo"] }} when you
                    <b>first</b> played
                  </p>
                  <p>
                    You <b>{{ lowest_now.won ? "won" : "lost" }}</b> with a
                    score of
                    {{ formatScore(lowest_now) }}
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Old friends and enemies</template>
                <template #content>
                  <div v-if="ranked === 'unranked'">
                    <p>
                      <b>Most</b> matches: {{ most_played.mostPlayed }} ({{
                        most_played.mostPlayedData[0].opponent.id
                      }}) with {{ most_played.mostPlayedGames }} matches,
                      winning {{ most_played.mostPlayedWon }}.
                    </p>
                    <p>
                      Most <b>wins</b>: {{ most_played.mostWon }} ({{
                        most_played.mostWonData[0].opponent.id
                      }}) with {{ most_played.mostWonGames }} matches, winning
                      {{ most_played.mostWonWon }}.
                    </p>
                    <p>
                      Most <b>losses</b>: {{ most_played.mostLost }} ({{
                        most_played.mostLostData[0].opponent.id
                      }}) with {{ most_played.mostLostGames }} matches, losing
                      {{ most_played.mostLostLost }}.
                    </p>
                  </div>
                  <div v-if="ranked !== 'unranked'">
                    <p>
                      <b>Most</b> matches: {{ most_played.mostPlayed }} ({{
                        most_played.mostPlayedData[0].opponent.id
                      }}) with {{ most_played.mostPlayedGames }} matches,
                      winning {{ most_played.mostPlayedWon }}, with a net ELO
                      change of {{ most_played.mostPlayedEloChange }}.
                    </p>
                    <p>
                      Most <b>wins</b>: {{ most_played.mostWon }} ({{
                        most_played.mostWonData[0].opponent.id
                      }}) with {{ most_played.mostWonGames }} matches, winning
                      {{ most_played.mostWonWon }}, with a net ELO change of
                      {{ most_played.mostWonEloChange }}.
                    </p>
                    <p>
                      Most <b>losses</b>: {{ most_played.mostLost }} ({{
                        most_played.mostLostData[0].opponent.id
                      }}) with {{ most_played.mostLostGames }} matches, losing
                      {{ most_played.mostLostLost }}, with a net ELO change of
                      {{ most_played.mostLostEloChange }}.
                    </p>
                  </div>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Rising talent</template>
                <template #content>
                  The opponent who <b>most improved</b> since you
                  <b>first</b> played them is
                  {{ most_improved.firstGame.opponent.userName }} ({{
                    most_improved.firstGame.opponent.id
                  }})
                  <p>
                    You were {{ most_improved.firstGame.self["match-elo"] }} ({{
                      most_improved.firstGame["elo-diff-formatted"]
                    }}) and they were
                    {{ most_improved.firstGame.opponent["match-elo"] }} when you
                    <b>first</b> played
                  </p>
                  <p>
                    They have since <b>risen</b> to
                    {{ most_improved.firstGame.opponent["current-elo"] }} ({{
                      most_improved.firstGame.opponent["elo-gain-formatted"]
                    }})
                  </p>
                  <p v-if="most_improved.lastGame">
                    You last played at
                    {{ most_improved.lastGame.self["match-elo"] }}-{{
                      most_improved.lastGame.opponent["match-elo"]
                    }}.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Fallen from grace</template>
                <template #content>
                  The opponent who <b>declined most</b> since you
                  <b>first</b> played them is
                  {{ least_improved.opponent.userName }} ({{
                    least_improved.opponent.id
                  }})
                  <p>
                    You were {{ least_improved.self["match-elo"] }} ({{
                      least_improved["elo-diff-formatted"]
                    }}) and they were
                    {{ least_improved.opponent["match-elo"] }} when you
                    <b>first</b>
                    played
                  </p>
                  <p>
                    They have since <b>fallen</b> to
                    {{ least_improved.opponent["current-elo"] }} ({{
                      least_improved.opponent["elo-gain-formatted"]
                    }})
                  </p>
                </template>
              </Card>
            </div>
            <div
              v-if="ranked !== 'unranked'"
              class="cardbox p-col-12 p-md-6 p-lg-3"
            >
              <Card class="p-p-4">
                <template #title>Grand Theft ELO</template>
                <template #content>
                  <p>
                    The most ELO you gained is from
                    {{ most_gained_lost.maxName }} ({{
                      most_gained_lost.maxId
                    }}), taking a net {{ most_gained_lost.maxGain }} from them.
                  </p>
                  <p>
                    The most ELO you lost is to
                    {{ most_gained_lost.minName }} ({{
                      most_gained_lost.minId
                    }}), losing a net {{ most_gained_lost.minGain }} to them.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Last chance</template>
                <template #content>
                  <p>
                    {{ all_round_stats.matchesTo3 }}% of your matches go to
                    <b>round 3</b>. Of those, you won
                    {{ all_round_stats.matchesTo3Won }}%.
                  </p>
                  <p>
                    {{ all_round_stats.roundsToOvertime }}% of your rounds go
                    <b>beyond</b> 11 points. Of those, you won
                    {{ all_round_stats.roundsToOvertimeWon }}%.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Fast win..or fast loss?</template>
                <template #content>
                  <p>
                    Of the remaining
                    {{ 100 - Number(all_round_stats.matchesTo3) }}% matches that
                    end in 2 rounds (or less??), you won
                    {{ all_round_stats.matchesTo2Won }}% of them.
                  </p>
                  <p>
                    You won {{ all_round_stats.hardWonRounds }} ({{
                      all_round_stats.hardWonRoundsPercentage
                    }}%) and lost {{ all_round_stats.hardLostRounds }} ({{
                      all_round_stats.hardLostRoundsPercentage
                    }}%) of your rounds 11-0.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>First impressions</template>
                <template #content>
                  <p>
                    In matches where you <b>win</b> the <b>first</b> round,
                    {{ all_round_stats.matchesFirstRoundWon }}% of them you win
                    in 2 rounds.
                  </p>
                  <p>
                    In matches where you <b>lose</b> the <b>first</b> round,
                    {{ all_round_stats.matchesFirstRoundLost }}% result in a
                    comeback win.
                  </p>
                </template>
              </Card>
            </div>
            <div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-4">
                <template #title>Ping-Pong</template>
                <template #content>
                  <p>
                    The longest round you won ended in
                    {{ all_round_stats.longestRoundWon["score-formatted"] }}
                    against
                    {{ all_round_stats.longestRoundWon["opponent-username"] }}
                    ({{ all_round_stats.longestRoundWon["opponent-id"] }})
                  </p>
                  <p>
                    The longest round you lost ended in
                    {{ all_round_stats.longestRoundLost["score-formatted"] }}
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
              <Card class="p-p-4">
                <template #title>Totally Real reasons you're losing</template>
                <template #content> Work in Progress! </template>
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
  MostPlayedStatistics,
  Ranked,
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

    // onMounted(() => {
    //   matches.value = processData(
    //     // SAMPLE.SAMPLE_ID_BIG,
    //     // SAMPLE.SAMPLE_MATCHES_BIG,
    //     // SAMPLE.SAMPLE_ROUNDS_BIG
    //     SAMPLE_HUGE.SAMPLE_ID_HUGE,
    //     SAMPLE_HUGE.SAMPLE_MATCHES_HUGE,
    //     SAMPLE_HUGE.SAMPLE_ROUNDS_HUGE
    //     // SAMPLE_TEST.SAMPLE_ID_TEST,
    //     //     SAMPLE_TEST.SAMPLE_MATCHES_TEST,
    //     //     SAMPLE_TEST.SAMPLE_ROUNDS_TEST
    //   );
    // });

    const chartData = ref({
      type: "pie",
      data: {
        labels: [
          "Hitting the bed",
          "Couldn't return serve",
          "Dog distracted you",
          "Arrow to the knee",
        ],
        datasets: [
          {
            backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
            data: [30, 20, 25, 15],
          },
        ],
      },
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
      chartData,
    };
  },
  computed: {
    formatDetailsHTML(): string {
      return `You selected ${this.details}`;
    },
    matchCounts(): {
      average: string;
      maxDate: Date;
      max: number;
      maxDateElo: number;
      maxDateWins: number;
      maxDateStart: number;
      maxDateEnd: number;
    } {
      return STATS["MATCHES_DAY"](this.filteredMatches);
    },
    gains(): Array<Object> {
      return [
        {
          type: "Gain",
          average: STATS["AVERAGE_GAIN"](this.filteredMatches),
          total: STATS["TOTAL_GAIN"](this.filteredMatches),
        },
        {
          type: "Loss",
          average: STATS["AVERAGE_LOSS"](this.filteredMatches),
          total: STATS["TOTAL_LOSS"](this.filteredMatches),
        },
        {
          type: "Net",
          average: STATS["AVERAGE_CHANGE"](this.filteredMatches),
          total: STATS["TOTAL_CHANGE"](this.filteredMatches),
        },
      ];
    },
    average_elo_diff(): number {
      return STATS.AVERAGE_ELO_DIFF_MATCH(this.filteredMatches);
    },
    average_elo_diff_unique(): number {
      return STATS["AVERAGE_ELO_DIFF_UNIQUE"](this.filteredMatches);
    },
    highest_match_last(): MatchData {
      return STATS.HIGHEST_MATCH(this.filteredMatches)!.last;
    },
    highest_match_first(): MatchData {
      return STATS.HIGHEST_MATCH(this.filteredMatches)!.first;
    },
    highest_now_last(): MatchData {
      return STATS.HIGHEST_NOW(this.filteredMatches)!.last;
    },
    highest_now_first(): MatchData {
      return STATS.HIGHEST_NOW(this.filteredMatches)!.first;
    },
    lowest_match(): MatchData {
      return STATS.LOWEST_MATCH(this.filteredMatches)!;
    },
    lowest_now(): MatchData {
      return STATS.LOWEST_NOW(this.filteredMatches)!;
    },
    most_improved(): {
      firstGame: MatchData;
      lastGame: MatchData | undefined;
    } {
      return STATS.MOST_IMPROVED(this.filteredMatches)!;
    },
    least_improved(): MatchData {
      return STATS.LEAST_IMPROVED(this.filteredMatches)!;
    },
    most_gained_lost(): {
      maxName: string;
      maxId: number;
      maxGain: number;
      minName: string;
      minId: number;
      minGain: number;
    } {
      return STATS.MOST_ELO_GAINED_LOST(this.filteredMatches);
    },
    most_played(): MostPlayedStatistics {
      return STATS.MOST_PLAYED(this.filteredMatches);
    },
    all_round_stats(): RoundStatistics {
      return STATS.ALL_ROUND_STATS(this.filteredMatches);
    },
    unique_opponents(): {
      uniqueCount: number;
      neverWonCount: number;
      neverLostCount: number;
      playedOnceCount: number;
      playedMoreCount: number;
    } {
      return STATS.UNIQUE_OPPONENTS(this.filteredMatches);
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
