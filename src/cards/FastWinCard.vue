<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Fast win..or fast loss?</template>
      <template #content>
        <p>
          Of the remaining
          {{ 100 - Number(all_round_stats.matchesTo3) }}% matches that end in
          <b>2 rounds</b> (or less??), you won
          <b>{{ all_round_stats.matchesTo2Won }}%</b> of them.
        </p>
        <p>
          You won <b>{{ all_round_stats.hardWonRounds }}</b> ({{
            all_round_stats.hardWonRoundsPercentage
          }}%) and lost <b>{{ all_round_stats.hardLostRounds }}</b> ({{
            all_round_stats.hardLostRoundsPercentage
          }}%) of your rounds <b>11-0</b>.
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
  name: "CardName",
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
      required: false,
      // required: true
    },
    all_round_stats: {
      type: Object as PropType<RoundStatistics>,
      // required: false,
      required: true,
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
