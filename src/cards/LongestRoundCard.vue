<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Ping-Pong</template>
      <template #content>
        <p>
          The <b>longest</b> round you <b>won</b> ended in
          <b>{{ all_round_stats.longestRoundWon["score-formatted"] }}</b>
          against
          {{ all_round_stats.longestRoundWon["opponent-username"] }}
          ({{ all_round_stats.longestRoundWon["opponent-id"] }})
        </p>
        <p>
          The <b>longest</b> round you <b>lost</b> ended in
          <b>{{ all_round_stats.longestRoundLost["score-formatted"] }}</b>
          against
          {{ all_round_stats.longestRoundLost["opponent-username"] }}
          ({{ all_round_stats.longestRoundLost["opponent-id"] }})
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
