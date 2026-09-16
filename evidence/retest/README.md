# Evidencias de Retest — Fase F (Purple Team)

## Contexto
Validación técnica reproducible ejecutada tras aplicar el hardening en Nginx (Fase E).

## Comandos y Resultados

### 1. Verificación de Banners y Versión del Servidor (Nmap)
- **Comando:** `nmap -Pn -sV -p 80 127.0.0.1 -oA evidence/retest/nmap_port80`
- **Resultado antes:** `80/tcp open http nginx 1.18.0 (Ubuntu)`
- **Resultado después:** `80/tcp open http nginx`
- **Conclusión:** Se confirmó que `server_tokens off;` oculta satisfactoriamente la versión del software y la distribución del sistema operativo, reduciendo el riesgo de Information Disclosure.

### 2. Verificación de Cabeceras de Seguridad HTTP (curl -I)
- **Comando:** `curl -I http://127.0.0.1/`
- **Resultado antes:** Ausencia de headers de protección. Header `Server: nginx/1.18.0 (Ubuntu)`.
- **Resultado después:** Inclusión de:
  - `X-Content-Type-Options: nosniff` (previene MIME sniffing).
  - `X-Frame-Options: DENY` (mitiga Clickjacking).
  - `Referrer-Policy: no-referrer` (evita fuga de metadatos de navegación).
- **Conclusión:** Cabeceras inyectadas de forma global para mitigar vectores pasivos señalados por OWASP ZAP.

### 3. Verificación de Denegación de Archivos Ocultos (curl -i)
- **Comando:** `curl -i http://127.0.0.1/.git/config`
- **Resultado antes:** `HTTP/1.1 200 OK` (exposición del repositorio git y estructura del proyecto).
- **Resultado después:** `HTTP/1.1 403 Forbidden`.
- **Conclusión:** Regla `location ~ /\. { deny all; return 403; }` operando con éxito.
