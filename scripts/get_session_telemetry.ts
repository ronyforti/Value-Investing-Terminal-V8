async function getTelemetry() {
  const res = await fetch("http://localhost:3000/api/session");
  const data = await res.json() as any;
  const state = data.state;

  console.log("=== SESSION METRICS ===");
  console.log("Ticker:              ", state.config?.ticker);
  console.log("Period:              ", state.config?.period);
  console.log("Price:               ", state.config?.price);
  console.log("Pipeline Mode:       ", state.config?.pipelineMode);
  console.log("Service Tier:        ", state.config?.serviceTier);
  console.log("Execution Mode:      ", state.config?.executionMode);
  console.log("Cached Token Count:  ", state.cachedTokenCount);
  console.log("Cache Status:        ", state.cacheStatus);
  console.log("Uploaded File Tokens:", state.uploadedTokens);
  console.log("Live Tokens Used:    ", state.liveTokensUsed);

  console.log("\n=== MODEL HISTORY ITEMS ===");
  const modelHist = (state.history || []).filter((h: any) => h.role === "model");
  console.log(`Total model outputs recorded in history: ${modelHist.length}`);
  for (let i = 0; i < modelHist.length; i++) {
    const item = modelHist[i];
    console.log(`\nItem ${i + 1}: ${item.title || `Step ${item.index ?? i + 1}`}`);
    console.log(`  Timestamp:  ${item.timestamp}`);
    console.log(`  Model:      ${item.model || "N/A"}`);
    console.log(`  Tokens:     ${item.tokens || "N/A"}`);
    console.log(`  Char Length: ${(item.text || "").length}`);
  }

  // Compute total duration and total tokens
  let totalDurSeconds = 0;
  let totalPromptToks = 0;
  let totalReplyToks = 0;
  for (const s of state.steps) {
    if (s.duration) totalDurSeconds += s.duration;
    else if (s.startTime && s.endTime) totalDurSeconds += Math.round((s.endTime - s.startTime) / 1000);
    const pTok = s.promptTokens || s.usageMetadata?.promptTokenCount || 0;
    const rTok = s.replyTokens || s.usageMetadata?.candidatesTokenCount || 0;
    if (typeof pTok === 'number') totalPromptToks += pTok;
    if (typeof rTok === 'number') totalReplyToks += rTok;
  }
  console.log(`\nTotal Pipeline Duration: ${Math.floor(totalDurSeconds / 60)}m ${totalDurSeconds % 60}s (${totalDurSeconds}s)`);
  console.log(`Total Prompt Tokens:     ${totalPromptToks.toLocaleString()}`);
  console.log(`Total Generated Tokens:  ${totalReplyToks.toLocaleString()}`);
}

getTelemetry().catch(console.error);
