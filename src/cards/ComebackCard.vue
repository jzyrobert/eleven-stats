<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>First impressions</template>
      <template #content>
        <p>
          In matches where you <b>win</b> the <b>first</b> round,
          <b>{{ all_round_stats.matchesFirstRoundWon }}%</b> of them you win in
          2 rounds.
        </p>
        <p>
          In matches where you <b>lose</b> the <b>first</b> round,
          <b>{{ all_round_stats.matchesFirstRoundLost }}%</b> result in a
          comeback win.
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
  name: "ComebackCard",
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
