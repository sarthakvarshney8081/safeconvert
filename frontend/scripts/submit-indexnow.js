const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'safeconverts.com';
const KEY = 'a2aa6247daaea84b56337b9b813f46a4';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function getDirectories(dirPath) {
    try {
        const fullPath = path.join(__dirname, '..', 'app', dirPath); // Adjust path relative to script location
        if (!fs.existsSync(fullPath)) return [];

        return fs.readdirSync(fullPath).filter(file => {
            const stat = fs.statSync(path.join(fullPath, file));
            return stat.isDirectory() && !file.startsWith('(') && !file.startsWith('_');
        });
    } catch (error) {
        console.error(`Error scanning ${dirPath}:`, error.message);
        return [];
    }
}

async function submitToIndexNow() {
    console.log('🔍 Scanning pages...');

    // 1. Gather URLs
    const pdfTools = getDirectories('tools');
    const itTools = getDirectories('it-tools');
    const workflowDirs = getDirectories('workflow');

    const urls = [
        `https://${HOST}/`,
        `https://${HOST}/about`,
        `https://${HOST}/privacy`,
        `https://${HOST}/contact`,
        `https://${HOST}/tools`,
        `https://${HOST}/it-tools`,
        `https://${HOST}/workflow`,
        ...pdfTools.map(t => `https://${HOST}/tools/${t}`),
        ...itTools.map(t => `https://${HOST}/it-tools/${t}`),
        ...workflowDirs.map(w => `https://${HOST}/workflow/${w}`)
    ];

    console.log(`✅ Found ${urls.length} URLs to index.`);

    // 2. Prepare Payload
    const payload = JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls
    });

    // 3. Send Request
    console.log('🚀 Sending request to IndexNow...');

    const options = {
        hostname: 'api.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(options, (res) => {
        console.log(`📡 Status Code: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('🎉 Successfully submitted URLs for indexing!');
        } else {
            console.error('❌ Failed to submit URLs.');
        }

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            if (chunk) console.log('Response:', chunk);
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Request Error: ${e.message}`);
    });

    req.write(payload);
    req.end();
}

submitToIndexNow();
