<template>
    <div class="cardbox p-col-12 p-md-6 p-lg-4">
      <Card class="p-p-2">
        <template #title>Totally Real reasons you're losing</template>
        <template #content>
          <vue3-chart-js v-bind="{ ...chartData }" />
        </template>
      </Card>
    </div>
</template>

<script>
import { defineComponent } from "vue";
import { Card } from "../components/primeIndex"
import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";

export default defineComponent({
  name: "LossChart",
  components: {
    Vue3ChartJs,
    Card
  },
  setup() {
    const chartData = {
      type: "pie",
      data: {
        labels: [
          "Hitting the bed",
          "Couldn't return serve",
          "Dog distracted you",
          "Arrow to the knee",
        ],
        datasets: [
          {
            backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
            data: [30, 20, 25, 15],
          },
        ],
      },
    };
    return {
      chartData,
    };
  },
});
</script>

<style></style>
