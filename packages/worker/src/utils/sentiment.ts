import Natural from 'natural'

type Vocabulary = 'afinn' | 'senticon' | 'pattern'

const analyzer = new Natural.SentimentAnalyzer('English', Natural.PorterStemmer, 'afinn')

export function sentiment(text: string) {
  return analyzer.getSentiment(text.split(' '))
}
