const bcrypt = require('bcryptjs');

async function testPasswords() {
    const testCases = [
        { email: 'admin@anri.go.id', password: 'admin123' },
        { email: 'direktur@anri.go.id', password: 'direktur123' },
        { email: 'security@anri.go.id', password: 'security123' },
        { email: 'compliance@anri.go.id', password: 'compliance123' },
    ];

    console.log('Testing password hashing...\n');

    for (const test of testCases) {
        const hash = await bcrypt.hash(test.password, 12);
        const isValid = await bcrypt.compare(test.password, hash);
        console.log(`${test.email}:`);
        console.log(`  Password: ${test.password}`);
        console.log(`  Hash valid: ${isValid}`);
        console.log();
    }
}

testPasswords();
