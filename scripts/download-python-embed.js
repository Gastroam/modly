// @ts-check
const https = require('https')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const RESOURCES_DIR = path.join(__dirname, '..', 'resources')
const EMBED_DIR = path.join(RESOURCES_DIR, 'python-embed')

// ── Windows: official embeddable package ─────────────────────────────────────
const WIN_PYTHON_VERSION = '3.11.9'
const WIN_ZIP_URL = `https://www.python.org/ftp/python/${WIN_PYTHON_VERSION}/python-${WIN_PYTHON_VERSION}-embed-amd64.zip`
const WIN_GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py'

// ── Linux / macOS: python-build-standalone ───────────────────────────────────
const PBS_PYTHON_VERSION = '3.11.9'
const PBS_RELEASE = '20240726'

function getPbsUrl() {
  const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64'
  const triple = process.platform === 'darwin'
    ? `${arch}-apple-darwin`
    : `${arch}-unknown-linux-gnu`
  return (
    `https://github.com/indygreg/python-build-standalone/releases/download/` +
    `${PBS_RELEASE}/cpython-${PBS_PYTHON_VERSION}+${PBS_RELEASE}-${triple}-install_only.tar.gz`
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} → ${dest}`)
    const file = fs.createWriteStream(dest)
    const request = (u) => {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          request(res.headers.location)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`))
          return
        }
        const total = parseInt(res.headers['content-length'] || '0', 10)
        let received = 0
        res.on('data', (chunk) => {
          received += chunk.length
          if (total > 0) {
            const pct = Math.round((received / total) * 100)
            process.stdout.write(`\r  ${pct}% (${Math.round(received / 1024 / 1024)} MB)`)
          }
        })
        res.pipe(file)
        res.on('end', () => {
          process.stdout.write('\n')
          file.close(() => resolve())
        })
      }).on('error', reject)
    }
    request(url)
    file.on('error', reject)
  })
}

// ── Platform-specific extraction ──────────────────────────────────────────────

function extractZip(zipPath, destDir) {
  console.log(`Extracting ${zipPath} → ${destDir}`)
  fs.mkdirSync(destDir, { recursive: true })
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`,
    { stdio: 'inherit' }
  )
}

function extractTar(tarPath, destDir) {
  console.log(`Extracting ${tarPath} → ${destDir}`)
  fs.mkdirSync(destDir, { recursive: true })
  // --strip-components=1 removes the top-level "python/" directory from the archive
  execSync(`tar -xzf "${tarPath}" --strip-components=1 -C "${destDir}"`, { stdio: 'inherit' })
  // On macOS, remove quarantine attribute so Gatekeeper doesn't block execution
  if (process.platform === 'darwin') {
    try { execSync(`xattr -cr "${destDir}"`) } catch {}
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(RESOURCES_DIR, { recursive: true })

  if (process.platform === 'win32') {
    const pythonExe = path.join(EMBED_DIR, 'python.exe')
    const getPipDest = path.join(RESOURCES_DIR, 'get-pip.py')
    const zipTmp = path.join(RESOURCES_DIR, 'python-embed.zip')

    if (fs.existsSync(pythonExe) && fs.existsSync(getPipDest)) {
      console.log('python-embed (Windows) already present, skipping.')
      return
    }

    if (!fs.existsSync(pythonExe)) {
      await download(WIN_ZIP_URL, zipTmp)
      extractZip(zipTmp, EMBED_DIR)
      fs.unlinkSync(zipTmp)
      console.log('Python embeddable extracted.')
    } else {
      console.log('python.exe already present, skipping ZIP download.')
    }

    if (!fs.existsSync(getPipDest)) {
      await download(WIN_GET_PIP_URL, getPipDest)
      console.log('get-pip.py downloaded.')
    } else {
      console.log('get-pip.py already present.')
    }
  } else {
    // Linux / macOS: python-build-standalone (already includes pip)
    const pythonExe = path.join(EMBED_DIR, 'bin', 'python3')

    if (fs.existsSync(pythonExe)) {
      console.log('python-embed (Unix) already present, skipping.')
      return
    }

    const tarUrl = getPbsUrl()
    const tarTmp = path.join(RESOURCES_DIR, 'python-embed.tar.gz')
    await download(tarUrl, tarTmp)
    extractTar(tarTmp, EMBED_DIR)
    fs.unlinkSync(tarTmp)
    console.log('Python standalone extracted.')
  }

  console.log('Done. Resources ready.')
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
