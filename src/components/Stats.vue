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
        @change="resetID"
        v-model="name"
        name="name"
      />
      <Button class="p-m-2" label="submit" type="submit" />
    </form>
    <div v-if="message">{{ message }}</div>
    <ProgressSpinner v-if="!loaded" />
    <div v-if="loaded && matches.length == 0">
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
      <p v-html="formatDetailsHTML"></p>
      <p style="margin-bottom: 1cm"></p>
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
                {{ STATS["UNIQUE_OPPONENTS"](filteredMatches) }} unique
                opponents.
              </p>
              <p>
                You played an average of {{ matchCounts.average }} matches per
                day, counting <b>only</b> days you played.
              </p>
            </template>
          </Card>
        </div>
        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card class="p-p-4">
            <template #title>Marathon day</template>
            <template #content>
              <p>
                The most matches you played was on
                {{ matchCounts.maxDate.toDateString() }}, with an impressive
                {{ matchCounts.max }} matches.
              </p>
              <p>
                Of those, you won {{ matchCounts.maxDateWins }}, with a net ELO
                change of {{ matchCounts.maxDateElo }}.
              </p>
              <p>
                You started the day with {{ matchCounts.maxDateStart }} ELO and
                ended with {{ matchCounts.maxDateEnd }} ELO
              </p>
            </template>
          </Card>
        </div>
        <div v-if="ranked === 'ranked'" class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
            <template #title> ELO gains </template>
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
                <b>{{ average_elo_diff > 0 ? "below" : "above" }}</b> yourself.
              </p>
              <p>
                On average, your opponents have a winrate of
                {{ STATS["AVERAGE_OPPONENT_WINRATE"](filteredMatches) }}% ({{
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
              If you were to play each opponent <b>once</b> again, their
              <b>average</b> ELO would be
              {{ STATS["AVERAGE_ELO_UNIQUE"](filteredMatches) }}, putting you
              {{ average_elo_diff_unique }} ELO
              {{ average_elo_diff_unique > 0 ? "above" : "below" }} them.
            </template>
          </Card>
        </div>
        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
            <template #title>Final boss?</template>
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
                You <b>{{ highest_match_last.won ? "won" : "lost" }}</b> with a
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
          <Card>
            <template #title>Final boss: Rematch</template>
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
                You <b>{{ highest_now_last.won ? "won" : "lost" }}</b> with a
                score of {{ formatScore(highest_now_last) }}
              </p>
              <p v-if="highest_now_first.id != highest_now_last.id">
                Your first match against
                {{ highest_now_first.opponent.userName }} was at
                {{ highest_now_first.self["match-elo"] }}-{{
                  highest_now_first.opponent["match-elo"]
                }}. You <b>{{ highest_now_first.won ? "won" : "lost" }}</b> with
                a score of {{ formatScore(highest_now_first) }}
              </p>
            </template>
          </Card>
        </div>
        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
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
                You <b>{{ lowest_match.won ? "won" : "lost" }}</b> with a score
                of {{ formatScore(lowest_match) }}
              </p>
            </template>
          </Card>
        </div>

        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
            <template #title>Have mercy on them</template>
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
                }}) and they were {{ lowest_now.opponent["match-elo"] }} when
                you first played
              </p>
              <p>
                You <b>{{ lowest_now.won ? "won" : "lost" }}</b> with a score of
                {{ formatScore(lowest_now) }}
              </p>
            </template>
          </Card>
        </div>
        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
            <template #title>Rising talent</template>
            <template #content>
              The opponent who <b>most improved</b> since you first played them
              is {{ most_improved.opponent.userName }} ({{
                most_improved.opponent.id
              }})
              <p>
                You were {{ most_improved.self["match-elo"] }} ({{
                  most_improved["elo-diff-formatted"]
                }}) and they were {{ most_improved.opponent["match-elo"] }} when
                you first played
              </p>
              <p>
                They have since risen to
                {{ most_improved.opponent["current-elo"] }} ({{
                  most_improved.opponent["elo-gain-formatted"]
                }})
              </p>
            </template>
          </Card>
        </div>
        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
            <template #title>Fallen from grace</template>
            <template #content>
              The opponent who <b>declined most</b> since you first played them
              is {{ least_improved.opponent.userName }} ({{
                least_improved.opponent.id
              }})
              <p>
                You were {{ least_improved.self["match-elo"] }} ({{
                  least_improved["elo-diff-formatted"]
                }}) and they were
                {{ least_improved.opponent["match-elo"] }} when you first played
              </p>
              <p>
                They have since fallen to
                {{ least_improved.opponent["current-elo"] }} ({{
                  least_improved.opponent["elo-gain-formatted"]
                }})
              </p>
            </template>
          </Card>
        </div>
        <div class="cardbox p-col-12 p-md-6 p-lg-3">
          <Card>
            <template #title>Grand Theft ELO</template>
            <template #content>
              <p>
                The most ELO you gained is from
                {{ most_gained_lost.maxName }} ({{ most_gained_lost.maxId }}),
                taking a net {{ most_gained_lost.maxGain }} from them.
              </p>
              <p>
                The most ELO you lost is to
                {{ most_gained_lost.minName }} ({{ most_gained_lost.minId }}),
                losing a net {{ most_gained_lost.minGain }} to them.
              </p>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as STATS from "../util/stats";
