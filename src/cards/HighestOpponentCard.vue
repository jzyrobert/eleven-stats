<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title
        >Final boss?
        <Avatar
          v-if="all_player_stats.highestElo.last.opponent['match-elo'] > 3100"
          style="vertical-align: middle"
          size="large"
          image="./cat.png"
      /></template>
      <template #content>
        <p>
          Your <b>highest</b> ELO opponent was
          {{ all_player_stats.highestElo.last.opponent.userName }} ({{
            all_player_stats.highestElo.last.opponent.id
          }}) at
          <b>{{ all_player_stats.highestElo.last.opponent["match-elo"] }}</b
          >. You were
          <b>{{ all_player_stats.highestElo.last.self["match-elo"] }}</b>
          ({{ all_player_stats.highestElo.last["elo-diff-formatted"] }}) and
          <b>{{ all_player_stats.highestElo.last.won ? "won" : "lost" }}</b>
          with a score of
          {{ formatScore(all_player_stats.highestElo.last) }}
        </p>
        <p
          v-if="
            all_player_stats.highestElo.first.id !=
            all_player_stats.highestElo.last.id
          "
        >
          You <b>first</b> played at
          <b>{{ all_player_stats.highestElo.first.self["match-elo"] }}</b>
          ({{ all_player_stats.highestElo.first["elo-diff-formatted"] }}) vs
          <b>{{ all_player_stats.highestElo.first.opponent["match-elo"] }}</b
          >, which you
          <b>{{ all_player_stats.highestElo.first.won ? "won" : "lost" }}</b>
          with a score of
          {{ formatScore(all_player_stats.highestElo.first) }}
        </p>
        <p>
          They are currently rated
          <b>{{ all_player_stats.highestElo.last.opponent["current-elo"] }}</b>
        </p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { formatScore } from "../util/parsing";
import { Card, Avatar } from "../components/primeIndex";
import dayjs from "dayjs";
import {
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";

export default defineComponent({
  name: "CardName",
  components: {
    Card,
    Avatar,
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
