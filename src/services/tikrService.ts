import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from "amazon-cognito-identity-js";

const TIKR_USER_POOL_ID = "us-east-1_PflCYM8WM";
const TIKR_CLIENT_ID = "7ls0a83u5u94vjb2g6t6mdenik";
const ALGOLIA_APP_ID = "TJPAY1DYT8";
const ALGOLIA_SEARCH_KEY = "d88ea2aa3c22293c96736f5ceb5bab4e";
const ALGOLIA_INDEX = "tikr-terminal-v1";
const TIKR_API_BASE = "https://api.tikr.com";

let cachedToken: { idToken: string; expiresAt: number } | null = null;

/**
 * Calculates word/token similarity between two company names to prevent
 * accidental cross-market ticker collisions (e.g., matching a Mexican or European company sharing the same ticker).
 */
export function calculateNameSimilarity(nameA: string, nameB: string): number {
  const cleanTokens = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !["inc", "corp", "corporation", "ltd", "limited", "plc", "llc", "co", "company", "the", "group", "holdings", "class"].includes(w));

  const tokensA = cleanTokens(nameA);
  const tokensB = cleanTokens(nameB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const t of tokensA) {
    if (tokensB.includes(t)) matches++;
  }

  return matches / Math.min(tokensA.length, tokensB.length);
}

/**
 * Authenticates with TIKR's AWS Cognito User Pool via the Secure Remote Password (SRP) protocol.
 * Caches the JWT idToken for subsequent API calls.
 */
export async function loginToTikr(email?: string, password?: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.idToken;
  }

  const username = email?.trim() || process.env.TIKR_EMAIL || "airesol711@gmail.com";
  const userPassword = password?.trim() || process.env.TIKR_PASSWORD || "-h*3@Q/yK/U_VFg";

  if (!username || !userPassword) {
    throw new Error("TIKR authentication credentials missing. Please set TIKR_EMAIL and TIKR_PASSWORD in .env.");
  }

  const poolData = {
    UserPoolId: TIKR_USER_POOL_ID,
    ClientId: TIKR_CLIENT_ID
  };

  const userPool = new CognitoUserPool(poolData);
  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: userPassword
  });

  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        // Cognito ID tokens expire in 1 hour; cache for 50 minutes
        cachedToken = {
          idToken,
          expiresAt: Date.now() + 50 * 60 * 1000
        };
        resolve(idToken);
      },
      onFailure: (err) => {
        console.error("[TIKR Auth] SRP Authentication failed:", err?.message || err);
        reject(err);
      }
    });
  });
}

export interface TikrCompanyResolution {
  cid: number;
  tid: number;
  companyName: string;
  tickerSymbol: string;
  exchange: string;
  primaryflag: number;
}

/**
 * Resolves any company ticker into its TIKR internal identifiers (cid and tid) using Algolia,
 * enforcing a strict multi-tier safety crosscheck against canonical SEC/FMP company profiles.
 */
