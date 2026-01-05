const pkg = require('pdf-signature-reader');
console.log("Type of default export:", typeof pkg);

// Attempt to call it (simulated buffer)
try {
    const res = pkg(Buffer.from("Fake PDF"));
    console.log("Result:", res);
} catch (e) {
    console.log("Error calling default export:", e.message);
}
