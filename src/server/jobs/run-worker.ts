import { startScoringWorker } from './scoring-worker';

console.log('[worker] Starting scoring worker...');
const worker = startScoringWorker();

// Graceful shutdown
function shutdown() {
  console.log('[worker] Shutting down...');
  void worker.close().then(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('[worker] Scoring worker is running. Waiting for jobs...');
