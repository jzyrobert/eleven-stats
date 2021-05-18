<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title> Good days and bad days </template>
      <template #content>
        <p>
          You <b>gained</b> the most ELO on
          <b>{{ all_ranked_stats.bestDay.date.format("YYYY-MM-DD") }}</b
          >. Starting at <b>{{ all_ranked_stats.bestDay.startElo }}</b
          >, you gained <b>{{ all_ranked_stats.bestDay.gain }}</b> ELO over
          {{ all_ranked_stats.bestDay.played }} matches, winning
          {{ all_ranked_stats.bestDay.won }} and finishing at
          <b>{{ all_ranked_stats.bestDay.endElo }}</b
          >.
        </p>
        <p v-if="all_ranked_stats.worstDay.gain < 0">
          You <b>lost</b> the most ELO on
          <b>{{ all_ranked_stats.worstDay.date.format("YYYY-MM-DD") }}</b
          >. Starting at <b>{{ all_ranked_stats.worstDay.startElo }}</b
          >, you lost <b>{{ all_ranked_stats.worstDay.gain }}</b> ELO over
          {{ all_ranked_stats.worstDay.played }} matches, winning
          {{ all_ranked_stats.worstDay.won }} and finishing at
          <b>{{ all_ranked_stats.worstDay.endElo }}</b
          >.
        </p>
        <p v-if="all_ranked_stats.worstDay.gain >= 0">
          Wow, you have <b>never</b> ended a day with a net loss! You gained the
          <b>least</b> ELO on
          {{ all_ranked_stats.worstDay.date.format("YYYY-MM-DD") }}. Starting at
          <b>{{ all_ranked_stats.worstDay.startElo }}</b
          >, you gained <b>{{ all_ranked_stats.worstDay.gain }}</b> ELO over
          {{ all_ranked_stats.worstDay.played }} matches, winning
          {{ all_ranked_stats.worstDay.won }} and finishing at
          <b>{{ all_ranked_stats.worstDay.endElo }}</b
          >.
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
  name: "GoodBadCard",
  components: {
    Card,
  },
  props: {
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      required: false,
      // required: true,
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      // required: false,
      required: true
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      required: false,
      // required: true
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
