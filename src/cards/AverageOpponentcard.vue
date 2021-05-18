<template>
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
          <b>{{ all_match_stats.average_elo_diff > 0 ? "below" : "above" }}</b>
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
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Card from "primevue/card";
import dayjs from "dayjs";
import {
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";

export default defineComponent({
  name: "AverageOpponentCard",
  components: {
    Card,
  },
  props: {
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      // required: false
      required: true,
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      required: false,
      // required: true
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      // required: false
      required: true,
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
  },
});
</script>

<style></style>
