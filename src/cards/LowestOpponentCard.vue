<template>
<div class="cardbox p-col-12 p-md-6 p-lg-3">
              <Card class="p-p-2">
                <template #title>Go easy on them</template>
                <template #content>
                  <p>
                    Your <b>lowest</b> ELO opponent was
                    {{ all_player_stats.lowestElo.last.opponent.userName }} ({{
                      all_player_stats.lowestElo.last.opponent.id
                    }}) at
                    <b>{{
                      all_player_stats.lowestElo.last.opponent["match-elo"]
                    }}</b
                    >. You were
                    <b>{{
                      all_player_stats.lowestElo.last.self["match-elo"]
                    }}</b>
                    ({{
                      all_player_stats.lowestElo.last["elo-diff-formatted"]
                    }}) and
                    <b>{{
                      all_player_stats.lowestElo.last.won ? "won" : "lost"
                    }}</b>
                    with a score of
                    {{ formatScore(all_player_stats.lowestElo.last) }}
                  </p>
                  <p>
                    They are currently rated
                    <b>{{
                      all_player_stats.lowestElo.last.opponent["current-elo"]
                    }}</b>
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
  name: "LowestOpponentCard",
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
