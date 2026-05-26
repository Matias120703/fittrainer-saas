#!/usr/bin/env node
/**
 * FitTrainer smoke driver
 * Usage: node .claude/skills/run-fit-trainer-saas-app/smoke.mjs [--screenshots] [--port 3000]
 *
 * Verifies key routes and optionally takes screenshots via Chrome headless.
 * Run from the project root.
 */

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const takeScreenshots = args.includes('--screenshots')
const port = (() => {
  const i = args.indexOf('--port')
  return i !== -1 ? args[i + 1] : '3000'
})()
const base = `http://localhost:${port}`

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find(existsSync)

const SKILL_DIR = path.resolve(import.meta.dirname)

// ── Route checks ─────────────────────────────────────────────────────────────
const routes = [
  { path: '/',          expectStatus: [307, 302, 308], note: 'root → redirect to /login' },
  { path: '/login',     expectStatus: [200],            note: 'login page' },
  { path: '/register',  expectStatus: [200],            note: 'register page' },
  { path: '/dashboard', expectStatus: [307, 302],       note: 'dashboard → redirect (unauthenticated)' },
  { path: '/clients',   expectStatus: [307, 302],       note: 'clients → redirect (unauthenticated)' },
]

let passed = 0
let failed = 0

console.log(`\n🔍  Smoke-testing FitTrainer at ${base}\n`)

for (const route of routes) {
  try {
    const res = await fetch(`${base}${route.path}`, { redirect: 'manual' })
    const ok = route.expectStatus.includes(res.status)
    if (ok) {
      console.log(`  ✅  ${res.status}  ${route.path}  — ${route.note}`)
      passed++
    } else {
      console.log(`  ❌  ${res.status}  ${route.path}  — expected ${route.expectStatus.join('/')}`)
      failed++
    }
  } catch (err) {
    console.log(`  ❌  ERR  ${route.path}  — ${err.message}`)
    failed++
  }
}

console.log(`\n  ${passed} passed, ${failed} failed\n`)

// ── Screenshots ───────────────────────────────────────────────────────────────
if (takeScreenshots) {
  if (!CHROME) {
    console.error('  ⚠️  No Chrome/Edge found. Install Chrome to use --screenshots.')
    process.exit(failed > 0 ? 1 : 0)
  }

  const pages = [
    { url: `${base}/login`,    file: 'ss-login.png' },
    { url: `${base}/register`, file: 'ss-register.png' },
  ]

  console.log('📸  Taking screenshots...\n')

  for (const { url, file } of pages) {
    const out = path.join(SKILL_DIR, file)
    execSync(
      `"${CHROME}" --headless=new --screenshot="${out}" --window-size=1440,900 --no-sandbox "${url}"`,
      { stdio: 'inherit' }
    )
    console.log(`  → ${out}`)
  }

  console.log()
}

process.exit(failed > 0 ? 1 : 0)
