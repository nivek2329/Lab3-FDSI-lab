# Informe técnico de hallazgos

**Proyecto:** NetOps Secure Execution Portal  
**Integrantes:** Kevin Andrey Ángel Acevedo (Blue Team), Sergio Daniel Buitrago Suancha (Red Team), Daniel Julian Peña Bonilla (Red Team)  
**Repositorio / commit:** https://github.com/nivek2329/Lab3-FDSI-lab / `2405de0ca3b06d246af81c63e893b4e9daac7026`  
**Entorno autorizado:** Repositorio propio y staging de laboratorio autorizado (`http://localhost:8080`)  
**Fecha:** 21 de Octubre de 2026  

---

## Resumen ejecutivo
Durante la evaluación de seguridad del portal **NetOps Secure Execution Portal**, se integraron herramientas automáticas de análisis estático (Semgrep, CodeQL), detección de secretos (Gitleaks), análisis de composición de software (Dependabot) y evaluación dinámica (OWASP ZAP). Se identificaron tres riesgos principales:

1. **Ausencia de Cabeceras de Seguridad HTTP (CWE-693 / OWASP A05:2021):** El servidor Nginx y las páginas web no emitían directivas de protección contra Clickjacking (`X-Frame-Options`), Cross-Site Scripting (`Content-Security-Policy`), ni forzado de transporte seguro (`HSTS`).
2. **Divulgación de Versión del Servidor Web (CWE-200 / Information Disclosure):** La cabecera `Server` exponía la versión exacta de Nginx y del sistema operativo base, facilitando el reconocimiento a posibles atacantes.
3. **Referencias Mutables en Flujos de CI/CD (CWE-829 / Supply Chain Security):** Los flujos de GitHub Actions empleaban tags flotantes en lugar de hashes inmutables SHA-1, exponiendo el pipeline a riesgos de sustitución de dependencias.

Se procedió a la remediación integral del hallazgo principal y de divulgación de información mediante el endurecimiento de la configuración del servidor web Nginx y la inserción de directivas de defensa en profundidad en los archivos HTML. La efectividad de la corrección fue validada mediante pruebas de regresión y reescaneo automatizado.

---

## Metodología
La auditoría se ejecutó bajo un modelo estructurado DevSecOps y pruebas éticas autorizadas:
$$\text{Alcance y Línea Base} \longrightarrow \text{SAST} \longrightarrow \text{Secret Scanning} \longrightarrow \text{SCA} \longrightarrow \text{DAST Pasivo} \longrightarrow \text{Validación Manual} \longrightarrow \text{Remediación} \longrightarrow \text{Reescaneo}$$

---

## Hallazgo F-01
- **Título:** Ausencia de Cabeceras de Seguridad HTTP (Security Misconfiguration)
- **Categoría OWASP/CWE:** OWASP Top 10:2021 — A05: Security Misconfiguration / CWE-693: Protection Mechanism Failure / CWE-1021: Improper Restriction of Rendered UI Layers or Frames.
- **Severidad y justificación:** **Medio (CVSS 5.4)**. La ausencia de `X-Frame-Options` permite que cualquier sitio web malicioso incruste el portal en un `<iframe>` para engañar a los operadores de red y capturar clics no deseados (Clickjacking). La falta de `Content-Security-Policy` no restringe los orígenes de ejecución de scripts.
- **Evidencia minimizada, sin credenciales ni datos personales:**
  Inspección de cabeceras HTTP de respuesta:
  ```http
  HTTP/1.1 200 OK
  Server: nginx/1.24.0 (Ubuntu)
  Date: Wed, 21 Oct 2026 17:00:00 GMT
  Content-Type: text/html
  Content-Length: 3120
  Connection: keep-alive
  ```
- **Impacto en confidencialidad, integridad o disponibilidad:** 
  - **Integridad:** Un atacante podría manipular la interacción del usuario mediante interfaces superpuestas.
  - **Confidencialidad:** Mayor exposición a robo de tokens o intercepción de sesiones en contextos donde se agregue autenticación futura.
- **Pasos de validación segura en entorno propio:**
  1. Ejecución de `curl -I http://localhost:8080/` para auditar cabeceras recibidas.
  2. Creación de una página local de prueba con un `<iframe>` apuntando a la URL del portal; se comprobó que el navegador renderizaba la interfaz sin ningún bloqueo.
- **Corrección (commit / pull request):**
  Se incorporaron directivas de seguridad en `nginx/netops-portal.conf`:
  ```nginx
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  ```
  Asimismo, se incluyeron meta tags equivalentes en las cabeceras `<head>` de los archivos HTML como defensa en profundidad.
