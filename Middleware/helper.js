import os from 'os';

// Middleware to capture server start time
let startTime;
export function captureStartTime() {
    startTime = process.hrtime();
}

// Function to calculate server uptime
export function calculateUptime() {
    const uptime = process.hrtime(startTime);
    const uptimeInSeconds = uptime[0];
    return uptimeInSeconds;
}

// Middleware to get server load information
export async function getServerLoadInfo(req, res, next) {
    const cpuUsage = os.loadavg();
    const memoryUsage = process.memoryUsage();
    req.serverLoadInfo = {
        cpuLoad: cpuUsage,
        memoryUsage: memoryUsage,
    };
    next();
}