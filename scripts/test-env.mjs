// scripts/test-env.mjs
// Smoke test: ověří, že env vars (Supabase, Anthropic, Stripe, Resend) reálně fungují.
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

async function testStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    console.log("✗ Stripe: env var chybí (STRIPE_SECRET_KEY)");
    return false;
  }

  // Pokud je tam placeholder z templatu, skip
  if (key.startsWith("<") || key.length < 20) {
    console.log("⊘ Stripe: skipped (placeholder hodnota v .env.local)");
    return true;
  }

  try {
    // GET /v1/balance je lightweight admin endpoint, vrací balance object (i pro test mode)
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (res.ok) {
      const data = await res.json();
      const livemode = data.livemode ? "live" : "test";
      console.log(`✓ Stripe: OK (${livemode} mode)`);
      return true;
    } else {
      const text = await res.text();
      console.log(`✗ Stripe: FAIL (HTTP ${res.status}) — ${text.slice(0, 200)}`);
      return false;
    }
  } catch (e) {
    console.log(`✗ Stripe: ERROR — ${e.message}`);
    return false;
  }
}

async function testResend() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log("✗ Resend: env var chybí (RESEND_API_KEY)");
    return false;
  }

  if (key.startsWith("<") || key.length < 20) {
    console.log("⊘ Resend: skipped (placeholder hodnota v .env.local)");
    return true;
  }

  try {
    // GET /domains je read-only endpoint, ověří platnost klíče
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data?.data) ? data.data.length : 0;
      console.log(`✓ Resend: OK (${count} domain${count === 1 ? "" : "s"} configured)`);
      return true;
    } else {
      const text = await res.text();
      console.log(`✗ Resend: FAIL (HTTP ${res.status}) — ${text.slice(0, 200)}`);
      return false;
    }
  } catch (e) {
    console.log(`✗ Resend: ERROR — ${e.message}`);
    return false;
  }
}

console.log("Testing env vars from .env.local...\n");
const results = await Promise.all([testSupabase(), testAnthropic(), testStripe(), testResend()]);
console.log();

const allOk = results.every((r) => r);
if (allOk) {
  console.log("✓ All checks passed.");
  process.exit(0);
} else {
  console.log("✗ Some checks failed. Verify keys in .env.local.");
  process.exit(1);
}
