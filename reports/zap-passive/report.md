# Reporte de Escaneo Pasivo (OWASP ZAP)

## Resumen del Escaneo
- **Target:** `http://127.0.0.1/`
- **Herramienta:** OWASP ZAP 2.13.0 (Modo Pasivo)
- **Fecha:** 2026-09-16
- **Contexto:** Escaneo ejecutado ANTES de aplicar el hardening en Nginx.

## Alertas Identificadas (Pasivas)

### 1. Ausencia de Anti-CSRF Tokens (Riesgo: Bajo)
- **Descripción:** Ningún formulario HTML incluye tokens contra Cross-Site Request Forgery.
- **Rutas afectadas:** `/simulate.html`
- **Mitigación:** Implementar tokens anti-CSRF en el Lab 4.

### 2. X-Frame-Options Header Missing (Riesgo: Medio)
- **Descripción:** El servidor no incluyó el header `X-Frame-Options`, lo que permite ataques de Clickjacking.
- **Evidencia:** Detectado en la respuesta inicial de Nginx.
- **Estado (Retest):** **Corregido** en la Fase E tras añadir `add_header X-Frame-Options "DENY" always;`.

### 3. X-Content-Type-Options Header Missing (Riesgo: Bajo)
- **Descripción:** El servidor no previene ataques de MIME-Sniffing.
- **Estado (Retest):** **Corregido** tras añadir `add_header X-Content-Type-Options "nosniff" always;`.

### 4. Server Leaks Version Information (Riesgo: Bajo)
- **Descripción:** El header `Server` revela `nginx/1.18.0 (Ubuntu)`.
- **Estado (Retest):** **Corregido** tras aplicar `server_tokens off;`.

*(Nota: En lugar del archivo HTML voluminoso de ZAP, este archivo extrae y documenta los hallazgos críticos del escaneo pasivo para alinearse con los objetivos de análisis manual del Lab 3).*
