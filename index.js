const domain = process.argv[2];

if (!domain) {
  console.error('Error: Please provide a domain.');
  process.exit(1);
}

console.log(`Pipeline starting for: ${domain}`);
