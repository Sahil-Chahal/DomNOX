const config = require('../config');

async function sendOutreach(contacts) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    if (!contact || !contact.email) continue;

    const emailBody = `Hi ${contact.name},

I noticed you are leading the team as ${contact.title || 'a key leader'} at ${contact.domain}. Are you currently using multiple data providers for lead generation, or are you looking to automate domain lookalikes, contact searches, and email resolution into a single workflow?

We built a lightweight pipeline that does exactly this in under 30 seconds.

Let me know if you'd like me to send over a quick 2-minute video overview of how it works.

Best,
Outreach Team`;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': config.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: {
            email: config.BREVO_SENDER_EMAIL
          },
          to: [
            {
              email: contact.email,
              name: contact.name
            }
          ],
          subject: `Question about ${contact.domain}'s lead pipeline`,
          textContent: emailBody
        })
      });

      if (response.ok) {
        sent++;
        console.log(`[SUCCESS] Outreach sent to ${contact.name} <${contact.email}>`);
      } else {
        failed++;
        const statusText = response.statusText ? ` ${response.statusText}` : '';
        console.log(`[FAILURE] Failed to send outreach to ${contact.name} <${contact.email}>: ${response.status}${statusText}`);
      }
    } catch (error) {
      failed++;
      console.log(`[FAILURE] Failed to send outreach to ${contact.name} <${contact.email}>: ${error.message}`);
    }
  }

  return { sent, failed };
}

module.exports = sendOutreach;

