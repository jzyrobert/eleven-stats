<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Rising talent</template>
      <template #content>
        Your <b>most improved</b> opponent is
        {{ all_player_stats.mostImproved.first.opponent.userName }}
        ({{ all_player_stats.mostImproved.first.opponent.id }})
        <p>
          You <b>first</b> played at
          <b>{{ all_player_stats.mostImproved.first.self["match-elo"] }}</b>
          ({{ all_player_stats.mostImproved.first["elo-diff-formatted"] }}) vs
          <b>{{ all_player_stats.mostImproved.first.opponent["match-elo"] }}</b
          >, which you
          {{ all_player_stats.mostImproved.first.won ? "won" : "lost" }}
          with a score of
          {{ formatScore(all_player_stats.mostImproved.first) }}
        </p>
        <p>
          They have since <b>risen</b> to
          <b>{{
            all_player_stats.mostImproved.first.opponent["current-elo"]
          }}</b>
          ({{
            all_player_stats.mostImproved.first.opponent["elo-gain-formatted"]
          }})
        </p>
        <p
          v-if="
            all_player_stats.mostImproved.last.id !=
            all_player_stats.mostImproved.first.id
          "
        >
          You <b>last</b> played at
          <b>{{ all_player_stats.mostImproved.last.self["match-elo"] }}</b>
          vs
          <b>{{ all_player_stats.mostImproved.last.opponent["match-elo"] }}</b>
          , which you
          {{ all_player_stats.mostImproved.last.won ? "won" : "lost" }}
          with a score of
          {{ formatScore(all_player_stats.mostImproved.last) }}.
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
  name: "MostImprovedCard",
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
