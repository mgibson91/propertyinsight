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
import { DateTime } from 'luxon';
import { db } from '../repository/kysely-connection';

async function main(filePath: string, streamId: string) {
  const csvFilePath = path.resolve(filePath);
  const readStream = fs.createReadStream(csvFilePath).pipe(
    csv({
      mapHeaders: ({ header }) => {
        switch (header) {
          case '<TICKER>':
            return 'Ticker';
          case '<DTYYYYMMDD>':
            return 'Date';
          case '<TIME>':
            return 'Time';
          case '<OPEN>':
            return 'Open';
          case '<HIGH>':
            return 'High';
          case '<LOW>':
            return 'Low';
          case '<CLOSE>':
            return 'Close';
          case '<VOL>':
            return 'Volume';
          default:
            return header;
        }
      },
    })
  );

  let batch = [];
  let i = 0;

  for await (const row of readStream) {
    const { Ticker, Date, Time, Open, High, Low, Close, Volume } = row;
    const dateTimeString = `${Date}${Time}`;
    const timestamp = DateTime.fromFormat(dateTimeString, 'yyyyMMddHHmmss', { zone: 'utc' }).toMillis();

    batch.push({
      stream_id: streamId,
      timestamp,
      open: parseFloat(Open),
      close: parseFloat(Close),
      high: parseFloat(High),
      low: parseFloat(Low),
      volume_usd: parseFloat(Volume),
    });

    if (batch.length === 100) {
      await db.insertInto('ticker_stream_data').values(batch).execute();
      batch = [];
      console.log('Inserted batch of 100 rows');
    }

    i++;
  }

  if (batch.length > 0) {
    await db.insertInto('ticker_stream_data').values(batch).execute();
    console.log('Inserted final batch of', batch.length, 'rows');
  }

  console.log('Done');
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
