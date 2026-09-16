# Evidencia de Uso Responsable de IA — Laboratorio 3 FDSI

## Directiva de Cumplimiento (Sección 7 del Laboratorio)
La Inteligencia Artificial se utilizó exclusivamente como un copiloto analítico de asistencia, sin delegar autoridad técnica. Cada afirmación, hipótesis y correlación fue verificada manualmente por los integrantes del equipo contra los comandos ejecutados, los archivos PCAP y los registros de Nginx.

---

## 1. Prompt Anonimizado Suministrado a la IA

```text
Prompt: Analiza estos eventos Nginx anonimizados:
127.0.0.1 - - [16/Sep/2026:15:15:05 +0000] "GET / HTTP/1.0" 200 3095 "-" "Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)"
127.0.0.1 - - [16/Sep/2026:15:16:00 +0000] "GET / HTTP/1.1" 200 3095 "-" "curl/7.81.0"
127.0.0.1 - - [16/Sep/2026:15:16:15 +0000] "HEAD /public-inventory.txt HTTP/1.1" 200 0 "-" "curl/7.81.0"
127.0.0.1 - - [16/Sep/2026:15:17:10 +0000] "GET /admin HTTP/1.1" 404 153 "-" "curl/7.81.0"
127.0.0.1 - - [16/Sep/2026:15:17:12 +0000] "GET /api/config HTTP/1.1" 404 153 "-" "curl/7.81.0"
127.0.0.1 - - [16/Sep/2026:15:17:13 +0000] "GET /backup.sql HTTP/1.1" 404 153 "-" "curl/7.81.0"
127.0.0.1 - - [16/Sep/2026:15:18:13 +0000] "GET /.git/config HTTP/1.1" 200 112 "-" "curl/7.81.0"

Construye una línea de tiempo, separa hechos de inferencias, mapea cada observación a STRIDE, propone tres hipótesis defensivas y señala qué evidencia adicional falta. No inventes IP, CVE ni acciones ejecutadas.
```

---

## 2. Respuesta Generada por el Modelo de IA

### A. Hechos Observables (Datos fácticos del log)
1. A las 15:15:05 UTC, se recibió una petición `GET /` con User-Agent correspondiente al motor de scripts de Nmap (NSE), respondida con HTTP 200.
2. A las 15:16:00 y 15:16:15 UTC, se realizaron peticiones `GET /` y `HEAD /public-inventory.txt` utilizando curl.
3. Entre las 15:17:10 y 15:17:13 UTC, se generaron tres peticiones a rutas inexistentes (`/admin`, `/api/config`, `/backup.sql`), todas recibiendo HTTP 404.
4. A las 15:18:13 UTC, se solicitó la ruta sensible `/.git/config`, la cual fue entregada exitosamente con código HTTP 200 y tamaño de 112 bytes.

### B. Inferencias de la IA
- El cliente realizó un escaneo automatizado estructurado en etapas: primero reconocimiento de servicio, luego recolección de metadatos, seguido de enumeración forzada (fuzzing) y finalmente intento de acceso a configuración de control de versiones.
- La IP `127.0.0.1` corresponde al host local en el ambiente de pruebas.

### C. Mapeo a Categorías STRIDE
- `GET /` (NSE): **Information Disclosure** (reconocimiento de tecnologías).
- `HEAD /public-inventory.txt`: **Information Disclosure** (verificación de existencia de recursos).
- Secuencia de 404s: **Information Disclosure / Tampering** (intento de descubrimiento de endpoints no publicados).
- `GET /.git/config` (200 OK previo al hardening): **Information Disclosure** (exposición de metadatos del repositorio).

### D. Hipótesis Defensivas Propuestas
1. *Hipótesis 1:* La exposición de `/.git/config` permite a un actor externo reconstruir el historial de commits.
2. *Hipótesis 2:* El patrón de múltiples 404s en pocos segundos indica el uso de un diccionario de rutas de ataque.
3. *Hipótesis 3:* El servidor carece de una regla general que restrinja el acceso a archivos de configuración ocultos.

### E. Evidencia Adicional Faltante
- Falta telemetría de red a nivel de firewall (UFW/iptables) para determinar si hubo escaneo SYN previo.
- Faltan logs de integridad de archivos para auditar accesos en profundidad.

---

## 3. Validación Humana y Detección de Alucinaciones

| Afirmación / Inferencia de la IA | Validación Humana | Clasificación |
| :--- | :--- | :---: |
| "El código 200 en `/.git/config` demuestra exposición del repositorio." | **Confirmado:** Al revisar la configuración de Nginx previa al hardening, no existía regla `deny all` para archivos que inician con punto. | **Hecho Válido** |
| "El atacante probablemente descargó claves privadas SSH y tokens de API de producción alojados en el archivo `.git/config`." | **Alucinación:** Al inspeccionar manualmente el archivo `/.git/config` del entorno de laboratorio, este únicamente contenía metadatos ficticios del branch `main` y URL local, sin ninguna credencial real ni clave privada. | **Alucinación Detectada** |
| "Las peticiones 404 representan un ataque de denegación de servicio distribuido (DDoS)." | **Alucinación de Severidad:** La ráfaga provino de una sola IP local en una prueba controlada de 3 peticiones, lo que corresponde a enumeración manual/fuzzing leve, no a un ataque de saturación volumétrica o DDoS. | **Alucinación Detectada** |
| "La regla defensiva debe bloquear permanentemente la IP que genere un 404." | **Rechazado:** Bloquear con un único 404 generaría falsos positivos masivos para usuarios legítimos que escriben mal una URL. Se calibró la regla a 5 respuestas 404 en 5 minutos. | **Corrección Técnica** |
