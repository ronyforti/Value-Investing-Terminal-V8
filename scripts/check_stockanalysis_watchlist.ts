import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const email = process.env.STOCK_ANALYSIS_EMAIL;
  const password = process.env.STOCK_ANALYSIS_PASSWORD;
  console.log('[Script] Logging in as:', email);

  const params = new URLSearchParams();
  params.append('email', email!);
  params.append('password', password!);

  const loginRes = await fetch('https://stockanalysis.com/login/?redir=%2Fwatchlist%2F', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://stockanalysis.com/login/',
      'Origin': 'https://stockanalysis.com'
    },
    body: params.toString(),
    redirect: 'manual'
  });

  console.log('[Script] Login Response Status:', loginRes.status);
  const location = loginRes.headers.get('location');
  console.log('[Script] Redirect Location:', location);

  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')];
  const cookiePairs: string[] = [];
  for (const sc of setCookies) {
    if (sc) cookiePairs.push(sc.split(';')[0].trim());
  }
  const cookie = cookiePairs.join('; ');
  console.log('[Script] Cookie string length:', cookie.length);

  // Fetch /watchlist/
  const wlRes = await fetch('https://stockanalysis.com/watchlist/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Cookie': cookie
    }
  });

  console.log('[Script] Watchlist page status:', wlRes.status);
  const html = await wlRes.text();
  console.log('[Script] HTML size:', html.length);

  // Save the HTML or inspect it
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  console.log('[Script] Page title:', titleMatch ? titleMatch[1] : 'No title');

  // Search for any watchlist URLs or lists
  const matches = html.matchAll(/href="([^"]*watchlist[^"]*)"/gi);
  const links = new Set<string>();
  for (const m of matches) {
    links.add(m[1]);
  }
  console.log('[Script] Found watchlist hrefs:', Array.from(links));

  // Search for portfolio or interactive brokers references
  const ibkrMatches = html.matchAll(/interactive|broker|portfolio|weight|shares|cost|basis/gi);
  console.log('[Script] Keyword matches count:', Array.from(ibkrMatches).length);

  // Find Supabase anon key or URL in html or scripts
  const supabaseUrlMatch = html.match(/https:\/\/[a-z0-9]+\.supabase\.co/);
  console.log('[Script] Supabase URL:', supabaseUrlMatch ? supabaseUrlMatch[0] : 'None');

  // Extract access token from HTML line 119
  const tokenMatch = html.match(/access_token:"([^"]+)"/);
  const accessToken = tokenMatch ? tokenMatch[1] : '';
  console.log('[Script] Access Token found:', accessToken ? `${accessToken.slice(0, 25)}...` : 'None');

  // Look at app.DVDyxIzB.js
  const appJsRes = await fetch('https://stockanalysis.com/_app/immutable/entry/app.DVDyxIzB.js');
  const appJs = await appJsRes.text();
  console.log('[Script] appJs length:', appJs.length);
  // Find where import( is called in appJs
  const importMatches = [...appJs.matchAll(/import\(["']([^"']+)["']\)/g)].map(m => m[1]);
  console.log('[Script] Imports in appJs:', importMatches.slice(0, 10));
  
  // Also check start.BU4oWUtV.js
  const startJsRes = await fetch('https://stockanalysis.com/_app/immutable/entry/start.BU4oWUtV.js');
  const startJs = await startJsRes.text();
  console.log('[Script] startJs length:', startJs.length);
  const startImports = [...startJs.matchAll(/import\(["']([^"']+)["']\)/g)].map(m => m[1]);
  console.log('[Script] Imports in startJs:', startImports.slice(0, 10));

  const n223Res = await fetch('https://stockanalysis.com/_app/immutable/nodes/223.CGUAiRZZ.js');
  const n223Js = await n223Res.text();
  console.log('[Script] Node 223 length:', n223Js.length);
  
  // Look for any table names or supabase calls
  const fromMatches = [...n223Js.matchAll(/\.from\(["']([^"']+)["']\)/g)].map(m => m[1]);
  console.log('[Script] Tables in node 223:', Array.from(new Set(fromMatches)));

  // Look for supabase client or URL or endpoints
  const apiMatches = [...n223Js.matchAll(/["'](\/(?:api|watchlist)[^"']*)["']/g)].map(m => m[1]);
  console.log('[Script] API/watchlist paths in node 223:', Array.from(new Set(apiMatches)));

  // Look for supabase or fetch calls
  const fetchCalls = [...n223Js.matchAll(/fetch\(["']([^"']+)["']/g)].map(m => m[1]);
  console.log('[Script] fetch() calls in node 223:', Array.from(new Set(fetchCalls)));

  const chunkHRes = await fetch('https://stockanalysis.com/_app/immutable/chunks/Hfe8NnKH.js');
  const chunkHJs = await chunkHRes.text();
  console.log('[Script] Hfe8NnKH.js length:', chunkHJs.length);
  import('fs').then(fs => {
    fs.writeFileSync('test_output/Hfe8NnKH.js', chunkHJs);
    console.log('[Script] Wrote test_output/Hfe8NnKH.js');
  });

  // Try fetching /_api/watchlists
  console.log('[Script] Testing GET /_api/watchlists...');
  const apiWatchlistsRes = await fetch('https://stockanalysis.com/_api/watchlists', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Cookie': cookie,
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  console.log('[Script] /_api/watchlists status:', apiWatchlistsRes.status);
  const apiWatchlistsText = await apiWatchlistsRes.text();
  console.log('[Script] /_api/watchlists body:', apiWatchlistsText.slice(0, 1000));

  // Fetch node 0
  const n0Res = await fetch('https://stockanalysis.com/_app/immutable/nodes/0.BhZeRTnY.js');
  const n0Js = await n0Res.text();
  console.log('[Script] Node 0 length:', n0Js.length);
  
  // Find supabase client creation or URL
  // Search all imported chunks in appJs for createClient or supabase
  const allChunks = [...appJs.matchAll(/["'](\/_app\/immutable\/[^"']+\.js)["']/g)].map(m => m[1]);
  console.log('[Script] Total chunks referenced in appJs:', allChunks.length);
  
  // Find which chunk imports @supabase
  const baRes = await fetch('https://stockanalysis.com/_app/immutable/chunks/BA7pmiVy.js');
  const baJs = await baRes.text();
  console.log('[Script] BA7pmiVy.js length:', baJs.length);
  // Find supabase in baJs
  const idx = baJs.indexOf('supabase');
  console.log('[Script] Substring around supabase in BA7pmiVy.js:', baJs.slice(Math.max(0, idx - 100), idx + 200));

  // Search all 534 chunks for "urfnzpbsaeuvfchdfjgz"
  console.log('[Script] Searching chunks for urfnzpbsaeuvfchdfjgz...');
  for (const c of allChunks) {
    const res = await fetch(`https://stockanalysis.com${c}`);
    const text = await res.text();
    if (text.includes('urfnzpbsaeuvfchdfjgz')) {
      console.log(`[Script] Found urfnzpbsaeuvfchdfjgz in ${c}!`);
      console.log(text.slice(0, 1000));
      break;
    }
  }

  // Also check node 0 (root layout)
  const node0Match = appJs.match(/0:\s*\(\)\s*=>\s*import\(["']([^"']+)["']\)/);
  if (node0Match) {
    const node0Url = new URL(node0Match[1], 'https://stockanalysis.com/_app/immutable/entry/app.DVDyxIzB.js').href;
    const n0Res = await fetch(node0Url);
    const n0Js = await n0Res.text();
    console.log('[Script] Node 0 JS length:', n0Js.length);
    
    // Look for supabase keys in node 0
    const keys = [...n0Js.matchAll(/eyJ[a-zA-Z0-9_\-]{20,}/g)].map(m => m[0]);
    console.log('[Script] Possible JWTs / Anon keys in Node 0:', keys.map(k => k.slice(0, 20) + '...'));
  }
}

run().catch(console.error);
