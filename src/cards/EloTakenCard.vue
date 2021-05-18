<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Grand Theft ELO</template>
      <template #content>
        <p>
          The most ELO you <b>gained</b> is from
          {{ all_ranked_stats.mostGained.username }} ({{
            all_ranked_stats.mostGained.id
          }}), taking a net <b>{{ all_ranked_stats.mostGained.gain }}</b> from
          them.
        </p>
        <p>
          The most ELO you <b>lost</b> is to
          {{ all_ranked_stats.mostLost.username }} ({{
            all_ranked_stats.mostLost.id
          }}), losing a net <b>{{ all_ranked_stats.mostLost.gain }}</b> to them.
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
    formatScore: formatScore,
  },
});
</script>

<style></style>
