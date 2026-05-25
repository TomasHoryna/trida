// scripts/test-env.mjs
// Smoke test: ověří, že env vars (Supabase + Anthropic) reálně fungují.
// Spuštění: pnpm test:env

async function testSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.log("✗ Supabase: env vars chybí (URL nebo ANON_KEY)");
    return false;
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const text = await res.text();

    if (res.ok) {
      console.log(`✓ Supabase: OK (HTTP ${res.status})`);
      return true;
    }

    // 401 "Secret API key required" = anon klíč je VALID, jen endpoint
    // vyžaduje secret (nový Supabase API model). Pro smoke test = OK.
    if (res.status === 401 && text.includes("Secret API key required")) {
      console.log(`✓ Supabase: OK (anon klíč platný, root endpoint vyžaduje secret — expected)`);
      return true;
    }

    console.log(`✗ Supabase: FAIL (HTTP ${res.status}) — ${text.slice(0, 200)}`);
    return false;
  } catch (e) {
    console.log(`✗ Supabase: ERROR — ${e.message}`);
    return false;
  }
}

async function testAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    console.log("✗ Anthropic: env var chybí (ANTHROPIC_API_KEY)");
    return false;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 20,
        messages: [{ role: "user", content: 'Reply with just "OK".' }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data.content?.[0]?.text || "(no text)";
      console.log(`✓ Anthropic: OK — reply: "${reply.trim()}"`);
      return true;
    } else {
      const text = await res.text();
      console.log(`✗ Anthropic: FAIL (HTTP ${res.status}) — ${text.slice(0, 300)}`);
      return false;
    }
  } catch (e) {
    console.log(`✗ Anthropic: ERROR — ${e.message}`);
    return false;
  }
}

console.log("Testing env vars from .env.local...\n");
const supabaseOk = await testSupabase();
const anthropicOk = await testAnthropic();
console.log();

if (supabaseOk && anthropicOk) {
  console.log("✓ All checks passed.");
  process.exit(0);
} else {
  console.log("✗ Some checks failed. Verify keys in .env.local.");
  process.exit(1);
}
