# Registro de Riesgos — Laboratorio 3

## Grupo G06: Daniel Julián Peña Bonilla · Kevin Andrey Ángel Acevedo · Sergio Daniel Buitrago Suancha | FDSI 2026-2

| ID | Amenaza STRIDE | Descripción | Impacto | Probabilidad | Estado | Evidencia | Acción Lab 4 / Solución Aplicada |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|
| **R01** | Information Disclosure | HTTP transmite inventario y scripts en texto claro; cualquier observador en la red puede leer el contenido | Alto | Alta | **Pendiente Lab 4** | PCAP muestra contenido legible (`evidence/blue/lab3-http.pcap`) | Implementar HTTPS con certificado TLS en Lab 4 |
| **R02** | Information Disclosure | Headers de respuesta y escaneos de servicio revelaban tecnología y versión exacta del servidor (`nginx 1.18.0 (Ubuntu)`) | Medio | Alta | **Mitigado** | Nmap y `curl -I` antes/después (`evidence/retest/nmap_port80.nmap`, captura `evidence/retest/retest_evidencias_hardening.png`) | Directiva `server_tokens off;` aplicada en Nginx para suprimir versión y OS |
| **R03** | Spoofing | Sin autenticación, cualquier usuario puede acceder al portal y simular ejecuciones de scripts | Alto | Alta | **Pendiente Lab 4** | Acceso anónimo verificado (`evidence/red/curl_home.txt`, `curl_simulate.txt`) | Implementar autenticación robusta, sesiones y tokens anti-CSRF |
| **R04** | Repudiation | Sin correlación temporal robusta ni identidad autenticada, difícil atribuir quién realizó cada consulta | Medio | Media | **Mitigado parcialmente** | Comparación `access.log` vs comandos de ataque (`evidence/blue/access_log_correlation.txt`) | Centralización de logs de auditoría vinculados a identidad de usuario |
| **R05** | Tampering | Sin TLS, un atacante intermediario (MITM) podría alterar el inventario o scripts en tránsito | Alto | Media | **Pendiente Lab 4** | Ausencia de cifrado e integridad demostrada en tráfico HTTP | Adopción de HTTPS + verificación de integridad mediante checksums |
| **R06** | Elevation of Privilege | Sin control de roles, todos los usuarios anónimos tienen el mismo nivel de acceso que un operador | Alto | Alta | **Pendiente Lab 4** | Navegación directa a `simulate.html` sin credenciales ni autorización | Implementación de Control de Acceso Basado en Roles (RBAC) |
| **R07** | Denial of Service | Sin rate limiting, un atacante podría saturar el servicio web mediante ráfagas HTTP | Medio | Baja | **Aceptado** | No se ejecutó DoS (alcance académico controlado y ético) | Rate limiting y WAF previstos para Lab 5/6 (`limit_req_zone`) |
| **R08** | Information Disclosure | Archivos y rutas ocultas (`/.git/config`, `/.env`) exponían la estructura interna del repositorio y código fuente | Medio | Media | **Corregido** | `curl /.git/config` retorna HTTP 403 (`evidence/retest/hidden_path.txt`, captura `evidence/retest/retest_evidencias_hardening.png`) | Directiva Nginx: `location ~ /\. { deny all; return 403; }` |
| **R09** | Information Disclosure | Exposición pública de direccionamiento IP de gestión interno (`10.0.X.X`), versiones de SO y ubicaciones de red | Alto | Alta | **Corregido** | Archivo sanitizado (`app/public-inventory.txt`, captura `evidence/retest/retest_evidencias_hardening.png`) | Política de mínima exposición: disociación de catálogo público de equipos |

---

## Resumen de Estados
- **Corregidos:** 2 (R08, R09)
- **Mitigados:** 2 (R02, R04)
- **Aceptados:** 1 (R07)
- **Pendientes Lab 4:** 4 (R01, R03, R05, R06)

---

## Análisis Técnico de la Vulnerabilidad de Versión: Nginx 1.18.0 (Ubuntu)

### 1. Vector de Ataque: Fuga de Información (Banner Grabbing)
En la fase de reconocimiento ofensivo, herramientas automatizadas como Nmap y curl capturan metadatos expuestos por el servidor en texto plano:
- **Banner detectado originalmente:** `Server: nginx/1.18.0 (Ubuntu)` y en escaneo de servicio Nmap `80/tcp open http nginx 1.18.0 (Ubuntu)`.
- **Riesgo asociado (CWE-200):** La divulgación de la versión exacta reduce drásticamente el tiempo de reconocimiento de un atacante, quien ya no necesita realizar sondeos a ciegas, sino que puede consultar directamente bases de datos públicas de vulnerabilidades (NVD, Exploit-DB) para seleccionar exploits dirigidos.
- **Exposición del Sistema Operativo (`Ubuntu`):** Revela las convenciones del sistema de archivos (`/etc/nginx/`, `/var/log/nginx/`, `/var/www/`), usuario por defecto (`www-data`) y versiones de bibliotecas del sistema (OpenSSL, glibc) asociadas a los paquetes de Ubuntu 20.04 LTS.

### 2. Vulnerabilidades Conocidas (CVEs) Asociadas a Nginx 1.18.0
1. **CVE-2021-23017 (CVSS 7.7 / 9.8 en escenarios con DNS dinámico):**
   - *Descripción:* Desbordamiento de búfer de 1 byte en el resolver DNS de Nginx (`ngx_resolver.c`) al procesar respuestas DNS malformadas.
   - *Impacto:* Caída del worker (Denegación de Servicio) o potencial ejecución remota de código (RCE) bajo condiciones específicas de memoria.
2. **CVE-2021-3618 (CVSS 7.4 - Ataque ALPACA):**
   - *Descripción:* Vulnerabilidad de confusión de protocolos de capa de aplicación (Application-Layer Protocol Confusion) que explota servidores web y de correo que comparten certificados TLS/SNI.
3. **CVE-2022-41741 (CVSS 7.8) y CVE-2022-41742 (CVSS 7.1):**
   - *Descripción:* Corrupción de memoria en heap y divulgación de fragmentos de memoria en el módulo `ngx_http_mp4_module` al procesar archivos multimedia malformados.
4. **CVE-2023-44487 (CVSS 7.5 - HTTP/2 Rapid Reset):**
   - *Descripción:* Abuso masivo de peticiones concurrentes y cancelaciones inmediatas de flujo (`RST_STREAM`) que satura la CPU del servidor.

### 3. Solución Técnica Implementada y Verificación Gráfica
- **Control Aplicado:** Incorporación de la directiva `server_tokens off;` en el bloque `server` de Nginx ([netops-portal.conf](file:///C:/Users/Daniel/.gemini/antigravity/scratch/Lab3-FDSI-lab/nginx/netops-portal.conf)).
- **Efecto Inmediato:**
  - El header HTTP se transforma a `Server: nginx` (sin número de versión ni distribución de SO).
  - Las páginas de error estándar (403, 404, 500) omiten la versión del servidor en el pie de página.
  - El escaneo de servicio de Nmap (`nmap -sV -p 80`) únicamente reporta `80/tcp open http nginx`, sin versión en texto plano.
- **Evidencia Gráfica Reproducible:**
  Consultar la captura de validación en [retest_evidencias_hardening.png](file:///C:/Users/Daniel/.gemini/antigravity/scratch/Lab3-FDSI-lab/evidence/retest/retest_evidencias_hardening.png) y el reporte [evidence/retest/README.md](file:///C:/Users/Daniel/.gemini/antigravity/scratch/Lab3-FDSI-lab/evidence/retest/README.md).
