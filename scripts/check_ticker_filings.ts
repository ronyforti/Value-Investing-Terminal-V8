async function checkFilings(cik: string, ticker: string) {
  const url = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Ronald Forti (ronforti@gmail.com)' } });
  if (!res.ok) { console.log('Error:', res.status); return; }
  const data = await res.json() as any;
  const recent = data.filings.recent;
  console.log(`Recent periodic/major filings for ${ticker} (CIK: ${cik}):`);
  for (let i = 0; i < recent.form.length; i++) {
    const f = recent.form[i];
    if (f.startsWith('10-') || f.startsWith('8-') || f.includes('DEF')) {
      console.log(`  - ${f} | Filed: ${recent.filingDate[i]} | Report: ${recent.reportDate[i]} | Doc: ${recent.primaryDocument[i]}`);
    }
  }
}

checkFilings('0001652044', 'GOOGL').catch(console.error);
