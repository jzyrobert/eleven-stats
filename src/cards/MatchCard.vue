<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Matches</template>
      <template #content>
        <p>
          You <b>won</b> {{ all_match_stats.won }} out of
          {{ all_match_stats.played }} matches, a <b>winrate</b> of
          {{ all_match_stats.winrate }}%
        </p>
        <p>
          In that time, you played
          <b>{{ all_player_stats.unique_opponents.uniqueCount }} unique</b>
          opponents.
        </p>
        <p>
          You played an <b>average</b> of
          <b>{{ all_match_stats.perDay.average }}</b> matches per day, counting
          <b>only</b> days you played.
        </p>
        <p>
          Your first game was on
          <b>{{ all_match_stats.perDay.startDate.format("YYYY-MM-DD") }}</b> and
          you have played on <b>{{ all_match_stats.perDay.daysPlayed }}</b> of <b>{{ all_match_stats.perDay.daysSinceStart }}</b> days since then.
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
  name: "MatchCard",
  components: {
    Card,
  },
  props: {
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      // required: false,
      required: true,
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      required: false,
      // required: true
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      // required: false,
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
    formatScore: formatScore,
  },
});
</script>

<style></style>
