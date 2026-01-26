const http = require('http');

// Test all demo users
const testUsers = [
    { email: 'admin@anri.go.id', password: 'admin123', expectedRole: 'SYSTEM_ADMIN' },
    { email: 'direktur@anri.go.id', password: 'direktur123', expectedRole: 'EXECUTIVE' },
    { email: 'security@anri.go.id', password: 'security123', expectedRole: 'IT_SECURITY' },
    { email: 'compliance@anri.go.id', password: 'compliance123', expectedRole: 'COMPLIANCE_OFFICER' },
];

async function testLogin(email, password, expectedRole) {
    const postData = JSON.stringify({ email, password });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runAllTests() {
    console.log('=== TESTING ALL DEMO USERS ===\n');

    let passed = 0;
    let failed = 0;

    for (const user of testUsers) {
        console.log(`Testing: ${user.email}`);
        try {
            const result = await testLogin(user.email, user.password, user.expectedRole);

            if (result.statusCode === 200 && result.data.success) {
                if (result.data.user.role === user.expectedRole) {
                    console.log(`  ✓ SUCCESS - Role: ${result.data.user.role}, Redirect: ${result.data.redirectUrl}`);
                    passed++;
                } else {
                    console.log(`  ✗ FAILED - Expected role ${user.expectedRole}, got ${result.data.user.role}`);
                    failed++;
                }
            } else {
                console.log(`  ✗ FAILED - Status ${result.statusCode}:`, result.data.error || 'Unknown error');
                failed++;
            }
        } catch (error) {
            console.log(`  ✗ ERROR:`, error.message);
            failed++;
        }
        console.log();
    }

    console.log('=== RESULTS ===');
    console.log(`Passed: ${passed}/${testUsers.length}`);
    console.log(`Failed: ${failed}/${testUsers.length}`);

    if (passed === testUsers.length) {
        console.log('\n🎉 ALL TESTS PASSED!');
    } else {
        console.log('\n⚠️  Some tests failed');
    }
}

runAllTests();