- **Resultado del reescaneo:**
  Nueva consulta HTTP:
  ```http
  HTTP/1.1 200 OK
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  ```
  La prueba con iframe en el navegador es bloqueada inmediatamente.

---

## Hallazgo F-02
- **Título:** Divulgación de Información de Software y Versión del Servidor Web
- **Categoría OWASP/CWE:** OWASP Top 10:2021 — A05: Security Misconfiguration / CWE-200: Exposure of Sensitive Information to an Unauthorized Actor.
- **Severidad y justificación:** **Bajo (CVSS 3.1)**. Divulgar la versión exacta del servidor permite a un atacante identificar exploits públicos y vulnerabilidades específicas de dicha versión (CVEs conocidos) sin necesidad de escaneo intrusivo.
- **Evidencia minimizada, sin credenciales ni datos personales:**
  Respuesta del servidor previa a la corrección:
  `Server: nginx/1.24.0 (Ubuntu)`
- **Impacto en confidencialidad, integridad o disponibilidad:**
  - **Confidencialidad:** Fuga innecesaria de metadatos de infraestructura.
- **Pasos de validación segura en entorno propio:**
  Envío de petición HTTP tipo HEAD:
  `curl -s -I http://localhost:8080/ | grep -i "server:"`
- **Corrección (commit / pull request):**
  Se configuró la directiva `server_tokens off;` dentro del bloque `server` de Nginx:
  ```nginx
  server_tokens off;
  ```
- **Resultado del reescaneo:**
  La cabecera ahora solo reporta la firma genérica sin detalles de versión ni sistema operativo:
  `Server: nginx`

---


---

## Hallazgo F-03
- **Título:** Uso de Referencias Mutables en Acciones de CI/CD (Supply Chain Security)
- **Categoría OWASP/CWE:** OWASP Top 10:2021 — A06: Vulnerable and Outdated Components / CWE-829: Inclusion of Functionality from Untrusted Control Sphere.
- **Severidad y justificación:** **Medio (Semgrep: WARNING / CVSS 4.5)**. El uso de tags mutables (@v4, @v5) en acciones de GitHub (ctions/checkout@v4, ctions/upload-artifact@v4, etc.) permite que un tercero malicioso que comprometa la cuenta del autor de la acción redirija el tag a un commit malicioso, inyectando código en el runner de compilación.
- **Evidencia identificada por el escáner SAST (Semgrep):**
  Regla: yaml.github-actions.security.github-actions-mutable-action-tag (6 ocurrencias detectadas):
  1. .github/workflows/dast-staging.yml (Línea 33): uses: actions/upload-artifact@v4
  2. .github/workflows/seguridad-estatica.yml (Línea 14): uses: actions/checkout@v4
  3. .github/workflows/seguridad-estatica.yml (Línea 15): uses: actions/setup-python@v5
  4. .github/workflows/seguridad-estatica.yml (Línea 24): uses: actions/upload-artifact@v4
  5. .github/workflows/seguridad-estatica.yml (Línea 33): uses: actions/checkout@v4
  6. .github/workflows/seguridad-estatica.yml (Línea 37): uses: gitleaks/gitleaks-action@v3
- **Impacto en confidencialidad, integridad o disponibilidad:**
  - **Integridad:** Ejecución no autorizada de comandos en el pipeline CI/CD si la dependencia aguas arriba es vulnerada.
- **Pasos de validación en entorno propio:**
  Auditoría estática mediante Semgrep:
  semgrep scan --config p/owasp-top-ten --json --output semgrep.json
- **Recomendación y medida correctiva:**
  Fijar las referencias a hashes inmutables SHA-1 de 40 caracteres (ej. uses: actions/checkout@8ade135a...) y activar permisos de mínimo privilegio en el token del workflow (permissions: contents: read).

## Reflexión final
1. **Alcance y límites de las herramientas automáticas:**
   - **Semgrep** demostró ser una herramienta excepcionalmente ágil para detectar riesgos estáticos de infraestructura como código (IaC) y patrones de seguridad en flujos CI/CD (`.github/workflows`), completando su análisis en pocos segundos.
   - **Gitleaks** asegura que ningún secreto accidental contamine el historial público del proyecto.
   - **OWASP ZAP** y la validación dinámica manual permitieron evidenciar problemas en tiempo de ejecución (cabeceras HTTP) que el análisis estático puro no siempre correlaciona con el servidor web en producción.
   
2. **Lecciones aprendidas:**
   - La seguridad debe implementarse desde el diseño (*Shift-Left*), verificando tanto el código de la aplicación como los archivos de configuración del servidor y los flujos de integración continua.
   - La combinación de SAST + SCA + DAST proporciona una visibilidad holística del estado de seguridad del proyecto.
