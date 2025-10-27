#!/usr/bin/env node

console.log('🔄 Restarting server...');

// Kill any existing node processes on port 3001
const { exec } = require('child_process');

exec('netstat -ano | findstr :3001', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        console.log(`Killing process ${pid} on port 3001`);
        exec(`taskkill /PID ${pid} /F`, (killError) => {
          if (killError) {
            console.log('Could not kill process:', killError.message);
          }
        });
      }
    }
  }
  
  // Wait a moment then start server
  setTimeout(() => {
    console.log('🚀 Starting server...');
    exec('npm start', { cwd: __dirname }, (startError, stdout, stderr) => {
      if (startError) {
        console.error('Error starting server:', startError);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
  }, 2000);
});
