import Natural from 'natural'

const analyzer = new Natural.SentimentAnalyzer('English', Natural.PorterStemmer, 'afinn')

export function sentiment(text: string) {
  return analyzer.getSentiment(text.split(' '))
}
