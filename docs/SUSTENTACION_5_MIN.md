# Sustentación AppSec — 4:45

Grupo G06 · NetOps Secure Execution Portal. La actividad Code Breaker se demuestra aparte con docs/REPORTE_CODEBREAKER.md.

## 0:00–0:30 | Alcance
“Analizamos el portal estático y sus workflows. La evaluación cubre Semgrep, Gitleaks, Dependabot y OWASP ZAP Baseline pasivo. Comparamos el estado inicial con las correcciones; el retest HTTP local quedó guardado y los artefactos del pipeline final están pendientes.”

## 0:30–1:35 | SAST
“Semgrep encontró seis advertencias por tags mutables en GitHub Actions. La revisión de código también encontró valores dinámicos insertados como HTML, con riesgo de XSS de severidad media. Fijamos las acciones por SHA y cambiamos el renderizado a nodos DOM y textContent. Externalizamos los scripts para que Semgrep analice JavaScript directamente.”
Mostrar: docs/evidence/appsec/06_powershell_semgrep_6_warnings.png y app/js/audit-log.js / app/js/simulate.js.
Validación pendiente: ejecutar el workflow corregido en el commit que se presenta. El semgrep.json anterior tiene error de parseo y no demuestra cero hallazgos.

## 1:35–2:25 | SCA y secretos
“El portal no declara paquetes de runtime. Dependabot quedó configurado para revisar semanalmente las acciones de GitHub. Gitleaks revisa el historial completo. Mostramos los resultados del commit actual; no tomamos un check verde como sustituto del reporte.”
Mostrar: docs/evidence/appsec/DEPENDENCIAS.md, resumen actual de Gitleaks y Dependabot Alerts.
Pendiente: adjuntar resultados del commit final; las capturas existentes son históricas.

## 2:25–4:10 | DAST
“ZAP pasivo y las solicitudes HTTP identificaron falta de X-Frame-Options y X-Content-Type-Options, además de exposición de versión. Clickjacking se clasificó medio y divulgación de versión baja. En Nginx aplicamos CSP, X-Frame-Options DENY, nosniff y server_tokens off. La comparación de cabeceras antes y después valida esos cambios.”
Mostrar: cabeceras antes/después y reportes HTML/JSON de ZAP Baseline.
Pendiente: guardar el artefacto ZAP de la ejecución del commit presentado; el repositorio aún no lo incluye.

## 4:10–4:45 | Cierre
“Remediamos los riesgos priorizados y dejamos controles repetibles en CI. La validación final debe corresponder al mismo commit y combinar reportes de herramientas con pruebas de comportamiento. Code Breaker se resolvió aparte: recuperamos BREAKER#2026 mediante Ghidra y AES-256-CBC y validamos la bandera al ejecutar el binario.”

## Antes de presentar
1. Reejecutar SAST y guardar su artefacto.
2. Guardar resumen Gitleaks del mismo commit.
3. Revisar y capturar Dependabot Alerts.
4. Guardar reportes ZAP HTML/JSON de staging autorizado.
5. Tener abierta la evidencia de ejecución de Code Breaker si la solicitan.
