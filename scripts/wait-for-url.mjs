const url = process.argv[2]
const timeoutMs = Number(process.argv[3] ?? 30000)
const startedAt = Date.now()

if (!url) {
  console.error('Usage: node scripts/wait-for-url.mjs <url> [timeout-ms]')
  process.exit(1)
}

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      console.log(`${url} is reachable.`)
      process.exit(0)
    }
  } catch {
    // Keep polling until the server is ready or the timeout is reached.
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
}

console.error(`${url} was not reachable within ${timeoutMs}ms.`)
process.exit(1)
