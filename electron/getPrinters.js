/**
 * Get list of Windows printers
 * Uses PowerShell to query Windows print queue
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Get list of installed printers on Windows
 */
async function getWindowsPrinters() {
  try {
    // Use PowerShell to get printer list
    const command = 'powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"';
    const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
    
    if (stderr) {
      console.error('[Get Printers] PowerShell error:', stderr);
      return [];
    }
    
    // Parse output - each line is a printer name
    const printers = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('Name'))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    console.log('[Get Printers] Found printers:', printers);
    return printers;
  } catch (error) {
    console.error('[Get Printers] Error:', error.message);
    // Fallback: return empty array
    return [];
  }
}

module.exports = { getWindowsPrinters };

