const fs = require('fs');
const path = require('path');

const SECLISTS_BASE = path.join(__dirname, '../../SecLists');
const OUPUT_DIR = path.join(__dirname, '../data');
const HIBP_OUTPUT = path.join(OUPUT_DIR, 'hibp-public.json');
const DEHASHED_OUTPUT = path.join(OUPUT_DIR, 'dehashed-public.json');

const MAX_EMAILS = 5000;
const MAX_BREACHES_PER_EMAIL = 2;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

async function run() {


    const hibpData = {};
    const dehashedData = {};
    let emailCount = 0;

    // Initial Seed
    const testEmails = ['test@example.com', 'admin@cyberguard.com', 'demo@cyberguard-demo.com', 'user@domain.com'];
    testEmails.forEach(email => {
        hibpData[email] = [
            { Name: 'SecLists_Initial_Seed', BreachDate: '2024-01-01', DataClasses: ['Email addresses', 'Passwords'] }
        ];
        dehashedData[email] = [
            { database_name: 'SecLists_Initial_Seed', password: 'password123', username: email.split('@')[0] }
        ];
    });

    const relevantDirs = [
        path.join(SECLISTS_BASE, 'Usernames'),
        path.join(SECLISTS_BASE, 'Passwords/Leaked-Databases'),
        path.join(SECLISTS_BASE, 'Passwords/Common-Credentials'),
        path.join(SECLISTS_BASE, 'Passwords/Default-Credentials'),
    ];

    for (const dir of relevantDirs) {
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir, { recursive: true })
            .filter(f => typeof f === 'string' && f.endsWith('.txt'));

        for (const file of files) {
            if (emailCount >= MAX_EMAILS) break;

            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.size > MAX_FILE_SIZE) continue;



            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split(/\r?\n/);

                for (const line of lines) {
                    if (emailCount >= MAX_EMAILS) break;

                    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                    if (emailMatch) {
                        const email = emailMatch[0].toLowerCase();
                        const fileName = path.basename(file);

                        if (!hibpData[email]) {
                            hibpData[email] = [];
                            emailCount++;
                        }
                        if (hibpData[email].length < MAX_BREACHES_PER_EMAIL) {
                            hibpData[email].push({
                                Name: `Public Leak: ${fileName}`,
                                BreachDate: '2024-02-21',
                                DataClasses: ['Email addresses', 'Leak Source']
                            });
                        }

                        // More aggressive DeHashed collection
                        if (!dehashedData[email]) dehashedData[email] = [];
                        if (dehashedData[email].length < 1) {
                            const parts = line.split(/[:;, \t]/).map(p => p.trim()).filter(p => p.length > 0);
                            let password = 'unknown';
                            let username = email.split('@')[0];

                            if (parts.length >= 2) {
                                // Try to find something that isn't the email
                                for (const part of parts) {
                                    if (part.toLowerCase() !== email && !part.includes('@')) {
                                        password = part;
                                        break;
                                    }
                                }
                            }

                            dehashedData[email].push({
                                database_name: `Breach: ${fileName}`,
                                password: password,
                                username: username
                            });
                        }
                    }
                }
            } catch (err) {
                console.error(`❌ Error in ${file}:`, err.message);
            }
        }
    }


    fs.writeFileSync(HIBP_OUTPUT, JSON.stringify(hibpData, null, 2));
    fs.writeFileSync(DEHASHED_OUTPUT, JSON.stringify(dehashedData, null, 2));

}

run().catch(console.error);
