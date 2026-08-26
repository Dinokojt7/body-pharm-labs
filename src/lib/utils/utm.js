const UTM_KEY = "bpl_utm_attribution";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

// First-touch attribution: capture the first campaign that brought a visitor
// and never overwrite it, even on later organic visits within the same browser.
export function captureUtmFromUrl(searchParams) {
  if (typeof window === "undefined") return;
  if (getStoredUtm()) return;

  const values = {};
  let hasAny = false;
  for (const key of UTM_PARAMS) {
    const val = searchParams.get(key);
    if (val) {
      hasAny = true;
      values[key] = val.trim();
    }
  }
  if (!hasAny) return;

  const utm = {
    source: values.utm_source?.toLowerCase() || null,
    medium: values.utm_medium?.toLowerCase() || null,
    campaign: values.utm_campaign?.toLowerCase() || null,
    term: values.utm_term || null,
    content: values.utm_content || null,
    capturedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    // localStorage unavailable (private browsing, etc.) — safe to ignore
  }
}

export function getStoredUtm() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
