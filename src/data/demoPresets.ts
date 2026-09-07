import { MatchScoreRecord } from '../storage/localStorageService';

// Realistic sample completed matches for Week 1 to 3 (24 matches completed)
export const SAMPLE_MID_SEASON_RESULTS: Record<string, MatchScoreRecord> = {
  // --- Week 1 ---
  // Jumat, 14 Agustus 2026
  's18-w01-m01': { homeScore: 2, awayScore: 0 }, // EVOS 2 - 0 RRQ (15:00)
  's18-w01-m02': { homeScore: 0, awayScore: 2 }, // NAVI 0 - 2 AE (18:00)
  // Sabtu, 15 Agustus 2026
  's18-w01-m03': { homeScore: 2, awayScore: 1 }, // TLID 2 - 1 GEEK (14:00)
  's18-w01-m04': { homeScore: 1, awayScore: 2 }, // DEWA 1 - 2 RRQ (17:00)
  's18-w01-m05': { homeScore: 1, awayScore: 2 }, // EVOS 1 - 2 NAVI (20:00)
  // Minggu, 16 Agustus 2026
  's18-w01-m06': { homeScore: 2, awayScore: 0 }, // TLID 2 - 0 DEWA (14:00)
  's18-w01-m07': { homeScore: 2, awayScore: 1 }, // BTR 2 - 1 GEEK (17:00)
  's18-w01-m08': { homeScore: 0, awayScore: 2 }, // AE 0 - 2 ONIC (20:00)

  // --- Week 2 ---
  // Jumat, 21 Agustus 2026
  's18-w02-m01': { homeScore: 0, awayScore: 2 }, // TLID 0 - 2 NAVI (15:00)
  's18-w02-m02': { homeScore: 2, awayScore: 0 }, // BTR 2 - 0 DEWA (18:00)
  // Sabtu, 22 Agustus 2026
  's18-w02-m03': { homeScore: 2, awayScore: 0 }, // TLID 2 - 0 EVOS (14:00)
  's18-w02-m04': { homeScore: 2, awayScore: 1 }, // NAVI 2 - 1 GEEK (17:00)
  's18-w02-m05': { homeScore: 2, awayScore: 0 }, // ONIC 2 - 0 RRQ (20:00)
  // Minggu, 23 Agustus 2026
  's18-w02-m06': { homeScore: 0, awayScore: 2 }, // DEWA 0 - 2 AE (14:00)
  's18-w02-m07': { homeScore: 1, awayScore: 2 }, // ONIC 1 - 2 BTR (17:00)
  's18-w02-m08': { homeScore: 0, awayScore: 2 }, // GEEK 0 - 2 EVOS (20:00)

  // --- Week 3 ---
  // Jumat, 28 Agustus 2026
  's18-w03-m01': { homeScore: 2, awayScore: 0 }, // BTR 2 - 0 NAVI (15:00)
  's18-w03-m02': { homeScore: 2, awayScore: 0 }, // DEWA 2 - 0 GEEK (18:00)
  // Sabtu, 29 Agustus 2026
  's18-w03-m03': { homeScore: 2, awayScore: 1 }, // TLID 2 - 1 ONIC (14:00)
  's18-w03-m04': { homeScore: 2, awayScore: 0 }, // AE 2 - 0 EVOS (17:00)
  's18-w03-m05': { homeScore: 1, awayScore: 2 }, // RRQ 1 - 2 BTR (20:00)
  // Minggu, 30 Agustus 2026
  's18-w03-m06': { homeScore: 2, awayScore: 0 }, // NAVI 2 - 0 ONIC (14:00)
  's18-w03-m07': { homeScore: 0, awayScore: 2 }, // GEEK 0 - 2 RRQ (17:00)
  's18-w03-m08': { homeScore: 2, awayScore: 1 }, // TLID 2 - 1 AE (20:00)

  // --- Week 4 ---
  // Jumat, 4 September 2026
  's18-w04-m01': { homeScore: 2, awayScore: 0 }, // NAVI 2 - 0 DEWA (15:00)
  's18-w04-m02': { homeScore: 2, awayScore: 0 }, // TLID 2 - 0 RRQ (18:00)
  // Sabtu, 5 September 2026
  's18-w04-m03': { homeScore: 2, awayScore: 1 }, // DEWA 2 - 1 ONIC (14:00)
  's18-w04-m04': { homeScore: 2, awayScore: 1 }, // EVOS 2 - 1 BTR (17:00)
  's18-w04-m05': { homeScore: 2, awayScore: 0 }, // AE 2 - 0 GEEK (20:00)
  // Minggu, 6 September 2026
  's18-w04-m06': { homeScore: 0, awayScore: 2 }, // RRQ 0 - 2 NAVI (14:00)
  's18-w04-m07': { homeScore: 2, awayScore: 0 }, // ONIC 2 - 0 EVOS (17:00)
  's18-w04-m08': { homeScore: 0, awayScore: 2 }  // BTR 0 - 2 AE (20:00)
};

export const SAMPLE_RESULTS_WEEK_1_TO_4 = Object.entries(SAMPLE_MID_SEASON_RESULTS).map(
  ([matchId, scores]) => ({
    matchId,
    homeScore: scores.homeScore,
    awayScore: scores.awayScore
  })
);
