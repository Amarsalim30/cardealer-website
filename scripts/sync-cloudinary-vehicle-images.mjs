import { createCloudinaryAdminClient } from "./lib/cloudinary-admin.mjs";
import { loadServerSyncEnv } from "./lib/runtime-env.mjs";
import { createSupabaseAdminClient } from "./lib/supabase-admin.mjs";
import { syncVehicleImagesForStockCode } from "./lib/vehicle-image-sync.mjs";

function printUsage() {
  console.log(`
Usage:
  npm.cmd run cloudinary:sync -- --stock-code CAR-001
  npm.cmd run cloudinary:sync -- CAR-001
  npm.cmd run cloudinary:sync -- --stock-code CAR-001 --dry-run

Options:
  --stock-code <value>  Stock code to sync, e.g. CAR-001
  --dry-run             Show what would change without writing to Supabase
  --help                Show this help text
`.trim());
}

function parseArgs(argv) {
  const args = {
    stockCode: "",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--help" || token === "-h") {
      printUsage();
      process.exit(0);
    }

    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (token === "--stock-code") {
      args.stockCode = argv[index + 1] || "";
      index += 1;
      continue;
    }

    if (token.startsWith("--stock-code=")) {
      args.stockCode = token.split("=")[1] || "";
      continue;
    }

    if (!token.startsWith("--") && !args.stockCode) {
      args.stockCode = token;
      continue;
    }
  }

  if (!args.stockCode) {
    throw new Error("Provide a stock code with --stock-code CAR-001.");
  }

  return args;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const env = loadServerSyncEnv();
  const cloudinaryClient = createCloudinaryAdminClient(env);
  const supabase = createSupabaseAdminClient(env);

  const summary = await syncVehicleImagesForStockCode({
    cloudinaryClient,
    supabase,
    stockCode: options.stockCode,
    dryRun: options.dryRun,
  });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unexpected sync failure.";
  console.error(`[cloudinary-sync] ${message}`);
  process.exitCode = 1;
});
