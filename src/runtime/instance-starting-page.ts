export function instanceStartingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Starting…</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f1115;
      color: #e8eaed;
      font: 14px/1.5 system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <p>Starting app…</p>
  <script>
    async function poll() {
      try {
        const res = await fetch('/__status', { credentials: 'same-origin' })
        if (!res.ok) throw new Error('status ' + res.status)
        const data = await res.json()
        if (data.ready) {
          location.reload()
          return
        }
      } catch (_) {}
      setTimeout(poll, 2000)
    }
    poll()
  </script>
</body>
</html>`
}