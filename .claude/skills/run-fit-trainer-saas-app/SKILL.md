---
name: run-fit-trainer-saas-app
description: Run, start, build, screenshot, verify, or test the FitTrainer Next.js SaaS app. Use this skill to launch the dev server, take screenshots of pages, or confirm a change works in the running app.
---

FitTrainer es una app Next.js 16 + Supabase para personal trainers. Se corre con `npm run dev` en Windows.
El driver programático es `smoke.mjs` — verifica rutas y toma screenshots vía Chrome headless.

Paths son relativos a la raíz del proyecto (`C:\Users\pc\Desktop\systemforDanny`).

---

## Prerequisitos

- **Node 22** (`node --version` → v22.19.0 verificado)
- **Chrome** en `C:\Program Files\Google\Chrome\Application\chrome.exe` (verificado)
- Variables de entorno en `.env.local` (Supabase URL + anon key, ya configuradas)

No se requiere `npm install` adicional — las deps ya están instaladas en `node_modules/`.

---

## Build (si es necesario)

```powershell
npm run build
```

Para desarrollo normal no se necesita — `npm run dev` usa Turbopack y compila en caliente.

---

## Run: Agent path (driver)

```powershell
# 1. Arrancar el servidor de dev en background
Start-Job -ScriptBlock { Set-Location "C:\Users\pc\Desktop\systemforDanny"; npm run dev }

# Esperar que levante (~10s). Usa puerto 3000 por defecto (3001 si 3000 está ocupado).
Start-Sleep -Seconds 12

# 2. Smoke test: verifica 5 rutas clave, exit 0 si todo OK
node .claude/skills/run-fit-trainer-saas-app/smoke.mjs --port 3000

# 3. Smoke test + screenshots (ss-login.png y ss-register.png en skill dir)
node .claude/skills/run-fit-trainer-saas-app/smoke.mjs --port 3000 --screenshots
```

Salida esperada:
```
✅  307  /  — root → redirect to /login
✅  200  /login  — login page
✅  200  /register  — register page
✅  307  /dashboard  — dashboard → redirect (unauthenticated)
✅  307  /clients  — clients → redirect (unauthenticated)

5 passed, 0 failed
```

Screenshots van a: `.claude/skills/run-fit-trainer-saas-app/ss-{login,register}.png`

---

## Screenshot de una página específica

```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
& $chrome --headless=new --screenshot="ss-dashboard.png" --window-size=1440,900 --no-sandbox "http://localhost:3000/login"
```

---

## Run: Human path

```powershell
npm run dev
# → http://localhost:3000 se abre en el browser
# Ctrl+C para detener
```

---

## TypeScript check

```powershell
npx tsc --noEmit
# Sin output = sin errores (verificado)
```

---

## Gotchas

- **Puerto ocupado**: Si el puerto 3000 ya está en uso (hay otra instancia corriendo), Next.js levanta en 3001. Verificar con `Test-NetConnection -ComputerName localhost -Port 3000`. Pasar `--port 3001` al smoke driver.
- **El servidor ya está corriendo**: El proyecto tiene una instancia persistente en PID 9200 en puerto 3000. No matar a menos que sea necesario.
- **Rutas de trainer y cliente**: `/dashboard`, `/clients`, etc. redirigen con 307 cuando no hay sesión activa. Esto es correcto — Supabase SSR verifica la cookie de sesión server-side.
- **Chrome headless**: Con `--headless=new` (Chrome 112+) las fuentes Google Fonts se cargan desde la red. En entornos sin internet usar `--headless` (legacy) o las fonts caerán al fallback del sistema.
- **Import meta dirname en .mjs**: El smoke script usa `import.meta.dirname` (Node 22+). No funciona en Node < 21.

---

## Troubleshooting

| Síntoma | Fix |
|---|---|
| `ECONNREFUSED` al hacer fetch | El servidor no levantó. Esperar más (`Start-Sleep -Seconds 20`) o verificar con `Test-NetConnection -Port 3000`. |
| Chrome abre ventana en vez de screenshot | Asegurarse de usar `--headless=new` (no `--headless=old`). |
| Build falla con error de tipos | Correr `npx tsc --noEmit` para ver el error específico. |
| `next dev` falla en startup | Verificar `.env.local` tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
