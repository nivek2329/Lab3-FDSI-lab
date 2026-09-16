# Evidencias Red Team — Laboratorio 3

## Responsables: Sergio Daniel Buitrago Suancha & Daniel Julián Peña Bonilla

## Checklist de Pruebas Ejecutadas
- [x] Reconocimiento con Nmap (puerto 80)
- [x] curl -i a la página principal
- [x] curl -I headers del inventario
- [x] curl al inventario completo
- [x] curl a rutas inexistentes (404)
- [x] curl a archivos ocultos (.git/config)
- [x] Acceso directo al simulador sin autenticación
- [x] ZAP pasivo (sin Active Scan)

---

## Inventario de Superficie de Ataque (Paso 9)

| Elemento | Dato observado | Riesgo / Pregunta Analítica |
| :--- | :--- | :--- |
| **Host / IP** | `127.0.0.1` (o IP autorizada) | ¿Está limitado al CIDR autorizado? Sí, se configuró UFW (`sudo ufw allow from "$LAB_CIDR" to any port 80 proto tcp`) para restringir el alcance exclusivamente a las estaciones autorizadas del laboratorio. |
| **Puerto** | `80/TCP` (HTTP abierto) | ¿Por qué el tráfico no tiene confidencialidad? Porque HTTP es un protocolo en texto plano sin cifrado criptográfico. Toda petición y respuesta es observable e interceptable por cualquier intermediario en el segmento. |
| **Servidor** | `nginx/1.18.0 (Ubuntu)` | ¿Se revela versión? Sí, el header de respuesta expone la versión del software y la distribución del OS, lo que permite a un atacante buscar vulnerabilidades conocidas (CVEs). Corregido en Fase E con `server_tokens off;`. |
| **Ruta /** | `HTTP 200 OK` | ¿Expone información innecesaria? La página raíz entrega la estructura del portal, enlaces al catálogo de scripts y al simulador de ejecución sin requerir autenticación previa. |
| **Archivo público** | `/public-inventory.txt` | ¿Qué metadatos entrega? En su versión inicial exponía IPs de gestión internas (`10.0.X.X`), versiones de SO de firewalls y sedes físicas. Fue sanitizado en la Fase E (Paso 16) bajo el principio de menor exposición. |

---

## Archivos de Evidencia en este Directorio
- `start.txt` / `end.txt`: Registro temporal UTC del ejercicio.
- `nmap_port80.nmap`: Escaneo inicial que identifica el puerto 80 y versión de Nginx.
- `curl_home.txt`: Petición a `/` con headers y código 200 OK.
- `curl_headers.txt`: Headers de `/public-inventory.txt` exponiendo banner del servidor.
- `curl_inventory.txt`: Descarga del inventario en texto plano por HTTP.
- `curl_simulate.txt`: Acceso sin autenticación a la interfaz de ejecución de scripts.
- `curl_404_admin.txt`, `curl_404_api.txt`, `curl_404_backup.txt`: Pruebas de fuzzing para activar la regla de detección de 404s del Blue Team.
- `curl_hidden_path.txt`: Acceso exitoso (200 OK) a `/.git/config` antes del hardening.
- `curl_hidden_path_after.txt`: Verificación de bloqueo (403 Forbidden) a `/.git/config` tras el hardening.
