const config = require('../config');

async function resolveEmails(contacts) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return [];
  }

  const resolvedContacts = [];

  for (const contact of contacts) {
    if (!contact || !contact.linkedinUrl) continue;

    try {
      const response = await fetch('https://api.superflow.run/b2b/linkedin-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.EAZYREACH_API_KEY}`
        },
        body: JSON.stringify({
          linkedinUrl: contact.linkedinUrl
        })
      });

      if (!response.ok) {
        const statusText = response.statusText ? ` ${response.statusText}` : '';
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Eazyreach API Authentication Failed: ${response.status}${statusText}`);
        }
        if (response.status === 402) {
          throw new Error(`Eazyreach API Insufficient Balance: ${response.status}${statusText}`);
        }
        if (response.status === 429) {
          throw new Error(`Eazyreach API Rate Limit Exceeded: ${response.status}${statusText}`);
        }
        // Non-critical errors (e.g., 400, 404, 500) are skipped silently
        continue;
      }

      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.emails) && data.emails.length > 0) {
        const verifiedEmail = data.emails.find(e => e.verification === 'verified') || data.emails[0];
        if (verifiedEmail && verifiedEmail.email) {
          resolvedContacts.push({
            name: contact.name,
            title: contact.title,
            email: verifiedEmail.email,
            domain: contact.domain
          });
        }
      }
    } catch (error) {
      // Re-throw critical authentication, balance, or rate limit errors
      if (
        error.message.includes('Authentication Failed') ||
        error.message.includes('Insufficient Balance') ||
        error.message.includes('Rate Limit Exceeded')
      ) {
        throw error;
      }
      // Other errors are skipped silently
    }
  }

  return resolvedContacts;
}

module.exports = resolveEmails;