export async function resolveTikrCompany(
  ticker: string,
  canonicalCompanyName?: string,
  fmpApiKey?: string
): Promise<TikrCompanyResolution | null> {
  const symbol = ticker.trim().toUpperCase();

  // If canonical company name is not provided, attempt to fetch it via FMP profile
  let expectedName = canonicalCompanyName?.trim();
  const apiKey = fmpApiKey || process.env.FMP_API_KEY;
  if (!expectedName && apiKey) {
    try {
      const fmpRes = await fetch(`https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`);
      if (fmpRes.ok) {
        const fmpData = await fmpRes.json();
        if (Array.isArray(fmpData) && fmpData[0]?.companyName) {
          expectedName = fmpData[0].companyName;
        }
      }
    } catch (e) {
      // Continue with ticker matching
    }
  }

  const algoliaUrl = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;
  const algRes = await fetch(algoliaUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Algolia-Application-Id": ALGOLIA_APP_ID,
      "X-Algolia-API-Key": ALGOLIA_SEARCH_KEY
    },
    body: JSON.stringify({
      query: symbol,
      hitsPerPage: 15
    })
  });

  if (!algRes.ok) {
    throw new Error(`Failed to query TIKR company directory (status ${algRes.status})`);
  }

  const algData = await algRes.json();
  const hits: any[] = algData.hits || [];

  if (hits.length === 0) return null;

  // Filter hits where tickersymbol matches target symbol
  const matchingHits = hits.filter(h => {
    const rawSym = (h.tickersymbol || "").toUpperCase().replace(/[\s\*]/g, "");
    return rawSym === symbol;
  });

  if (matchingHits.length === 0) return null;

  // Prioritize primary security listing (primaryflag === 3)
  matchingHits.sort((a, b) => (b.primaryflag || 0) - (a.primaryflag || 0));

  let chosenHit = matchingHits[0];

  // Safety Crosscheck: If canonical name is available, verify entity similarity
  if (expectedName) {
    const scoredHits = matchingHits.map(h => ({
      hit: h,
      similarity: calculateNameSimilarity(h.companyname || "", expectedName)
    }));

    scoredHits.sort((a, b) => b.similarity - a.similarity);

    if (scoredHits[0].similarity >= 0.4) {
      chosenHit = scoredHits[0].hit;
    } else {
      console.warn(`[TIKR Safety Gate] Candidate "${scoredHits[0].hit.companyname}" similarity was only ${Math.round(scoredHits[0].similarity * 100)}% vs canonical name "${expectedName}". Candidate rejected to prevent cross-listing confusion.`);
      return null;
    }
  }

  return {
    cid: chosenHit.companyid,
    tid: chosenHit.tradingitemid,
    companyName: chosenHit.companyname,
    tickerSymbol: chosenHit.tickersymbol,
    exchange: chosenHit.exchangesymbol || chosenHit.exchange || "",
    primaryflag: chosenHit.primaryflag
  };
}

/**
 * Ingests official verbatim earnings call transcripts from TIKR Terminal (S&P Capital IQ).
 */
