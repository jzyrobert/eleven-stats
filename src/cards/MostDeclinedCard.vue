<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Fallen from grace</template>
      <template #content>
        Your <b>most declined</b> opponent is
        {{ all_player_stats.leastImproved.first.opponent.userName }}
        ({{ all_player_stats.leastImproved.first.opponent.id }})
        <p>
          You <b>first</b> played at
          <b>{{ all_player_stats.leastImproved.first.self["match-elo"] }}</b>
          ({{ all_player_stats.leastImproved.first["elo-diff-formatted"] }}) vs
          <b>{{ all_player_stats.leastImproved.first.opponent["match-elo"] }}</b
          >, which you
          {{ all_player_stats.leastImproved.first.won ? "won" : "lost" }}
          with a score of
          {{ formatScore(all_player_stats.leastImproved.first) }}
        </p>
        <p>
          They have since <b>fallen</b> to
          <b>{{
            all_player_stats.leastImproved.first.opponent["current-elo"]
          }}</b>
          ({{
            all_player_stats.leastImproved.first.opponent["elo-gain-formatted"]
          }})
        </p>
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
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import { formatScore } from "../util/parsing";

export default defineComponent({
  name: "MostDeclinedCard",
  components: {
    Card,
  },
  props: {
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
