<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title> Rematch time? </template>
      <template #content>
        <p>
          If you were to play each opponent <b>once</b> again, their
          <b>average</b> ELO would be
          {{ all_player_stats.unique_opponents_elo }}, putting you
          {{ all_player_stats.unique_opponents.averageEloDiff }} ELO
          {{
            all_player_stats.unique_opponents.averageEloDiff > 0
              ? "above"
              : "below"
          }}
          them.
        </p>
        <p>
          Of those
          {{ all_player_stats.unique_opponents.uniqueCount }}, you have
          <b>never lost</b> to
          {{ all_player_stats.unique_opponents.neverLostCount }} and
          <b>never won</b> to
          {{ all_player_stats.unique_opponents.neverWonCount }} of them.
        </p>
        <p>
          You have played
          {{ all_player_stats.unique_opponents.playedOnceCount }}
          <b>only once</b>, and
          {{ all_player_stats.unique_opponents.playedMoreCount }}
          <b>at least 5</b>
          times.
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
  name: "UniqueOpponentCard",
  components: {
    Card,
  },
  props: {
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      // required: false
      // required: true,
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
  },
});
</script>

<style></style>
