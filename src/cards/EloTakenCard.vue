<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Grand Theft ELO</template>
      <template #content>
        <p>
          The most ELO you <b>gained</b> is from
          {{ mostNet.name }} ({{
            mostNet.gains.id
          }}), taking a net <b>{{ mostNet.gains.net }}</b> from
          them.
        </p>
        <p>
          The most ELO you <b>lost</b> is to
          {{ leastNet.name }} ({{
            leastNet.gains.id
          }}), losing a net <b>{{ leastNet.gains.net }}</b> to them.
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
  GainInfo,
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
  computed: {
    mostNet(): { name: string, gains: GainInfo } {
      const name = this.all_ranked_stats.mostElo.mostNetList[0]
      return {
        name,
        gains: this.all_ranked_stats.mostElo.gains[name]
      }
    },
    leastNet(): { name: string, gains: GainInfo } {
      const name = this.all_ranked_stats.mostElo.mostNetList[this.all_ranked_stats.mostElo.mostNetList.length - 1]
      return {
        name,
        gains: this.all_ranked_stats.mostElo.gains[name]
      }
    }
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
