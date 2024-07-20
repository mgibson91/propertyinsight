process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_PORT = '54322';
process.env.DB_USER = 'postgres';

// process.env.DB_HOST = 'aws-0-eu-west-2.pooler.supabase.com';
// process.env.DB_NAME = 'postgres';
// process.env.DB_PASSWORD = 'thisismyparty!';
// process.env.DB_PORT = '6543';
// process.env.DB_USER = 'postgres.lmdjnapcgjqqcfbjkvbq';

import path from 'node:path';
import csv from 'csv-parser';
import * as fs from 'node:fs';
import { db } from '../repository/kysely-connection';

async function main(filePath: string, streamId: string) {
  console.log('A');

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('B');

  // await client.connect();
  //
  const csvFilePath = path.resolve(filePath);
  //
  // const streams = new Map<string, string>();
  //
  const readStream = fs.createReadStream(csvFilePath).pipe(csv());

  let i = 0;

  for await (const row of readStream) {
    const { Unix, Symbol, Open, High, Low, Close, 'Volume USDT': Volume_USDT } = row;

    await db
      .insertInto('ticker_stream_data')
      .values({
        stream_id: streamId,
        timestamp: Unix,
        open: parseFloat(Open),
        close: parseFloat(Close),
        high: parseFloat(High),
        low: parseFloat(Low),
        volume_usd: parseFloat(Volume_USDT),
      })
      .execute();

    i++;
    if (i % 1000 === 0) {
      console.log('Inserted row', i);
    }
  }

  console.log('Done');

  //   if (!streams.has(Symbol)) {
  //     const result = await client.query(
  //       `INSERT INTO ticker_streams (source, name, period) VALUES ($1, $2, $3) RETURNING id`,
  //       ['binance', Symbol, '1h']
  //     );
  //     const streamId = result.rows[0].id;
  //     streams.set(Symbol, streamId);
  //   }

  //   const streamId = streams.get(Symbol);
  //
  //   await client.query(
  //     `INSERT INTO ticker_stream_data (stream_id, time, open, close, high, low, volume_usd) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  //     [streamId, Date, parseFloat(Open), parseFloat(Close), parseFloat(High), parseFloat(Low), parseFloat(Volume_USDT)]
  //   );
  // }
  //
  // await client.end();
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a path to the CSV file');
  process.exit(1);
}

const streamId = process.argv[3];
if (!streamId) {
  console.error('Please provide a streamId');
  process.exit(1);
}

main(filePath, streamId).catch(err => {
  console.error(err);
  process.exit(1);
});
