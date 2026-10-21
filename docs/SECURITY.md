# Seguridad del proyecto — evidencia del laboratorio

## 1. Alcance autorizado
- **Repositorio:** https://github.com/nivek2329/Lab3-FDSI-lab
- **Rama evaluada y commit base:** `laboratorio-4` / `2405de0ca3b06d246af81c63e893b4e9daac7026`
- **Rama de trabajo del laboratorio:** `security/lab-fsi`
- **Proyecto:** NetOps Secure Execution Portal (HTML/CSS/JS + Nginx)
- **Tecnología:** Servidor web Nginx, Frontend HTML5/CSS3/JavaScript vanilla, CI/CD GitHub Actions
- **Responsables / autorización:** Kevin Andrey Ángel Acevedo (Blue Team), Sergio Daniel Buitrago Suancha (Red Team), Daniel Julian Peña Bonilla (Red Team) — Grupo G06, Fundamentos de Seguridad de la Información (FDSI) 2026-2.
- **URL de staging propio (si aplica):** Staging local en contenedor / servidor de pruebas aislado en entorno no productivo (`http://localhost:8080`).
- **Fuera de alcance:** Sistemas de producción, servicios de terceros, infraestructura institucional no autorizada, credenciales reales, ataques de denegación de servicio (DoS/DDoS) y pruebas destructivas.

## 2. Línea base y herramientas
| Herramienta | Tipo | Fecha | Resultado | Enlace a evidencia |
|---|---|---|---|---|
| Semgrep (SAST) | SAST | 2026-10-21 | 6 advertencias detectadas (reglas `p/owasp-top-ten`, `p/secrets`, tags mutables de supply chain) | [semgrep.json](file:///semgrep.json) / Workflow Action |
| Gitleaks | Secretos | 2026-10-21 | Escaneo de historial Git (fetch-depth: 0); mitigación de exposición de credenciales | Workflow `seguridad-estatica.yml` |
| Dependabot | SCA | 2026-10-21 | Configurado en Settings del repositorio; monitoreo de componentes de terceros | Pestaña Security → Dependabot alerts |
| OWASP ZAP Baseline | DAST pasivo | 2026-10-21 | Identificación de cabeceras de seguridad faltantes (CSP, X-Frame-Options, X-Content-Type-Options) y fuga de versión de Nginx | Workflow `dast-staging.yml` / Informe ZAP |

### Evidencia de Workflows de Seguridad en GitHub Actions
![Workflows exitosos de Semgrep y Gitleaks](evidence/appsec/03_github_actions_workflows_verdes.png)

## 3. Hallazgos y gestión
| ID | Categoría | Descripción sin secretos | Riesgo | Archivo/ruta | Cambio propuesto | Estado |
|---|---|---|---|---|---|---|
| F-01 | A05: Security Misconfiguration | Ausencia de cabeceras de seguridad HTTP esenciales (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy) | Medio | `nginx/netops-portal.conf`, `app/*.html` | Configurar directivas `add_header` en Nginx y meta tags en HTML | Corregido |
| F-02 | A06: Vulnerable and Outdated Components | Uso de referencias mutables de acciones en GitHub Actions (`@v4`, `@v5`) susceptible a ataques de cadena de suministro | Bajo | `.github/workflows/seguridad-estatica.yml`, `.github/workflows/dast-staging.yml` | Fijar dependencias o restringir permisos de workflow | En seguimiento |
| F-03 | A05: Information Disclosure | Divulgación de información de versión del servidor web Nginx mediante cabecera `Server` (`server_tokens on`) | Bajo | `nginx/netops-portal.conf` | Deshabilitar directiva `server_tokens off;` | Corregido |

## 4. Validación antes y después
- **Evidencia inicial (captura o artefacto):**
  - Análisis SAST (`semgrep.json`): Generado como artefacto del pipeline con 6 alertas asociadas a seguridad de pipelines y buenas prácticas.
  - Petición HTTP inicial: `curl -I http://localhost:8080/`
    ```http
    HTTP/1.1 200 OK
    Server: nginx/1.24.0 (Ubuntu)
    Content-Type: text/html
    (Ausencia de Content-Security-Policy)
    (Ausencia de X-Frame-Options)
    (Ausencia de X-Content-Type-Options)
    (Ausencia de Strict-Transport-Security)
    ```
- **Pull request con corrección:**
  - Rama `security/lab-fsi` hacia `laboratorio-4`.
  - Commits de remediación: endurecimiento de `nginx/netops-portal.conf` y páginas de la aplicación.
  - Validación de pipelines aprobada (4 checks en verde):
    
    ![Validación de Checks en Pull Request](evidence/appsec/01_pull_request_all_checks_passed.png)
- **Evidencia de reescaneo:**
  - Petición HTTP post-remediación: `curl -I http://localhost:8080/`
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
  - Reejecución de workflows en GitHub Actions y reescaneo pasivo sin advertencias de configuración básica.
- **Riesgo residual y decisión:**
  - El portal opera con arquitectura estática y mockups de red seguros. Con las cabeceras aplicadas y la supresión de versión, el riesgo residual se sitúa en nivel BAJO, aceptable para entorno de laboratorio y demostración.

## 5. Pentest autorizado
- **Hipótesis:** La aplicación web NetOps Portal carece de defensas perimetrales a nivel de cabeceras HTTP, lo que permite la incrustación maliciosa en iframes (Clickjacking - CWE-1021) y ejecución no autorizada de contenido (falta de CSP - CWE-693).
- **Entorno de pruebas aislado:** Servidor local / staging de laboratorio `http://localhost:8080/` en red privada virtual.
- **Solicitudes inocuas y respuestas observadas (sin datos personales):**
  1. *Clickjacking Proof of Concept:* Se elaboró un archivo HTML inocuo `iframe-test.html` conteniendo `<iframe src="http://localhost:8080/simulate.html"></iframe>`. En el estado inicial, la página cargó sin restricciones, confirmando vulnerabilidad a Clickjacking.
  2. *Banner Grabbing:* Se ejecutó `curl -I http://localhost:8080/`, observando la cabecera `Server: nginx/1.24.0 (Ubuntu)`.
- **Resultado:** VALIDADO. Ambos vectores fueron reproducibles de manera inocua y controlada.
- **Recomendación y prueba de regresión:**
  - Aplicar `add_header X-Frame-Options "DENY"` en Nginx para bloquear incrustaciones no autorizadas.
  - Implementar `server_tokens off;` para eliminar la divulgación de versión.
  - Prueba de regresión: Al reejecutar la prueba con el iframe, el navegador bloquea la carga con el error `Refused to display in a frame because it set 'X-Frame-Options' to 'deny'`.
