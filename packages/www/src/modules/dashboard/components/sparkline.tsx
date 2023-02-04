import { Chart, registerables } from 'chart.js'
import { onMount } from 'solid-js'

Chart.register(...registerables)
type ValidData = string | number | Date
interface Props<T extends Record<string, ValidData>> {
  id: string
  dataset: T[]
  labelField: keyof T
  valueFields: (keyof T)[]
}

export const Sparkline = <T extends Record<string, ValidData>>(props: Props<T>) => {
  let el: HTMLCanvasElement | undefined

  onMount(() => {
    new Chart(el!, {
      type: 'line',
      data: {
        labels: props.dataset.map(i => i[props.labelField]),
        datasets: props.valueFields.map(field => ({
          data: props.dataset.map(d => d[field]),
          label: String(field),
          fill: true,
        })),
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
        layout: {
          padding: 2,
        },
        elements: {
          line: {
            borderColor: '#000000',
            borderWidth: 1,
            tension: 0.5,
          },
          point: {
            radius: 2,
            backgroundColor: '#000',
          },
        },
        scales: {
          y: {
            grid: {
              display: false,
            },
            display: false,
            beginAtZero: true,
          },
          x: {
            display: false,
            grid: {
              display: false,
            },
          },
        },
      },
    })
  })

  return <canvas id={props.id} ref={el} style={{ height: '4rem', width: '100%' }}></canvas>
}
