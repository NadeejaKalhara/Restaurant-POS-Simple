import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Simple authentication check (you may want to add proper auth)
const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'change-this-secret';

// Deploy endpoint with live streaming
router.get('/deploy', (req, res) => {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'start', message: '🚀 Starting deployment...\n' })}\n\n`);

  // Execute deploy script
  const deployScript = path.join(projectRoot, 'deploy.sh');
  const childProcess = exec(`bash ${deployScript}`, {
    cwd: projectRoot,
    env: { ...process.env, FORCE_COLOR: '0' }
  });

  // Stream stdout
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      res.write(`data: ${JSON.stringify({ type: 'output', message: line })}\n\n`);
    });
  });

  // Stream stderr
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: line })}\n\n`);
    });
  });

  // Handle process completion
  childProcess.on('close', (code) => {
    if (code === 0) {
      res.write(`data: ${JSON.stringify({ type: 'complete', message: '\n✅ Deployment completed successfully!', code: 0 })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'complete', message: `\n❌ Deployment failed with exit code ${code}`, code: code })}\n\n`);
    }
    res.end();
  });

  // Handle errors
  childProcess.on('error', (error) => {
    res.write(`data: ${JSON.stringify({ type: 'error', message: `Error: ${error.message}` })}\n\n`);
    res.end();
  });

  // Handle client disconnect
  req.on('close', () => {
    if (!childProcess.killed) {
      childProcess.kill('SIGTERM');
    }
  });
});

// Simple HTML page for deploy interface
router.get('/page', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deploy - Restaurant POS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #4ec9b0;
            margin-bottom: 20px;
            font-size: 24px;
        }
        .terminal {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
            min-height: 400px;
            max-height: 80vh;
            overflow-y: auto;
            font-size: 14px;
            line-height: 1.6;
        }
        .terminal-line {
            margin-bottom: 4px;
            word-wrap: break-word;
        }
        .terminal-line.output { color: #d4d4d4; }
        .terminal-line.error { color: #f48771; }
        .terminal-line.start { color: #4ec9b0; font-weight: bold; }
        .terminal-line.complete { 
            color: #4ec9b0; 
            font-weight: bold; 
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #30363d;
        }
        .controls {
            margin-bottom: 20px;
        }
        button {
            background: #238636;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
        button:hover { background: #2ea043; }
        button:disabled {
            background: #30363d;
            cursor: not-allowed;
            opacity: 0.6;
        }
        .status {
            display: inline-block;
            margin-left: 10px;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
        }
        .status.idle { background: #30363d; color: #8b949e; }
        .status.running { background: #1f6feb; color: white; }
        .status.success { background: #238636; color: white; }
        .status.error { background: #da3633; color: white; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Restaurant POS - Deployment Terminal</h1>
        <div class="controls">
            <button id="deployBtn" onclick="startDeploy()">Start Deployment</button>
            <span id="status" class="status idle">Idle</span>
        </div>
        <div class="terminal" id="terminal"></div>
    </div>

    <script>
        let eventSource = null;
        const terminal = document.getElementById('terminal');
        const deployBtn = document.getElementById('deployBtn');
        const status = document.getElementById('status');

        function addLine(message, type = 'output') {
            const line = document.createElement('div');
            line.className = 'terminal-line ' + type;
            line.textContent = message;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
        }

        function clearTerminal() {
            terminal.innerHTML = '';
        }

        function updateStatus(newStatus, text) {
            status.className = 'status ' + newStatus;
            status.textContent = text;
        }

        function startDeploy() {
            if (eventSource) {
                eventSource.close();
            }

            clearTerminal();
            deployBtn.disabled = true;
            updateStatus('running', 'Deploying...');

            eventSource = new EventSource('/api/deploy/deploy');

            eventSource.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'start') {
                        addLine(data.message, 'start');
                    } else if (data.type === 'output') {
                        addLine(data.message, 'output');
                    } else if (data.type === 'error') {
                        addLine(data.message, 'error');
                    } else if (data.type === 'complete') {
                        addLine(data.message, 'complete');
                        eventSource.close();
                        deployBtn.disabled = false;
                        
                        if (data.code === 0) {
                            updateStatus('success', 'Deployment Successful');
                        } else {
                            updateStatus('error', 'Deployment Failed');
                        }
                    }
                } catch (e) {
                    addLine('Error parsing message: ' + e.message, 'error');
                }
            };

            eventSource.onerror = function(error) {
                addLine('Connection error. Deployment may have completed.', 'error');
                eventSource.close();
                deployBtn.disabled = false;
                updateStatus('error', 'Connection Error');
            };
        }

        // Auto-start on page load (optional - remove if you want manual start)
        // startDeploy();
    </script>
</body>
</html>
  `);
});

export default router;

