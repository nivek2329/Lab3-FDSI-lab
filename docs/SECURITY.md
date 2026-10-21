# Seguridad del proyecto — Evidencia del Laboratorio DevSecOps

## 1. Alcance autorizado
- **Repositorio:** [https://github.com/nivek2329/Lab3-FDSI-lab](https://github.com/nivek2329/Lab3-FDSI-lab)
- **Rama evaluada y commit base:** `laboratorio-4` / `2405de0ca3b06d246af81c63e893b4e9daac7026`
- **Ramas de trabajo del laboratorio:** 
  - `security/lab-fsi` (Hardening, configuración DevSecOps y PR #1)
  - `correccion-errores-escaneo` (Mitigación total de advertencias de Supply Chain en GitHub Actions)
- **Proyecto:** NetOps Secure Execution Portal (HTML/CSS/JS + Nginx)
- **Tecnología:** Servidor web Nginx, Frontend HTML5/CSS3/JavaScript vanilla, CI/CD GitHub Actions
- **Responsables / autorización:** Kevin Andrey Ángel Acevedo (Blue Team), Sergio Daniel Buitrago Suancha (Red Team), Daniel Julian Peña Bonilla (Red Team) — Grupo G06, Fundamentos de Seguridad de la Información (FDSI) 2026-2.
- **URL de staging propio:** Staging local en contenedor / servidor de pruebas aislado en entorno no productivo (`http://localhost:8080`).
- **Fuera de alcance:** Sistemas de producción, servicios de terceros, infraestructura institucional no autorizada, credenciales reales, ataques de denegación de servicio (DoS/DDoS) y pruebas destructivas.

---

## 2. Línea base y herramientas
| Herramienta | Tipo | Fecha | Resultado Inicial | Estado Posterior | Enlace a evidencia |
|---|---|---|---|---|---|
| Semgrep (SAST) | SAST | 2026-10-21 | 6 advertencias detectadas (`github-actions-mutable-action-tag`) | **0 hallazgos** (acciones pineadas con SHA-40) | [semgrep.json](file:///semgrep.json) / Capturas PowerShell |
| Gitleaks | Secretos | 2026-10-21 | Escaneo de historial Git (`fetch-depth: 0`) | **0 secretos expuestos** | Workflow `seguridad-estatica.yml` |
| Dependabot | SCA | 2026-10-21 | Monitoreo de componentes activado | **Configurado y activo** | Pestaña Security → Dependabot alerts |
| OWASP ZAP Baseline | DAST pasivo | 2026-10-21 | Cabeceras faltantes (CSP, X-Frame-Options) y Server Tokens | **Cabeceras implementadas** | Workflow `dast-staging.yml` / Informe ZAP |

### Evidencia de Detección en Consola PowerShell (Antes de la Remediación)
![Script PowerShell ejecutando el análisis de semgrep.json](evidence/appsec/07_powershell_script_command.png)
*Figura 1: Comando PowerShell de extracción de hallazgos sobre el archivo `semgrep.json`.*

![Consola PowerShell mostrando las 6 advertencias de Semgrep](evidence/appsec/06_powershell_semgrep_6_warnings.png)
*Figura 2: Consola PowerShell detallando las 6 advertencias de severidad MEDIA sobre acciones mutables.*

---

## 3. Hallazgos y gestión
| ID | Categoría | Descripción sin secretos | Riesgo | Archivo/ruta | Cambio propuesto | Estado |
|---|---|---|---|---|---|---|
| **F-01** | A05: Security Misconfiguration | Ausencia de cabeceras de seguridad HTTP esenciales (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy) | Medio | `nginx/netops-portal.conf`, `app/*.html` | Configurar directivas `add_header` en Nginx y meta tags en HTML | **Corregido** |
| **F-02** | A06: Supply Chain Security | Uso de referencias mutables de acciones en GitHub Actions (`@v4`, `@v5`, `@v3`) susceptible a ataques a la cadena de suministro | Medio (Warning) | `.github/workflows/seguridad-estatica.yml`, `.github/workflows/dast-staging.yml` | Fijar acciones a hashes inmutables SHA-40 | **Corregido** |
| **F-03** | A05: Information Disclosure | Divulgación de información de versión del servidor web Nginx mediante cabecera `Server` (`server_tokens on`) | Bajo | `nginx/netops-portal.conf` | Deshabilitar directiva `server_tokens off;` | **Corregido** |
| **F-04** | A03: Injection (DOM XSS) | Riesgo de Cross-Site Scripting por renderizado sin escape en tabla de auditoría | Medio | `app/audit-log.html` | Implementar función `escapeHTML()` | **Corregido** |

---

## 4. Validación antes y después

### A. Evidencia inicial (Antes de corregir)
- **Análisis SAST (`semgrep.json`):** 6 alertas generadas por uso de tags flotantes en GitHub Actions:
  - `.github/workflows/dast-staging.yml` (Línea 33): `actions/upload-artifact@v4`
  - `.github/workflows/seguridad-estatica.yml` (Líneas 14, 15, 24, 33, 37): `checkout@v4`, `setup-python@v5`, `upload-artifact@v4`, `checkout@v4`, `gitleaks-action@v3`
- **Petición HTTP inicial:** `curl -I http://localhost:8080/`
  ```http
  HTTP/1.1 200 OK
  Server: nginx/1.24.0 (Ubuntu)
  Content-Type: text/html
  (Ausencia de Content-Security-Policy)
  (Ausencia de X-Frame-Options)
  (Ausencia de X-Content-Type-Options)
  (Ausencia de Strict-Transport-Security)
  ```

### B. Pull Request con correcciones y workflows aprobados
- Rama `security/lab-fsi` hacia `laboratorio-4` y rama `correccion-errores-escaneo`.
- Validación de pipelines aprobada (4 checks en verde):

![Validación de Checks en Pull Request](evidence/appsec/01_pull_request_all_checks_passed.png)
*Figura 3: Pull Request #1 con todos los checks de CI/CD aprobados en verde.*

### C. Evidencia de reescaneo (Después de corregir)
- **Petición HTTP post-remediación:** `curl -I http://localhost:8080/`
  ```http
  HTTP/1.1 200 OK
  Server: nginx
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
- **Reejecución de workflows en GitHub Actions:**
  
![Resumen de Actions en rama con correcciones](evidence/appsec/05_actions_summary_correccion_8c094dd.png)
*Figura 4: Flujos de CI/CD ejecutados limpiamente sin advertencias en la rama `correccion-errores-escaneo`.*

---

## 5. Pentest autorizado
- **Hipótesis:** La aplicación web NetOps Portal carece de defensas perimetrales a nivel de cabeceras HTTP, lo que permite la incrustación maliciosa en iframes (Clickjacking - CWE-1021) y ejecución no autorizada de contenido (falta de CSP - CWE-693).
- **Entorno de pruebas aislado:** Servidor local / staging de laboratorio `http://localhost:8080/` en red privada virtual.
- **Solicitudes inocuas y respuestas observadas (sin datos personales):**
  1. *Clickjacking Proof of Concept:* Se elaboró un archivo HTML inocuo conteniendo `<iframe src="http://localhost:8080/"></iframe>`. En el estado inicial, la página cargó sin restricciones, confirmando vulnerabilidad a Clickjacking.
  2. *Banner Grabbing:* Se ejecutó `curl -I http://localhost:8080/`, observando la cabecera `Server: nginx/1.24.0 (Ubuntu)`.
- **Resultado:** VALIDADO. Ambos vectores fueron reproducibles de manera inocua y controlada.
- **Recomendación y prueba de regresión:**
  - Aplicar `add_header X-Frame-Options "DENY"` en Nginx para bloquear incrustaciones no autorizadas.
  - Implementar `server_tokens off;` para eliminar la divulgación de versión.
  - Prueba de regresión: Al reejecutar la prueba con el iframe, el navegador bloquea la carga con el error `Refused to display in a frame because it set 'X-Frame-Options' to 'deny'`.
