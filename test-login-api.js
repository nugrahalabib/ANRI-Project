const http = require('http');

async function testLoginAPI() {
    const postData = JSON.stringify({
        email: 'admin@anri.go.id',
        password: 'admin123'
    });

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
                console.log('Status Code:', res.statusCode);
                console.log('Headers:', JSON.stringify(res.headers, null, 2));
                console.log('\nResponse Body:');
                try {
                    const parsed = JSON.parse(data);
                    console.log(JSON.stringify(parsed, null, 2));
                } catch (e) {
                    console.log(data);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('Error:', error.message);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

console.log('Testing login API...\n');
testLoginAPI();
