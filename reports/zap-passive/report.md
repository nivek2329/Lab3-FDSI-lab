# Reporte de Escaneo Pasivo (OWASP ZAP)

## Resumen del Escaneo
- **Target:** `http://127.0.0.1/`
- **Herramienta:** OWASP ZAP 2.13.0 (Modo Pasivo)
- **Fecha:** 2026-09-16
- **Contexto:** Escaneo ejecutado antes y verificado después de aplicar el hardening en Nginx.

---

## Alertas Identificadas (Pasivas) y Estado de Mitigación

### 1. Ausencia de Anti-CSRF Tokens (Riesgo: Bajo)
- **Descripción:** Ningún formulario HTML incluye tokens contra Cross-Site Request Forgery.
- **Rutas afectadas:** `/simulate.html`
- **Mitigación:** Límite pedagógico — Se implementará protección anti-CSRF, sesiones y autenticación en el Laboratorio 4.
- **Estado:** **Pendiente Lab 4**

### 2. X-Frame-Options Header Missing (Riesgo: Medio)
- **Descripción:** El servidor no incluyó la cabecera `X-Frame-Options`, permitiendo potenciales ataques de Clickjacking o incrustación en iframes maliciosos.
- **Evidencia Inicial:** Ausente en la respuesta HTTP baseline.
- **Mitigación:** Inclusión de `add_header X-Frame-Options "DENY" always;` en el bloque `server` de Nginx.
- **Estado (Retest):** **Corregido** (verificado en `evidence/retest/headers_after.txt`).

### 3. X-Content-Type-Options Header Missing (Riesgo: Bajo)
- **Descripción:** La ausencia de `nosniff` permite que navegadores antiguos o vulnerables interpreten respuestas con tipos MIME incorrectos (MIME Sniffing).
- **Mitigación:** Inclusión de `add_header X-Content-Type-Options "nosniff" always;`.
- **Estado (Retest):** **Corregido** (verificado en `evidence/retest/headers_after.txt`).

### 4. Server Leaks Version Information — Information Disclosure (Riesgo: Medio)
- **Descripción:** El servidor divulgaba en texto claro su identidad tecnológica completa: `Server: nginx/1.18.0 (Ubuntu)` y en escaneos de servicio de Nmap `80/tcp open http nginx 1.18.0 (Ubuntu)`.
- **Vectores de Riesgo:** Exposición a ataques dirigidos según la base de datos de CVEs (p. ej. CVE-2021-23017, CVE-2021-3618, CVE-2022-41741/42, CVE-2023-44487).
- **Mitigación:** Configuración de `server_tokens off;` en Nginx.
- **Estado (Retest):** **Mitigado / Corregido** — Nmap y curl confirman que el banner se redujo a la firma genérica `Server: nginx` sin versión ni distribución del sistema operativo (`evidence/retest/nmap_port80.nmap` y `headers_after.txt`).

---

*(Nota: Este reporte sintetiza los hallazgos pasivos del escaneo, correlacionándolos directamente con el registro de riesgos y las evidencias reproducibles del retest).*
