import { Router, type IRouter } from "express";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const router: IRouter = Router();

// After esbuild bundles to dist/index.mjs, import.meta.url points to artifacts/api-server/dist/
// So 3 levels up reaches the workspace root where data.json lives
const DATA_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "data.json");

function loadData() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

router.get("/bot/stats", (req, res) => {
  try {
    const data = loadData();

    const punishments = Object.values(data.punishmentLogs ?? {}) as Array<{ status: string }>;
    const staffPoints = data.staffPoints ?? {};
    const giveaways = Object.values(data.giveaways ?? {}) as Array<{ ended: boolean }>;
    const messageStats = data.messageStats ?? {};

    const totalPunishments = punishments.length;
    const pendingPunishments = punishments.filter((p) => p.status === "Pending").length;
    const approvedPunishments = punishments.filter((p) => p.status === "Approved").length;
    const totalStaff = Object.keys(staffPoints).length;
    const totalGiveaways = giveaways.length;
    const activeGiveaways = giveaways.filter((g) => !g.ended).length;
    const totalStaffPoints = Object.values(staffPoints).reduce(
      (sum: number, s: unknown) => sum + ((s as { total: number }).total ?? 0),
      0
    );

    res.json({
      totalPunishments,
      pendingPunishments,
      approvedPunishments,
      totalStaff,
      totalGiveaways,
      activeGiveaways,
      totalStaffPoints,
      caseCounter: data.caseCounter ?? 0,
      totalTrackedUsers: Object.keys(messageStats).length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load bot stats");
    res.status(500).json({ error: "Failed to load bot data" });
  }
});

router.get("/bot/punishments", (req, res) => {
  try {
    const data = loadData();
    const logs = Object.values(data.punishmentLogs ?? {}) as Array<{
      id: string;
      target: string;
      moderator: string;
      type: string;
      reason: string;
      proof?: string | null;
      status: string;
      timestamp: number;
      reviewedBy?: string | null;
    }>;

    const result = logs
      .map((p) => ({
        id: p.id,
        target: p.target,
        moderator: p.moderator,
        type: p.type,
        reason: p.reason,
        proof: p.proof ?? null,
        status: p.status,
        timestamp: p.timestamp,
        reviewedBy: p.reviewedBy ?? null,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to load punishments");
    res.status(500).json({ error: "Failed to load bot data" });
  }
});

router.get("/bot/staff", (req, res) => {
  try {
    const data = loadData();
    const staffPoints = data.staffPoints ?? {};

    const result = Object.entries(staffPoints)
      .map(([userId, pts]) => {
        const p = pts as {
          total: number;
          monthly: number;
          modlogs: number;
          tickets: number;
          giveaways: number;
          strikes: number;
        };
        return {
          userId,
          total: p.total ?? 0,
          monthly: p.monthly ?? 0,
          modlogs: p.modlogs ?? 0,
          tickets: p.tickets ?? 0,
          giveaways: p.giveaways ?? 0,
          strikes: p.strikes ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to load staff leaderboard");
    res.status(500).json({ error: "Failed to load bot data" });
  }
});

router.get("/bot/giveaways", (req, res) => {
  try {
    const data = loadData();
    const giveaways = data.giveaways ?? {};

    const result = Object.entries(giveaways)
      .map(([id, g]) => {
        const gw = g as {
          prize: string;
          ended: boolean;
          winnerCount: number;
          host: string;
          allWinners?: string[];
          entryMap?: Record<string, number>;
          endAt: number;
          paused?: boolean;
        };
        return {
          id,
          prize: gw.prize ?? "Unknown",
          ended: gw.ended ?? false,
          winnerCount: gw.winnerCount ?? 1,
          host: gw.host ?? "",
          allWinners: gw.allWinners ?? [],
          entryCount: Object.keys(gw.entryMap ?? {}).length,
          endAt: gw.endAt ?? 0,
          paused: gw.paused ?? null,
        };
      })
      .sort((a, b) => b.endAt - a.endAt);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to load giveaways");
    res.status(500).json({ error: "Failed to load bot data" });
  }
});

router.get("/bot/messages", (req, res) => {
  try {
    const data = loadData();
    const messageStats = data.messageStats ?? {};

    const result = Object.entries(messageStats)
      .map(([userId, ms]) => {
        const m = ms as { daily: number; weekly: number; monthly: number; total: number };
        return {
          userId,
          total: m.total ?? 0,
          daily: m.daily ?? 0,
          weekly: m.weekly ?? 0,
          monthly: m.monthly ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to load message stats");
    res.status(500).json({ error: "Failed to load bot data" });
  }
});

export default router;
