console.log('Hello from minimal node script - I AM ALIVE!');
process.stdout.write('Hello via process.stdout\n');
process.stderr.write('Hello via process.stderr\n');
setInterval(() => {}, 1 << 30); 