<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Old friends and enemies</template>
      <template #content>
        <div v-if="ranked === 'unranked' || !hasRanked">
          <p>
            <b>Most</b> matches: {{ all_player_stats.mostPlayed.username }} ({{
              all_player_stats.mostPlayed.id
            }}) with <b>{{ all_player_stats.mostPlayed.matches }}</b> matches,
            winning <b>{{ all_player_stats.mostPlayed.won }}</b
            >.
          </p>
          <p>
            Most <b>wins</b>: {{ all_player_stats.mostWon.username }} ({{
              all_player_stats.mostWon.id
            }}) with <b>{{ all_player_stats.mostWon.matches }}</b> matches,
            winning <b>{{ all_player_stats.mostWon.won }}</b
            >.
          </p>
          <p>
            Most <b>losses</b>: {{ all_player_stats.mostLost.username }} ({{
              all_player_stats.mostLost.id
            }}) with <b>{{ all_player_stats.mostLost.matches }}</b> matches,
            losing
            <b>{{
              all_player_stats.mostLost.matches - all_player_stats.mostLost.won
            }}</b
            >.
          </p>
        </div>
        <div v-else>
          <p>
            <b>Most</b> matches: {{ all_player_stats.mostPlayed.username }} ({{
              all_player_stats.mostPlayed.id
            }}) with <b>{{ all_player_stats.mostPlayed.matches }}</b> matches,
            winning {{ all_player_stats.mostPlayed.won }}, with a net ELO change
            of {{ all_player_stats.mostPlayed.gain }}.
          </p>
          <p>
            Most <b>wins</b>: {{ all_player_stats.mostWon.username }} ({{
              all_player_stats.mostWon.id
            }}) with <b>{{ all_player_stats.mostWon.matches }}</b> matches,
            winning {{ all_player_stats.mostWon.won }}, with a net ELO change of
            {{ all_player_stats.mostWon.gain }}.
          </p>
          <p>
            Most <b>losses</b>: {{ all_player_stats.mostLost.username }} ({{
              all_player_stats.mostLost.id
            }}) with <b>{{ all_player_stats.mostLost.matches }}</b> matches,
            losing
            {{
              all_player_stats.mostLost.matches - all_player_stats.mostLost.won
            }}, with a net ELO change of {{ all_player_stats.mostLost.gain }}.
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Card } from "../components/primeIndex";
import dayjs from "dayjs";
import {
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  Ranked,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import { formatScore } from "../util/parsing";

export default defineComponent({
  name: "MostPlayedOpponentsCard",
  components: {
    Card,
  },
  props: {
    hasRanked: {
      type: Boolean,
      required: true
    },
    ranked: {
      type: String,
      required: true
    },
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      required: false,
      // required: true
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      required: false,
      // required: true
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      // required: false,
      required: true
    },
    all_round_stats: {
      type: Object as PropType<RoundStatistics>,
      required: false,
      // required: true
    },
    all_point_stats: {
      type: Object as PropType<PointStatistics>,
      required: false,
      // required: true
    },
  },
  methods: {
    dayjs: dayjs,
    formatScore: formatScore,
  },
});
</script>

<style></style>
