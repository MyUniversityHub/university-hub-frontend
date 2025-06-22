import Chart from 'chart.js/auto'

export default defineNuxtPlugin(() => {
  if (process.client) {
    window.Chart = Chart
  }
})
