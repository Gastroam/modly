import { app } from 'electron'
import { appendFileSync, mkdirSync, existsSync, statSync, renameSync } from 'fs'
import { join } from 'path'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function getLogPath(): string {
  const logsDir = join(app.getPath('userData'), 'logs')
  mkdirSync(logsDir, { recursive: true })
  return join(logsDir, 'modly.log')
}

function rotate(logPath: string): void {
  try {
    if (existsSync(logPath) && statSync(logPath).size > MAX_SIZE_BYTES) {
      renameSync(logPath, logPath.replace('.log', '.old.log'))
    }
  } catch {}
}

function write(level: string, message: string): void {
  try {
    const logPath = getLogPath()
    rotate(logPath)
    const line = `[${new Date().toISOString()}] [${level}] ${message}\n`
    appendFileSync(logPath, line, 'utf-8')
  } catch {}
}

export const logger = {
  info:  (msg: string) => { console.log(msg);   write('INFO',  msg) },
  warn:  (msg: string) => { console.warn(msg);  write('WARN',  msg) },
  error: (msg: string) => { console.error(msg); write('ERROR', msg) },
  python:(msg: string) => {                      write('PYTHON', msg) },
}
