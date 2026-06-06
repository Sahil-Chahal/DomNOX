const config = require('../config');

async function findLookalikes(seedDomain) {
  if (!seedDomain) return [];

  const response = await fetch('https://api.ocean.io/v3/search/lookalike-companies', {
    method: 'POST',
    headers: {
      'X-Api-Token': config.OCEAN_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      domain: seedDomain,
      size: 10
    })
  });

  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : '';
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Ocean.io API Authentication Failed: ${response.status}${statusText}`);
    }
    if (response.status === 429) {
      throw new Error(`Ocean.io API Rate Limit Exceeded: ${response.status}${statusText}`);
    }
    throw new Error(`Ocean.io API Error: ${response.status}${statusText}`);
  }

  const data = await response.json();
  const companies = data.companies || data.results || data.data || [];

  if (companies.length === 0) {
    console.log(`No lookalike companies found for domain: ${seedDomain}`);
    return [];
  }

  return companies
    .map(c => c.domain || c.website)
    .filter(domain => typeof domain === 'string' && domain.length > 0);
}

module.exports = findLookalikes;
