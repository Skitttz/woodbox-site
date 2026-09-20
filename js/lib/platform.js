const OS_PATTERNS = [
  ["windows", /Win/i],
  ["mac", /Mac/i],
  ["linux", /Linux/i]
];

function getPlatform() {
  return navigator.userAgentData?.platform || navigator.platform || "";
}

function isMobile(userAgent, platform) {
  const isTouchMac = /Mac/i.test(platform) && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod/i.test(userAgent) || Boolean(navigator.userAgentData?.mobile) || isTouchMac;
}

export function detectOs() {
  const userAgent = navigator.userAgent || "";
  const platform = getPlatform();
  if (isMobile(userAgent, platform)) return null;

  const match = OS_PATTERNS.find(([, pattern]) => pattern.test(platform));
  if (!match) return null;

  const [os] = match;
  const isChromeOs = os === "linux" && /CrOS/i.test(userAgent);
  if (isChromeOs) return null;
  return os;
}

function archFromUserAgent(userAgent) {
  if (/aarch64|arm64/i.test(userAgent)) return "arm64";
  if (/x86_64|amd64|Win64|WOW64|x64/i.test(userAgent)) return "x64";
  return null;
}

async function readArchitectureHints() {
  if (!navigator.userAgentData) return null;
  try {
    return await navigator.userAgentData.getHighEntropyValues(["architecture", "bitness"]);
  } catch {
    return null;
  }
}

function archFromHints(hints) {
  if (hints?.architecture === "arm" && hints.bitness === "64") return "arm64";
  if (hints?.architecture === "x86" && hints.bitness === "64") return "x64";
  if (hints?.architecture === "x86") return "ia32";
  return null;
}

export async function detectArch() {
  const hinted = archFromHints(await readArchitectureHints());
  return hinted ?? archFromUserAgent(navigator.userAgent || "");
}
