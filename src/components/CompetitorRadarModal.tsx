import React, { useState } from "react";
import { 
  Radar, 
  X, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  ExternalLink,
  Building2,
  Cpu,
  Landmark,
  Trophy
} from "lucide-react";
import { CompetitorRadarDossier, CompetitorItem } from "../types.js";

interface CompetitorRadarModalProps {
  isOpen: boolean;
  dossier: CompetitorRadarDossier | null;
  targetTicker: string;
  onClose: () => void;
  onRefresh: (customPeers?: string[]) => Promise<void>;
  isRefreshing?: boolean;
}

export default function CompetitorRadarModal({
  isOpen,
  dossier,
  targetTicker,
  onClose,
  onRefresh,
  isRefreshing = false
}: CompetitorRadarModalProps) {
  const [activeTab, setActiveTab] = useState<'comps' | 'provenance'>('comps');
  const [newPeerTicker, setNewPeerTicker] = useState('');

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    if (!dossier || !dossier.csvData) return;
    const blob = new Blob([dossier.csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${targetTicker || 'Company'}_Competitor_Radar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPeer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeerTicker.trim()) return;
    const existing = dossier?.peers.map(p => p.ticker).filter(Boolean) as string[] || [];
    const updated = Array.from(new Set([...existing, newPeerTicker.toUpperCase().trim()]));
    setNewPeerTicker('');
    await onRefresh(updated);
  };

  const archetype = dossier?.archetype || 'standard_corporate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-[#0d111a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#131825] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Competitor Moat & Valuation Radar
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center gap-1">
                  {archetype === 'tech_platform' && <Cpu className="w-3 h-3" />}
                  {archetype === 'financial_bank' && <Landmark className="w-3 h-3" />}
                  {archetype === 'homebuilder' && <Building2 className="w-3 h-3" />}
                  {archetype === 'reit' && <Building2 className="w-3 h-3" />}
                  {archetype.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Anchor: <span className="text-cyan-300 font-semibold">{targetTicker}</span> | Multi-Factor Peer Valuation (TTM) & Provenance Shield
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              {isRefreshing ? 'Harvesting...' : 'Sync Radar'}
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={!dossier?.csvData}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Tabs & Quick Peer Input */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-[#0f1420] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('comps')}
              className={`font-mono font-medium py-1 border-b-2 transition-colors ${
                activeTab === 'comps'
                  ? 'text-cyan-400 border-cyan-400 font-bold'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Comparative Comps Table ({dossier?.peers.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('provenance')}
              className={`font-mono font-medium py-1 border-b-2 transition-colors ${
                activeTab === 'provenance'
                  ? 'text-cyan-400 border-cyan-400 font-bold'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Data Lineage & Provenance Log
            </button>
          </div>

          <form onSubmit={handleAddPeer} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add Peer Ticker (e.g. CRTO)..."
              value={newPeerTicker}
              onChange={(e) => setNewPeerTicker(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 w-44"
            />
            <button
              type="submit"
              disabled={isRefreshing || !newPeerTicker.trim()}
              className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-slate-200">
          {!dossier || dossier.peers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Radar className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold">No Competitor Radar Generated Yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Competitor Radar automatically triggers following Step 2 (Moat & Market Analysis), or click "Sync Radar" above to harvest peers now.
              </p>
            </div>
          ) : activeTab === 'comps' ? (
            <div className="space-y-4">
              {(() => {
                const tf = dossier.targetFinancials || dossier.targetItem?.financials || {};
                const isBank = dossier.archetype === 'financial_bank';
                const isInsurance = dossier.archetype === 'insurance';
                const isHomebuilder = dossier.archetype === 'homebuilder';
                const isReit = dossier.archetype === 'reit';

                return (
                  <>
                    {/* Competitive Moat Leaderboard & Peer Standing Cards */}
                    {dossier.rankings && dossier.rankings.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#111624] border border-slate-800 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                              Moat Leaderboard & Peer Standing
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">
                              (Anchor vs. {dossier.peers.length} Peers)
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Archetype: <span className="text-cyan-400 font-semibold">{dossier.archetype}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {dossier.rankings.map((r) => {
                            const isLeader = r.rank === 1;
                            const isTopHalf = r.rank === 2 || r.rank === 3;
                            return (
                              <div
                                key={r.key}
                                className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                                  isLeader
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                    : isTopHalf
                                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[110px]" title={r.label}>
                                      {r.label}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                                        isLeader
                                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                          : isTopHalf
                                          ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                                      }`}
                                    >
                                      {isLeader ? '🥇 #1 Leader' : `#${r.rank} of ${r.totalCount}`}
                                    </span>
                                  </div>
                                  <div className="text-base font-bold font-mono text-slate-100 mb-1">
                                    {r.formattedTargetValue}
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-slate-800/80 mt-1">
                                  <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                                    <span>Peer Median:</span>
                                    <span className="text-slate-300 font-semibold">{r.formattedPeerMedian}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 truncate mt-0.5 font-mono" title={`Leader: ${r.leaderName} (${r.formattedLeaderValue})`}>
                                    Leader: <span className="text-slate-400 font-semibold">{r.leaderTicker}</span> ({r.formattedLeaderValue})
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#111624]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#161c2d] text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                          <tr>
                            <th className="py-3 px-4">Company</th>
                            <th className="py-3 px-3">Ticker</th>
                            <th className="py-3 px-3 text-right">Price</th>
                            <th className="py-3 px-3 text-right">Mkt Cap ($B)</th>
                            {isInsurance ? (
                              <>
                                <th className="py-3 px-3 text-right" title="Price / Book Value">P / B</th>
                                <th className="py-3 px-3 text-right" title="Return on Equity">ROE</th>
                                <th className="py-3 px-3 text-right">P / E</th>
                                <th className="py-3 px-3 text-right" title="Enterprise Value / True FCF">EV / True FCF</th>
                                <th className="py-3 px-3 text-right">Net Cash / MC</th>
                              </>
                            ) : isBank ? (
                              <>
                                <th className="py-3 px-3 text-right" title="Price / Tangible Book Value">P / TBV</th>
                                <th className="py-3 px-3 text-right" title="Return on Tangible Common Equity">ROTCE</th>
                                <th className="py-3 px-3 text-right" title="Net Interest Margin">NIM</th>
                                <th className="py-3 px-3 text-right" title="Efficiency Ratio">Efficiency</th>
                                <th className="py-3 px-3 text-right" title="Common Equity Tier 1">CET1</th>
                              </>
                            ) : isHomebuilder ? (
                              <>
                                <th className="py-3 px-3 text-right">Housing Gross Mgn</th>
                                <th className="py-3 px-3 text-right">Net Debt / Cap</th>
                                <th className="py-3 px-3 text-right">Land Years</th>
                                <th className="py-3 px-3 text-right">EV / Adj FCF</th>
                                <th className="py-3 px-3 text-right">Net Cash / MC</th>
                              </>
                            ) : isReit ? (
                              <>
                                <th className="py-3 px-3 text-right" title="Price to FFO or PE">P / FFO (PE)</th>
                                <th className="py-3 px-3 text-right" title="Dividend Yield">Div Yield</th>
                                <th className="py-3 px-3 text-right" title="Return on Equity">ROE</th>
                                <th className="py-3 px-3 text-right" title="Price / Book Value">P / B</th>
                                <th className="py-3 px-3 text-right" title="EV / True FCF">EV / True FCF</th>
                                <th className="py-3 px-3 text-right">Net Debt ($M)</th>
                              </>
                            ) : (
                              <>
                                <th className="py-3 px-3 text-right" title="Trailing 12-Month Gross Margin">Gross Mgn (TTM)</th>
                                <th className="py-3 px-3 text-right" title="Trailing 12-Month Operating Margin">Op Margin (TTM)</th>
                                <th className="py-3 px-3 text-right" title="Return on Invested Capital (TTM)">ROIC</th>
                                <th className="py-3 px-3 text-right" title="Enterprise Value / True FCF (TTM, Total CapEx & SBC deducted)">EV / True FCF</th>
                                <th className="py-3 px-3 text-right" title="Enterprise Value / Owner Earnings (TTM, Maintenance CapEx normalized to D&A, SBC deducted)">EV / Owner Earn</th>
                                <th className="py-3 px-3 text-right" title="Net Cash / Market Cap (Latest Quarter Snapshot)">Net Cash / MC</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {/* Anchor Target Row */}
                          <tr className="bg-cyan-950/25 font-semibold border-b border-cyan-500/30">
                            <td className="py-3 px-4 text-cyan-300 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                              {dossier.targetName || targetTicker} (Target Anchor)
                            </td>
                            <td className="py-3 px-3 text-cyan-400 font-bold">{targetTicker}</td>
                            <td className="py-3 px-3 text-right text-slate-100 font-semibold">{tf.price !== undefined ? `$${tf.price}` : '--'}</td>
                            <td className="py-3 px-3 text-right text-slate-100 font-semibold">{tf.marketCap !== undefined ? `$${tf.marketCap}` : '--'}</td>
                            {isInsurance ? (
                              <>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.priceToBook !== undefined ? `${tf.priceToBook}x` : '--'}</td>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.roe !== undefined ? `${tf.roe}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.peRatio !== undefined ? `${tf.peRatio}x` : '--'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : (tf.trueFcf !== undefined && tf.trueFcf <= 0 ? 'N/M (Neg)' : 'Target')}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.netCashToMarketCap !== undefined ? `${tf.netCashToMarketCap}%` : '--'}</td>
                              </>
                            ) : isBank ? (
                              <>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.priceToTangibleBook !== undefined ? `${tf.priceToTangibleBook}x` : '--'}</td>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.rotce !== undefined ? `${tf.rotce}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.nim !== undefined ? `${tf.nim}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.efficiencyRatio !== undefined ? `${tf.efficiencyRatio}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.cet1Ratio !== undefined ? `${tf.cet1Ratio}%` : '--'}</td>
                              </>
                            ) : isHomebuilder ? (
                              <>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.housingGrossMargin !== undefined ? `${tf.housingGrossMargin}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.netDebtToCapital !== undefined ? `${tf.netDebtToCapital}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.landYearsControlled !== undefined ? `${tf.landYearsControlled}` : '--'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : 'Target'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.netCashToMarketCap !== undefined ? `${tf.netCashToMarketCap}%` : '--'}</td>
                              </>
                            ) : isReit ? (
                              <>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.peRatio !== undefined ? `${tf.peRatio}x` : '--'}</td>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.dividendYield !== undefined ? `${tf.dividendYield}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.roe !== undefined ? `${tf.roe}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.priceToBook !== undefined ? `${tf.priceToBook}x` : '--'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : 'Target'}</td>
                                <td className="py-3 px-3 text-right text-slate-200">{tf.netDebt !== undefined ? `$${tf.netDebt}` : '--'}</td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.grossMargin !== undefined ? `${tf.grossMargin}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.operatingMargin !== undefined ? `${tf.operatingMargin}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.roic !== undefined ? `${tf.roic}%` : '--'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : 'Target'}</td>
                                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{tf.evToOwnerEarnings !== undefined ? `${tf.evToOwnerEarnings}x` : 'Target'}</td>
                                <td className="py-3 px-3 text-right text-cyan-300 font-bold">{tf.netCashToMarketCap !== undefined ? `${tf.netCashToMarketCap}%` : '--'}</td>
                              </>
                            )}
                          </tr>

                          {/* Competitor Rows */}
                          {dossier.peers.map((peer, idx) => {
                            const f = peer.financials || {};
                            return (
                              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                <td className="py-2.5 px-4 font-sans text-slate-200 flex items-center gap-2">
                                  {peer.isReciprocalPeer && (
                                    <span title="Verified Reciprocal Peer in SEC Proxy" className="text-emerald-400 text-xs">★</span>
                                  )}
                                  <span className="truncate max-w-[180px]">{peer.name}</span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-300">
                                  {peer.ticker || 'N/A'}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-200 font-medium">
                                  {f.price !== undefined ? `$${f.price}` : '--'}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-300">
                                  {f.marketCap !== undefined ? `$${f.marketCap}` : '--'}
                                </td>
                                {isInsurance ? (
                                  <>
                                    <td className="py-2.5 px-3 text-right text-cyan-300 font-medium">
                                      {f.priceToBook !== undefined ? `${f.priceToBook}x` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.roe !== undefined ? (
                                        <span className={f.roe >= 15 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.roe}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.peRatio !== undefined ? `${f.peRatio}x` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.evToTrueFcf !== undefined ? (
                                        <span className="text-cyan-300 font-semibold">{f.evToTrueFcf}x</span>
                                      ) : f.trueFcf !== undefined && f.trueFcf <= 0 ? (
                                        <span className="text-amber-400 font-medium">N/M (Neg)</span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.netCashToMarketCap !== undefined ? (
                                        <span className={f.netCashToMarketCap > 0 ? "text-emerald-400" : "text-amber-400"}>
                                          {f.netCashToMarketCap}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                  </>
                                ) : isBank ? (
                                  <>
                                    <td className="py-2.5 px-3 text-right text-cyan-300 font-medium">
                                      {f.priceToTangibleBook !== undefined ? `${f.priceToTangibleBook}x` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.rotce !== undefined ? (
                                        <span className={f.rotce >= 12 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.rotce}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.nim !== undefined ? `${f.nim}%` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.efficiencyRatio !== undefined ? `${f.efficiencyRatio}%` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.cet1Ratio !== undefined ? (
                                        <span className={f.cet1Ratio >= 11 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.cet1Ratio}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                  </>
                                ) : isHomebuilder ? (
                                  <>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.housingGrossMargin !== undefined ? (
                                        <span className={f.housingGrossMargin >= 22 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.housingGrossMargin}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.netDebtToCapital !== undefined ? `${f.netDebtToCapital}%` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.landYearsControlled !== undefined ? `${f.landYearsControlled} yrs` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.evToTrueFcf !== undefined ? (
                                        <span className="text-cyan-300 font-semibold">{f.evToTrueFcf}x</span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.netCashToMarketCap !== undefined ? (
                                        <span className={f.netCashToMarketCap > 0 ? "text-emerald-400" : "text-amber-400"}>
                                          {f.netCashToMarketCap}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                  </>
                                ) : isReit ? (
                                  <>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.peRatio !== undefined ? `${f.peRatio}x` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.dividendYield !== undefined ? (
                                        <span className={f.dividendYield >= 4 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.dividendYield}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.roe !== undefined ? (
                                        <span className={f.roe >= 10 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.roe}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-cyan-300 font-medium">
                                      {f.priceToBook !== undefined ? `${f.priceToBook}x` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.evToTrueFcf !== undefined ? (
                                        <span className="text-cyan-300 font-semibold">{f.evToTrueFcf}x</span>
                                      ) : f.trueFcf !== undefined && f.trueFcf <= 0 ? (
                                        <span className="text-amber-400 font-medium">N/M (Neg)</span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                      {f.netDebt !== undefined ? `$${f.netDebt}` : '--'}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.grossMargin !== undefined ? (
                                        <span className={f.grossMargin >= 60 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.grossMargin}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.operatingMargin !== undefined ? (
                                        <span className={f.operatingMargin >= 20 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                          {f.operatingMargin}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.roic !== undefined ? (
                                        <span className={f.roic >= 15 ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                                          {f.roic}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.evToTrueFcf !== undefined ? (
                                        <span className="text-cyan-300 font-semibold">{f.evToTrueFcf}x</span>
                                      ) : f.trueFcf !== undefined && f.trueFcf <= 0 ? (
                                        <span className="text-amber-400 font-medium">N/M (Neg)</span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.evToOwnerEarnings !== undefined ? (
                                        <span className="text-emerald-300 font-semibold">{f.evToOwnerEarnings}x</span>
                                      ) : f.ownerEarnings !== undefined && f.ownerEarnings <= 0 ? (
                                        <span className="text-amber-400 font-medium">N/M (Neg)</span>
                                      ) : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {f.netCashToMarketCap !== undefined ? (
                                        <span className={f.netCashToMarketCap > 0 ? "text-emerald-400" : "text-amber-400"}>
                                          {f.netCashToMarketCap}%
                                        </span>
                                      ) : '--'}
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                        <ShieldCheck className="w-4 h-4" />
                        {isInsurance ? "Underwriting Profitability & Capital Compounding Framework: P/B vs. ROE"
                          : isBank ? "Bank Balance Sheet Solvency Framework: P/TBV vs. ROTCE Spread"
                          : isHomebuilder ? "Asset-Light Land Velocity Framework: Land Control & Adjusted FCF"
                          : isReit ? "Real Estate Net Operating Income & AFFO Yield Framework"
                          : "Institutional Multi-Factor Framework: True FCF vs. Owner Earnings Proxy"}
                      </div>
                      <p className="text-slate-400 leading-relaxed font-sans">
                        {isInsurance ? (
                          <>
                            • <strong className="text-slate-200">Price / Book Value (P/B):</strong> Core valuation baseline for insurers since float and investment assets back insurance liabilities.<br />
                            • <strong className="text-emerald-300">Return on Equity (ROE %):</strong> The primary compounding velocity metric for long-term underwriting and float generation.<br />
                            • Peers labeled with <span className="text-emerald-400 font-bold">★</span> denote reciprocal peer benchmarking verified in SEC DEF 14A proxy disclosures.
                          </>
                        ) : isBank ? (
                          <>
                            • <strong className="text-slate-200">Price / Tangible Book Value (P/TBV):</strong> Ground-truth equity valuation excluding intangibles.<br />
                            • <strong className="text-emerald-300">ROTCE & Net Interest Margin (NIM):</strong> Core earnings power spread over deposit costs.<br />
                            • Peers labeled with <span className="text-emerald-400 font-bold">★</span> denote reciprocal peer benchmarking verified in SEC DEF 14A proxy disclosures.
                          </>
                        ) : isHomebuilder ? (
                          <>
                            • <strong className="text-slate-200">Housing Gross Margin %:</strong> Unit profitability before overhead and financing.<br />
                            • <strong className="text-emerald-300">Land Years Controlled:</strong> Optioned vs. owned land inventory duration.<br />
                            • Peers labeled with <span className="text-emerald-400 font-bold">★</span> denote reciprocal peer benchmarking verified in SEC DEF 14A proxy disclosures.
                          </>
                        ) : isReit ? (
                          <>
                            • <strong className="text-slate-200">Price / FFO or AFFO:</strong> Standardized cash flow measure adding back real estate depreciation and deducting maintenance CapEx.<br />
                            • <strong className="text-emerald-300">Dividend Yield & Net Debt:</strong> Yield sustainability and leverage against property income (EBITDAre).<br />
                            • Peers labeled with <span className="text-emerald-400 font-bold">★</span> denote reciprocal peer benchmarking verified in SEC DEF 14A proxy disclosures.
                          </>
                        ) : (
                          <>
                            • <strong className="text-slate-200">EV / True FCF (ex-SBC):</strong> Ultra-conservative baseline where 100% of Total CapEx and Stock-Based Compensation (SBC) are deducted as cash expenses.<br />
                            • <strong className="text-emerald-300">EV / Owner Earnings (Proxy):</strong> Institutional normalization based on Greenwald / Buffett. Maintenance CapEx is capped at economic D&A (<code className="text-cyan-300 font-mono text-[11px]">min(CapEx, D&A)</code>), crediting back Growth CapEx spent to expand business capacity, while deducting SBC as true dilution.<br />
                            • Peers labeled with <span className="text-emerald-400 font-bold">★</span> denote reciprocal peer benchmarking verified in SEC DEF 14A proxy disclosures.
                          </>
                        )}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#111624]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#161c2d] text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Candidate Peer</th>
                      <th className="py-3 px-3">Ticker</th>
                      <th className="py-3 px-3">Discovery Channel</th>
                      <th className="py-3 px-3 text-center">Peer Role</th>
                      <th className="py-3 px-3 text-center">Data Status</th>
                      <th className="py-3 px-4">Provenance Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dossier.peers.map((peer, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-sans text-slate-200 font-medium">
                          {peer.name}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-300">
                          {peer.ticker || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {peer.source === 'proxy_peer' ? 'SEC DEF 14A (CD&A)' :
                           peer.source === '10k_risk' ? '10-K Item 1 / 1A' :
                           peer.source === 'transcript_qa' ? 'Transcript Q&A' : 'Industry Benchmark'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 text-[10px] rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-medium">
                            Direct Competitor
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {peer.provenanceStatus === 'VERIFIED_COMPLETE' ? (
                            <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              🟢 Complete
                            </span>
                          ) : peer.provenanceStatus === 'PARTIAL' ? (
                            <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              🟡 Partial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400 border border-slate-700">
                              ⚪ Context Only
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-400 text-xs">
                          {peer.provenanceNotes || 'Standard verification'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-slate-300">Data Lineage Protocol:</p>
                <p className="text-slate-400">
                  All metrics are retrieved with zero-blocking 3.5-second async timeouts. Any candidate peer with missing filings or foreign ADR translation friction is safely preserved in the audit log without interrupting the analytical execution flow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-[#131825] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            Generated: {new Date(dossier?.generatedAt || Date.now()).toLocaleTimeString()} | Total Candidates: {dossier?.peers.length || 0}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
}
