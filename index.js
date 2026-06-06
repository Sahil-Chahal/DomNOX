const findLookalikes = require('./stages/findLookalikes');

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
      console.log('No lookalikes found. Exiting gracefully.');
      process.exit(0);
    }

    console.log('\nFound the following lookalike domains:');
    lookalikes.forEach(d => console.log(`- ${d}`));
    console.log('');
    
  } catch (error) {
    console.error(`Pipeline Failed: ${error.message}`);
    process.exit(1);
  }
}

run();