export async function fetchTikrTranscript(
  ticker: string,
  targetPeriod: string | null,
  email?: string,
  password?: string,
  canonicalName?: string,
  fmpApiKey?: string
): Promise<{ markdownText: string; fileName: string; periodStr: string } | null> {
  const symbol = ticker.trim().toUpperCase();

  // 1. Resolve Company with Safety Crosscheck
  const company = await resolveTikrCompany(symbol, canonicalName, fmpApiKey);
  if (!company) {
    console.warn(`[TIKR Scraper] Could not verify company match for ${symbol} on TIKR.`);
    return null;
  }

  console.log(`[TIKR Scraper] Verified ${symbol} as "${company.companyName}" (${company.exchange}, cid: ${company.cid}, tid: ${company.tid})`);

  // 2. Authenticate
  const idToken = await loginToTikr(email, password);
  if (!idToken) {
    console.warn(`[TIKR Scraper] Could not authenticate with TIKR.`);
    return null;
  }

  // 3. Fetch Transcripts List
  const listUrl = `${TIKR_API_BASE}/transcripts_v2`;
  const listRes = await fetch(listUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cid: company.cid, tid: company.tid, auth: idToken })
  });

  if (!listRes.ok) {
    console.warn(`[TIKR Scraper] Transcripts list fetch failed with status ${listRes.status}`);
    return null;
  }

  const listData = await listRes.json();
  const transcripts: any[] = listData.data || [];

  if (transcripts.length === 0) {
    console.warn(`[TIKR Scraper] No transcripts listed on TIKR for ${symbol}.`);
    return null;
  }

  // 4. Match target period
  let selected = transcripts[0];
  let matchedPeriodStr = "";

  if (targetPeriod && targetPeriod !== "----" && targetPeriod.toLowerCase() !== "latest") {
    const qMatch = targetPeriod.match(/q([1-4])/i);
    const isFY = /fy|full[- ]?year/i.test(targetPeriod);
    const qNum = qMatch ? qMatch[1] : (isFY ? "4" : null);

    const yMatch = targetPeriod.match(/\b(20\d{2}|\d{2})\b/);
    const targetYShort = yMatch ? (yMatch[1].length === 4 ? yMatch[1].slice(-2) : yMatch[1]) : null;
    const targetYFull = targetYShort ? `20${targetYShort}` : null;

    const candidate = transcripts.find(t => {
      const hl = (t.headline || "").toUpperCase();
      let hasQ = true;
      if (qNum === "1") hasQ = hl.includes("Q1") || hl.includes("FIRST QUARTER") || hl.includes("1Q");
      else if (qNum === "2") hasQ = hl.includes("Q2") || hl.includes("SECOND QUARTER") || hl.includes("2Q");
      else if (qNum === "3") hasQ = hl.includes("Q3") || hl.includes("THIRD QUARTER") || hl.includes("3Q");
      else if (qNum === "4") hasQ = hl.includes("Q4") || hl.includes("FOURTH QUARTER") || hl.includes("4Q") || hl.includes("FULL YEAR") || hl.includes("FY");

      const hasY = (targetYShort && hl.includes(targetYShort)) || (targetYFull && hl.includes(targetYFull));
      return hasQ && (hasY || !targetYShort);
    });

    if (candidate) {
      selected = candidate;
      matchedPeriodStr = targetPeriod.toUpperCase();
    } else {
      console.log(`[TIKR Scraper] Exact period ${targetPeriod} not found in TIKR transcripts list for ${symbol}.`);
      return null;
    }
  }

  if (!matchedPeriodStr) {
    const hl = selected.headline || "";
    const qMatch = hl.match(/Q([1-4])/i);
    const yMatch = hl.match(/\b(20\d{2})\b/);
    if (qMatch && yMatch) {
      matchedPeriodStr = `Q${qMatch[1]}-${yMatch[1].slice(-2)}`;
    } else {
      matchedPeriodStr = targetPeriod && targetPeriod !== "----" ? targetPeriod.toUpperCase() : "Latest";
    }
  }

  console.log(`[TIKR Scraper] Fetching transcript dialogue for ${symbol} (${matchedPeriodStr}): "${selected.headline}" (keydevid: ${selected.keydevid}, transcriptid: ${selected.transcriptid})`);

  // 5. Fetch Transcript Content
  const contentUrl = `${TIKR_API_BASE}/transcript_v2`;
  const contentRes = await fetch(contentUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth: idToken,
      eid: String(selected.keydevid),
      tid: String(selected.transcriptid),
      v: "v1",
      id: String(company.tid),
      cid: String(company.cid)
    })
  });

  if (!contentRes.ok) {
    console.warn(`[TIKR Scraper] Transcript dialogue fetch failed with status ${contentRes.status}`);
    return null;
  }

  const contentData = await contentRes.json();
  if (contentData.unauth) {
    console.warn(`[TIKR Scraper] TIKR returned unauth for ${symbol} transcript ${selected.transcriptid}.`);
    return null;
  }

  const rows: any[] = contentData.data || [];
  if (rows.length === 0) {
    console.warn(`[TIKR Scraper] TIKR transcript returned 0 dialogue rows.`);
    return null;
  }

  // 6. Format into clean Markdown dialogue
  let md = `# Earnings Call Transcript: ${symbol}\n`;
  md += `**Company:** ${company.companyName} (${symbol})\n`;
  md += `**Period:** ${matchedPeriodStr}\n`;
  md += `**Event:** ${selected.headline}\n`;
  md += `**Date:** ${selected.mostimportantdateutc || 'Recent'}\n`;
  md += `**Source:** TIKR Terminal (Verbatim S&P Capital IQ Dialogue)\n---\n\n`;

  for (const row of rows) {
    const speaker = row.speakername || row.speaker || (row.transcriptcomponenttypeid === 1 ? "Operator" : "Speaker");
    const title = row.speakertitle ? ` (${row.speakertitle})` : "";
    const text = (row.componenttext || "").trim();

    if (text) {
      md += `### ${speaker}${title}\n\n${text}\n\n`;
    }
  }

  // Strict Substance Validation: >= 2,500 chars and >= 3 speaker sections
  if (md.length < 2500 || rows.length < 3) {
    console.warn(`[TIKR Scraper] Transcript for ${symbol} is too short (${md.length} chars, ${rows.length} rows).`);
    return null;
  }

  const fileName = `${symbol}_${matchedPeriodStr}_Transcript.md`;
  return {
    markdownText: md,
    fileName,
    periodStr: matchedPeriodStr
  };
}
