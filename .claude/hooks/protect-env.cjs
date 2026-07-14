// PreToolUse hook: block edits to real env files (.env, .env.local — they
// hold Supabase keys), while allowing .env.example which is meant to be
// edited and committed.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    // trim() also strips a UTF-8 BOM, which PowerShell pipes can prepend
    filePath = JSON.parse(raw.trim()).tool_input?.file_path ?? '';
  } catch {
    process.exit(0); // malformed input: don't block
  }
  const base = require('path').basename(filePath);
  const isRealEnv = base === '.env' || (base.startsWith('.env.') && base !== '.env.example');
  if (isRealEnv) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason:
            `Editing ${base} is blocked by a project hook (it holds Supabase keys). ` +
            'Edit .env.example instead, or change env files manually.',
        },
      }),
    );
  }
  process.exit(0);
});
