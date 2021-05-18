export {default as LossChart} from "./LossChart.vue"
export {default as MostPlayedChart} from "./MostPlayedChart.vue"
export {default as MostWonChart} from "./MostWonChart.vue"
export {default as MostLostChart} from "./MostLostChart.vue"
// export {default as Chart} from "./Chart.vue"

import { Chart } from "chart.js";
import { WordCloudController, WordElement } from "chartjs-chart-wordcloud";

Chart.register(WordCloudController, WordElement)
