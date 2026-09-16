# Análisis STRIDE — Laboratorio 3

## Grupo G06: Daniel Julián Peña Bonilla · Kevin Andrey Ángel Acevedo · Sergio Daniel Buitrago Suancha | FDSI 2026-2

## Modelo de Amenazas

El análisis STRIDE se aplica al portal **NetOps Secure Execution Portal**, un prototipo web que permite consultar inventarios de dispositivos de red y simular la ejecución de scripts aprobados de solo lectura.

### Activos Identificados
1. **Portal web:** Aplicación web estática servida por Nginx.
2. **Inventario de dispositivos de red:** Catálogo público ficticio (`app/public-inventory.txt`).
3. **Catálogo de scripts:** Definiciones y alcance de comandos permitidos (`scripts-catalog.html`).
4. **Simulador de ejecución y registro:** Interfaz de simulación y logs de auditoría (`simulate.html`, `audit-log.html`).
5. **Telemetría y registros del servidor:** `access.log` y `error.log` de Nginx.

---

## Hipótesis STRIDE y Estado

| ID | Categoría STRIDE | Hipótesis Técnica | Método de Validación | Resultado Obtenido | Estado / Mitigación |
|:---:|:---|:---|:---|:---|:---|
| **H1** | **Information Disclosure** | HTTP transmite inventario y scripts en texto claro; un observador pasivo en la red puede capturar todo el tráfico. | Captura PCAP con `tcpdump` filtrada en puerto 80; inspección con Wireshark. | Contenido del inventario y rutas visible en texto plano dentro del PCAP (`evidence/blue/lab3-http.pcap`). | **Pendiente Lab 4** (Requiere HTTPS con TLS para confidencialidad en tránsito). |
| **H2** | **Information Disclosure** | Los headers de respuesta HTTP y escaneos de servicio revelan versión y tecnología (`nginx 1.18.0 (Ubuntu)`), facilitando búsqueda de exploits dirigidos (CVE-2021-23017, CVE-2021-3618, etc.). | `curl -I` y escaneo Nmap `-sV` antes y después del hardening. | Banner inicial exponía versión y OS. Tras `server_tokens off;`, Nmap y curl solo reportan `nginx`. | **Mitigado** (`evidence/retest/nmap_port80.nmap`, `headers_after.txt`). |
| **H3** | **Repudiation** | Sin correlación temporal precisa ni autenticación de usuarios, el equipo no puede atribuir de forma no repudiable quién solicitó cada recurso. | Comparación de timestamps entre comandos Red Team y registros de `access.log`. | Correlación lograda por IP y User-Agent en pruebas controladas, pero insuficiente para no repudio formal sin usuario autenticado. | **Mitigado parcialmente** (`evidence/blue/access_log_correlation.txt`). |
| **H4** | **Tampering** | Sin TLS, un atacante intermediario (MITM) podría interceptar y modificar el inventario o la respuesta de scripts en tránsito sin ser detectado. | Análisis de integridad en canal no seguro; ausencia demostrada de mecanismos de firma o checksums en HTTP. | Se constata que HTTP carece de protección criptográfica nativa de integridad. | **Pendiente Lab 4** (HTTPS + validación de integridad). |
| **H5** | **Spoofing** | Sin mecanismos de autenticación, cualquier usuario anónimo en la red puede asumir el rol de operador y acceder al portal y simulador. | Navegación directa desde Kali hacia `/index.html` y `/simulate.html` sin solicitar credenciales. | Acceso irrestricto sin autenticación. | **Pendiente Lab 4** (Autenticación, sesiones y tokens). |
| **H6** | **Elevation of Privilege** | Sin control de acceso basado en roles (RBAC), todos los usuarios tienen acceso plano al simulador de scripts sin diferenciación de privilegios. | Acceso directo a `/simulate.html` y simulación de scripts de red sin verificación de permisos de operador. | No existe restricción por roles de usuario. | **Pendiente Lab 4** (RBAC en capa de aplicación). |

---

## Matriz de Priorización

| Prioridad | ID | Categoría | Justificación |
|:---:|:---:|:---|:---|
| **Alta** | H1 | Information Disclosure | Todo el tráfico HTTP viaja en claro; compromete la confidencialidad de la red. |
| **Alta** | H5 | Spoofing | Ausencia total de autenticación permite acceso anónimo irrestricto al sistema. |
| **Media** | H4 | Tampering | Riesgo latente de alteración de paquetes en tránsito por falta de firma/TLS. |
| **Media** | H6 | Elevation of Privilege | Falta de control de perfiles y roles de usuario en el simulador. |
| **Baja (Mitigado)** | H2 | Information Disclosure | Mitigado exitosamente mediante directiva `server_tokens off;` y cabeceras de seguridad. |
| **Baja (Mitigado)** | H3 | Repudiation | Mitigado parcialmente mediante correlación de telemetría en `access.log`. |

---

## Amenaza Prioritaria para Laboratorio 4
**Spoofing (H5) e Information Disclosure en Tránsito (H1):**
Constituyen la base obligatoria del siguiente laboratorio, donde se implementará la capa criptográfica (HTTPS con certificados TLS), autenticación formal de usuarios, manejo seguro de sesiones y control de acceso basado en roles (RBAC).
