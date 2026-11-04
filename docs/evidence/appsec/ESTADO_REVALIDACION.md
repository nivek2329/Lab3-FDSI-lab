# Estado de revalidación — commit local

## Verificado en este checkout
- Los dos archivos JavaScript externalizados pasan `node --check`.
- `audit-log.js` y `simulate.js` no contienen `innerHTML`, `outerHTML` ni `insertAdjacentHTML`.
- Las páginas cargan esos scripts con `defer`; se eliminó `unsafe-inline` de `script-src`.
- Dependabot quedó configurado para GitHub Actions. La aplicación no declara manifiestos de paquetes de runtime.

## Retest HTTP local realizado
- `http://localhost:8080/` respondió HTTP 200. Se observaron `Server: nginx`, CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy y Permissions-Policy.
- Evidencia completa: `REVALIDACION_HEADERS_LOCAL.txt`.
- HSTS está ausente en esta respuesta porque la instancia es HTTP; verificarla en HTTPS.

## Pendiente de ejecución del pipeline
- Semgrep en GitHub Actions: el CLI no está instalado localmente; el `semgrep.json` previo registra un error parcial de parseo y no es un resultado final.
- Gitleaks: ejecutar el job sobre el commit final y guardar el resumen.
- Dependabot: revisar Security > Dependabot alerts después de publicar la configuración.
- ZAP: ejecutar Baseline pasivo sobre el staging autorizado y conservar HTML/JSON. Docker no está iniciado y ZAP Desktop no abrió en esta sesión.
