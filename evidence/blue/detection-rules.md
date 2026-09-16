# Reglas de Detección — Blue Team | Laboratorio 3

## Responsable: Kevin Andrey Ángel Acevedo (Blue Team)

---

## Regla 1: Escaneo de rutas (múltiples 404)

**Descripción:** Detectar cuando una misma IP genera 5 o más respuestas HTTP 404 en un periodo de 5 minutos, lo cual puede indicar enumeración de directorios o fuzzing.

**Comando de detección:**
```bash
sudo awk '$9 ~ /404/ {print $1, $4, $7, $9}' /var/log/nginx/netops-access.log | sort | uniq -c | sort -nr | head
```

**Limitaciones:**
- No distingue entre errores de usuarios legítimos que siguen enlaces rotos y escaneo malicioso.
- Depende de la rotación y ventana de tiempo del archivo de log.
- Es una regla reactiva: detecta pero no mitiga ni bloquea automáticamente la IP origen.

**Falsos positivos posibles:**
- Usuarios navegando enlaces obsoletos o recursos eliminados recientemente.
- Crawlers de motores de búsqueda que indexan URLs inexistentes.
- Errores en enlaces internos de la propia aplicación.

---

## Regla 2: Detección de herramientas de reconocimiento

**Descripción:** Identificar User-Agents conocidos de herramientas automáticas de escaneo (Nmap, curl, ZAP, Nikto, Gobuster).

**Comando de detección:**
```bash
sudo grep -E 'nmap|curl|ZAP|nikto|gobuster|dirb' /var/log/nginx/netops-access.log | tail -n 30
```

**Limitaciones:**
- Un atacante con experiencia puede falsificar fácilmente la cabecera `User-Agent` (ej. `curl -A "Mozilla/5.0..."`).
- `curl` es utilizado comúnmente en scripts legítimos de monitoreo y health checks.

---

## Regla 3: Acceso a rutas sensibles y dotfiles

**Descripción:** Detectar intentos de acceso a archivos ocultos de configuración del sistema o repositorios (`.git`, `.env`, backups).

**Comando de detección:**
```bash
sudo grep -E '\.(git|env|htpasswd|htaccess|bak|sql)' /var/log/nginx/netops-access.log
```

---

## Línea de Tiempo Purple Team (Paso 14 Correlacionado)

| Hora UTC | Acción Red Team | Evidencia Blue Team | Conclusión |
| :---: | :--- | :--- | :--- |
| **15:15:05** | `nmap -Pn -sV -p 80 127.0.0.1` | Petición NSE registrada en `netops-access.log` con User-Agent `Mozilla/5.0 (compatible; Nmap Scripting Engine)`. | Diferenciar red vs. aplicación: el escaneo SYN inicial no genera log en Nginx; los scripts NSE sí dejan trazabilidad en la capa de aplicación. |
| **15:16:00** | `curl -i http://127.0.0.1/` | Registro `GET / HTTP/1.1` código 200 con User-Agent `curl/7.81.0` en `access.log`. | Correlación confirmada. El atacante obtiene el banner `nginx/1.18.0 (Ubuntu)` antes del hardening. |
| **15:16:15** | `curl -I http://127.0.0.1/public-inventory.txt` | Solicitud HEAD registrada con 200 OK y tráfico en texto plano visible en `lab3-http.pcap`. | Contenido y estructura visibles por HTTP sin protección de integridad ni confidencialidad. |
| **15:17:10 – 15:17:17** | Fuzzing de rutas inexistentes (`/admin`, `/api/config`, `/backup.sql`, etc.) | 5 códigos 404 consecutivos en 7 segundos en `access.log` y errores en `error.log`. | Detección validada mediante la Regla 1 (`awk`). Evidencia de enumeración activa. |
| **15:18:13** | `curl -i http://127.0.0.1/.git/config` (Pre-hardening) | Registro `GET /.git/config` con código **200 OK** en `access.log`. | Fuga crítica de información: repositorio git expuesto al no bloquear dotfiles. |
| **15:20:00 – 15:20:02** | Exploración pasiva con OWASP ZAP | Peticiones registradas con User-Agent `ZAP/2.13.0`. | Telemetría pasiva correlacionada con las alertas de clickjacking y headers faltantes. |
| **15:25:00 – 15:25:05** | Retest tras hardening (`nmap`, `curl -I`, `curl /.git/config`) | Registro `GET /.git/config` con código **403 Forbidden** y headers de seguridad inyectados. | Hardening efectivo: mitigación verificada en el retest sin romper la operatividad del sitio. |
