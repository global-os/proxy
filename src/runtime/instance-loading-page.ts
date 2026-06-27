export function instanceLoadingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Loading…</title>
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
  <p>Loading app…</p>
  <script>
    setTimeout(function () { location.reload() }, 2000)
  </script>
</body>
</html>`
}