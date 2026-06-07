const readline = require('readline');
const findLookalikes = require('./stages/findLookalikes');
const findContacts = require('./stages/findContacts');
const resolveEmails = require('./stages/resolveEmails');
const sendOutreach = require('./stages/sendOutreach');

const domain = process.argv[2];

if (!domain) {
  console.error('Error: Please provide a domain.');
  process.exit(1);
}

console.log(`Pipeline starting for: ${domain}`);

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run() {
  try {
    const lookalikes = await findLookalikes(domain);
    
    if (lookalikes.length === 0) {
      console.log('No lookalikes found. Exiting early.');
      process.exit(0);
    }

    console.log('\nFound the following lookalike domains:');
    lookalikes.forEach(d => console.log(`- ${d}`));
    console.log('');

    console.log('Fetching contacts for lookalike domains...');
    const contacts = await findContacts(lookalikes);
    if (contacts.length === 0) {
      console.log('No contacts found for lookalike domains. Exiting early.');
      process.exit(0);
    }

    console.log(`Found ${contacts.length} contacts. Resolving emails...`);
    const resolvedContacts = await resolveEmails(contacts);
    if (resolvedContacts.length === 0) {
      console.log('No emails resolved for contacts. Exiting early.');
      process.exit(0);
    }

    console.log('\n--- Pipeline Summary ---');
    console.table([
      { Stage: 'Domains Found', Count: lookalikes.length },
      { Stage: 'Contacts Found', Count: contacts.length },
      { Stage: 'Emails Resolved', Count: resolvedContacts.length }
    ]);

    console.log('\nResolved Contacts List:');
    resolvedContacts.forEach(c => {
      console.log(`${c.name} | ${c.title || 'N/A'} | ${c.email}`);
    });
    console.log('');

    const answer = await askQuestion(`Send outreach to ${resolvedContacts.length} contacts? (yes/no): `);
    if (answer.toLowerCase() !== 'yes') {
      console.log('Outreach aborted. Exiting cleanly.');
      process.exit(0);
    }

    console.log('\nStarting outreach send phase...');
    const result = await sendOutreach(resolvedContacts);
    console.log(`\nOutreach Phase Complete: Sent: ${result.sent}, Failed: ${result.failed}`);
    
  } catch (error) {
    console.error(`Pipeline Failed: ${error.message}`);
    process.exit(1);
  }
}

run();


