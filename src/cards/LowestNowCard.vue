<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Can it get worse?</template>
      <template #content>
        <p>
          The <b>lowest</b> ELO opponent <b>now</b> would be
          {{ all_player_stats.lowestEloNow.last.opponent.userName }}
          ({{ all_player_stats.lowestEloNow.last.opponent.id }}) at
          <b>{{ all_player_stats.lowestEloNow.last.opponent["current-elo"] }}</b
          >.
        </p>
        <p>
          You <b>first</b> played at
          <b>{{ all_player_stats.lowestEloNow.last.self["match-elo"] }}</b>
          ({{ all_player_stats.lowestEloNow.last["elo-diff-formatted"] }}) vs
          <b>{{ all_player_stats.lowestEloNow.last.opponent["match-elo"] }}</b
          >, which you
          <b>{{ all_player_stats.lowestEloNow.last.won ? "won" : "lost" }}</b>
          with a score of
          {{ formatScore(all_player_stats.lowestEloNow.last) }}
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
  name: "LowestNowCard",
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
