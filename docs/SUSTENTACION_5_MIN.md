# Sustentación AppSec — 4:45

Grupo G06 · NetOps Secure Execution Portal. La actividad Code Breaker se presenta aparte.

## 0:00–0:30 · Qué revisamos

“Vamos a contar qué encontramos, cómo lo corregimos y qué evidencia tenemos. Revisamos el portal, sus workflows y la respuesta HTTP. Al final separaré lo que está comprobado localmente de lo que falta volver a ejecutar en GitHub.”

Mostrar la portada y ubicar el alcance: código, workflows y cabeceras HTTP.

## 0:30–1:35 · SAST y revisión de código

“En la línea base, Semgrep marcó seis referencias mutables en GitHub Actions, con riesgo medio para la cadena de suministro. En la revisión manual vimos además que el registro y la simulación insertaban datos como HTML, con riesgo DOM XSS medio. Fijamos las acciones por SHA-40 y cambiamos la interfaz a nodos DOM y textContent. Externalizamos los scripts y quitamos scripts inline de la CSP.”

Mostrar la captura [06_powershell_semgrep_6_warnings.png](evidence/appsec/06_powershell_semgrep_6_warnings.png). Es histórica; corresponde a la línea base. Los dos scripts pasan node --check y ya no usan innerHTML. Falta reejecutar Semgrep en el commit que se presentará porque el JSON anterior tenía un error de parseo.

## 1:35–2:25 · Dependencias y secretos

“La aplicación no declara paquetes de runtime, así que no tenemos un inventario npm, pip o Maven con vulnerabilidades que reportar. Configuramos Dependabot para revisar las acciones de GitHub; después de publicar hay que revisar sus alertas. La captura de Gitleaks dice ‘No leaks detected’, pero es de una ejecución anterior. Hay que volver a correrlo en el commit final.”

Mostrar [DEPENDENCIAS.md](evidence/appsec/DEPENDENCIAS.md) y la captura histórica [05_actions_summary_correccion_8c094dd.png](evidence/appsec/05_actions_summary_correccion_8c094dd.png).

## 2:25–4:10 · DAST y respuesta HTTP

“En la línea base se exponía la versión de Nginx y faltaban X-Frame-Options y X-Content-Type-Options. El riesgo de clickjacking se clasificó medio y la divulgación de versión, baja. Endurecimos Nginx y repetimos la consulta local: respondió HTTP 200, sin la versión, con CSP, X-Frame-Options DENY, nosniff y las políticas adicionales.”

Mostrar la comparación de la diapositiva y el registro [REVALIDACION_HEADERS_LOCAL.txt](evidence/appsec/REVALIDACION_HEADERS_LOCAL.txt). Aclarar: “Esto valida las cabeceras manualmente; no es un reporte ZAP. Falta ejecutar OWASP ZAP Baseline en staging y guardar HTML/JSON. HSTS se debe validar con HTTPS.”

## 4:10–4:45 · Cierre

“Corregimos el código y la configuración, y comprobamos localmente la sintaxis y las cabeceras. Para cerrar la validación, Semgrep, Gitleaks, Dependabot y ZAP deben corresponder al mismo commit. Code Breaker está resuelto aparte: recuperamos BREAKER#2026 y validamos la bandera al ejecutar el binario.”

Mostrar [ESTADO_REVALIDACION.md](evidence/appsec/ESTADO_REVALIDACION.md). Si solicitan la actividad, abrir [REPORTE_CODEBREAKER.md](REPORTE_CODEBREAKER.md).

## Antes de presentar

- Ejecutar Semgrep y guardar un resultado sin error de parseo.
- Guardar el resumen Gitleaks del mismo commit.
- Revisar Dependabot Alerts después de publicar la configuración.
- Ejecutar ZAP Baseline en staging y guardar HTML/JSON.
- Tener abierta la evidencia de ejecución de Code Breaker.
