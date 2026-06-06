const config = require('../config');

async function findContacts(domains) {
  if (!Array.isArray(domains) || domains.length === 0) {
    return [];
  }

  const allContacts = [];

  for (const domain of domains) {
    if (!domain) continue;

    const response = await fetch('https://api.prospeo.io/search-person', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KEY': config.PROSPEO_API_KEY
      },
      body: JSON.stringify({
        filters: {
          company: {
            websites: {
              include: [domain]
            }
          },
          person_seniority: {
            include: ['C-Level', 'VP']
          }
        }
      })
    });

    if (!response.ok) {
      const statusText = response.statusText ? ` ${response.statusText}` : '';
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Prospeo API Authentication Failed: ${response.status}${statusText}`);
      }
      if (response.status === 429) {
        throw new Error(`Prospeo API Rate Limit Exceeded: ${response.status}${statusText}`);
      }
      throw new Error(`Prospeo API Error: ${response.status}${statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    for (const r of results) {
      if (r.full_name && r.linkedin_url) {
        allContacts.push({
          name: r.full_name,
          title: r.current_job_title || '',
          linkedinUrl: r.linkedin_url,
          domain: domain
        });
      }
    }
  }

  return allContacts;
}

module.exports = findContacts;