import { processData, filterMatches } from "../util/util";
import * as SAMPLE from "../util/sample";
import {
  Ref,
  ref,
  defineComponent,
  onMounted,
  computed,
  ComputedRef,
} from "vue";
import { Higher, Home, MatchData, Ranked } from "../types/stats";
import dayjs from "dayjs";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

export default defineComponent({
  name: "Stats",
  components: {
    Calendar,
    InputText,
    Button,
    Dropdown,
    ProgressSpinner,
    Card,
    DataTable,
    Column,
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
      var message = `<b>${ranked.value}</b> ${filteredMatches.value.length} matches `;
      if (ranked.value !== Ranked.All) {
        message = `${filteredMatches.value.length} <b>${ranked.value}</b> matches `;
      }
      if (home.value !== Home.All) {
        if (home.value === Home.Home) {
          message += "that you <b>challenged</b> ";
        } else {
          message += "that you <b>accepted</b> ";
        }
      }
      if (higher.value !== Higher.All) {
        if (higher.value === Higher.Higher) {
          message += "against <b>higher</b> ranked opponents ";
        } else {
          message += "against <b>lower</b> ranked opponents ";
        }
      }
      if (
        startDate.value == earliestDate.value &&
        endDate.value != latestDate.value
      ) {
        message += `<b>before</b> ${endDate.value.toDateString()}`;
      } else if (
        endDate.value == latestDate.value &&
        startDate.value != earliestDate.value
      ) {
        message += `<b>after</b> ${startDate.value.toDateString()}`;
      } else if (
        startDate.value != earliestDate.value &&
        endDate.value != latestDate.value
      ) {
        message += `<b>between</b> ${startDate.value.toDateString()} and ${endDate.value.toDateString()}`;
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
        endDate.value
      )
    );
    const matchNumber = computed(() => filteredMatches.value.length);

    const startDate: Ref<Date> = ref(new Date());
    const endDate: Ref<Date> = ref(new Date());
    const earliestDate = computed(() => {
      if (matches.value.length > 0) {
        return dayjs(matches.value[matches.value.length - 1].date)
          .startOf("day")
          .toDate();
      } else {
        return new Date();
      }
    });

    const latestDate = computed(() => {
      if (matches.value.length > 0) {
        return dayjs(matches.value[0].date).startOf("day").toDate();
      } else {
        return new Date();
      }
    });

    onMounted(() => {
      matches.value = processData(
        SAMPLE.SAMPLE_ID_BIG,
        SAMPLE.SAMPLE_MATCHES_BIG,
        SAMPLE.SAMPLE_ROUNDS_BIG
      );
      startDate.value = earliestDate.value;
      endDate.value = latestDate.value;
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

      STATS,
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
    most_improved(): MatchData {
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
        score += `${round["self-score"]}-${round["opponent-score"]} `;
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
        return this.id;
      }
    },
    async collectStats() {
      this.matches = [];
      this.loaded = false;
      const id = await this.validateID();
      if (!id) {
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
