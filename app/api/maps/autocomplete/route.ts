import { NextApiRequest, NextApiResponse } from 'next';
import { AddressAutofillCore } from '@mapbox/search-js-core';

const autofill = new AddressAutofillCore({
  accessToken: process.env.MAPBOX_API_KEY, // Ensure this is set in your server environment
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  console.log('Received query:', query);

  if (!query || typeof query !== 'string') {
    console.error('Invalid query:', query);
    return res.status(400).json({ error: 'Invalid query' });
  }

  try {
    console.log('Fetching suggestions for query:', query);
    const suggestions = await autofill.suggest(query);
    console.log('Suggestions fetched successfully:', suggestions);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}
``