// PostToolUse hook: run Prettier on TS/TSX files after Edit/Write.
// Failures never block the session (formatting is best-effort).
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    // trim() also strips a UTF-8 BOM, which PowerShell pipes can prepend
    const input = JSON.parse(raw.trim());
    const filePath = input.tool_response?.filePath ?? input.tool_input?.file_path ?? '';
    if (/\.(ts|tsx)$/.test(filePath) && require('fs').existsSync(filePath)) {
      require('child_process').execFileSync(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['prettier', '--write', filePath],
        { stdio: 'ignore', shell: process.platform === 'win32' },
      );
    }
  } catch {
    // best-effort: never fail the hook
  }
  process.exit(0);
});
