import Face from '~icons/lucide/scan-face'

export function SentimentMeter(props: { sentiment: number }) {
  return (
    <div class='flex items-center space-x-1' title='Post title sentiment analysis'>
      <span>
        <Face />
      </span>
      <span>{props.sentiment.toFixed(2)}</span>
    </div>
  )
}
