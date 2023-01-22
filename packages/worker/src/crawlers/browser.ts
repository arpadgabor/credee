import playwright from 'playwright'

export const browser = await playwright.chromium.launch({
  headless: true,
  args: ['--blink-settings=mainFrameClipsContent=false'],
})

async function cleanup() {
  console.log('Closing browser...')
  await browser?.close()
  process.exit(1)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
