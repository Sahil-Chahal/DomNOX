const findLookalikes = require('./stages/findLookalikes');
const findContacts = require('./stages/findContacts');
const resolveEmails = require('./stages/resolveEmails');

const domain = process.argv[2];

if (!domain) {
  console.error('Error: Please provide a domain.');
  process.exit(1);
}

console.log(`Pipeline starting for: ${domain}`);

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

    console.log('\nFinal Resolved Contacts:');
    resolvedContacts.forEach(c => {
      console.log(`- ${c.name} (${c.title}) <${c.email}> [${c.domain}]`);
    });
    
  } catch (error) {
    console.error(`Pipeline Failed: ${error.message}`);
    process.exit(1);
  }
}

run();

