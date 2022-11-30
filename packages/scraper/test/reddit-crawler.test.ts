import { crawlReddit } from 'src'
import { describe, expect, test } from 'vitest'

// These tests are kinda flaky.
// TODO: Check how we can improve the browser not always starting correctly.
describe('reddit crawler', async () => {
  test('should return 5 posts', async () => {
    const result = await crawlReddit({
      subreddit: '/r/science',
      endAfter: { count: 5 }
    })

    expect(result.length).toEqual(5)
    expect(result.map(r => r.screenshot).length).toEqual(5)
  })

  test('should run for at least 5 seconds', async () => {
    const start = Date.now()
    await crawlReddit({
      subreddit: '/r/science',
      endAfter: { seconds: 5 }
    })
    const time = Date.now() - start

    expect(time > 5000).toBeTruthy()
  })
})
