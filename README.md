# 🔒 NetOps Secure Execution Portal — Laboratorio 3 FDSI (Parte 2)

## Descripción
Prototipo de portal web para la ejecución controlada de scripts en equipos de red (firewalls, routers y switches). El sistema permite consultar un inventario ficticio de dispositivos y simular la ejecución de scripts aprobados de solo lectura.

**Opción 2:** Ejecución controlada de scripts remotos en equipos de red.  
**Rama activa de trabajo:** `parte-2` (derivada limpiamente de `main`).

---

## Equipo — Grupo G06
| Rol | Integrante | Responsabilidad |
|:---|:---|:---|
| **Blue Team** | Kevin Andrey Ángel Acevedo | Defensa, monitoreo, telemetría de logs, reglas de detección, hardening de Nginx |
| **Red Team** | Sergio Daniel Buitrago Suancha y Daniel Julián Peña Bonilla | Reconocimiento ofensivo, escaneo de servicios, pruebas autorizadas y retest |

### Reflexiones Individuales
- **Kevin Andrey Ángel Acevedo (Blue Team):** 
Durante este laboratorio comprendí la importancia crítica de la visibilidad y correlación de eventos. Al analizar el tráfico HTTP en texto plano con Wireshark, evidencié cómo la falta de cifrado expone toda la estructura de la red (Information Disclosure). Además, al correlacionar los logs de Nginx, pude identificar patrones de escaneo de rutas (404), pero noté las limitaciones de basarse únicamente en IPs sin identidad. Esto demuestra que asegurar los headers y ocultar la versión del servidor mitiga el reconocimiento automatizado, pero la verdadera solución requiere TLS y autenticación robusta, sentando la base para el próximo laboratorio.

- **Sergio Daniel Buitrago Suancha y Daniel Julián Peña Bonilla (Red Team):**
Al realizar las pruebas ofensivas sobre el portal, quedó claro lo sencillo que es enumerar un servidor web que carece de endurecimiento básico. Herramientas como Nmap y curl me permitieron identificar rápidamente la versión de Nginx y extraer información sensible del inventario sin ejecutar ningún exploit complejo. Además, la capacidad de acceder a archivos ocultos (como .git/config) y al simulador de scripts sin ninguna barrera de autenticación valida la hipótesis de Spoofing y Elevación de Privilegios. Esto subraya que la seguridad por oscuridad no es efectiva y que las aplicaciones web deben ser diseñadas asumiendo que la red está comprometida.

---

## Arquitectura

```text
┌──────────────┐     HTTP:80     ┌──────────────────┐     fs      ┌─────────────────┐
│  Kali Linux  │ ──────────────► │  Ubuntu Server   │ ──────────► │  Sitio estático │
│  (Red Team)  │                 │  Nginx (Hardened)│             │  HTML+CSS+JS    │
└──────────────┘                 └──────────────────┘             └─────────────────┘
                                        ▲
                                        │ logs, PCAP
                                 ┌──────┴──────┐
                                 │  Blue Team  │
                                 └─────────────┘
```

---

## Variables de Entorno
```bash
export TARGET_IP=127.0.0.1
export TARGET_URL=http://$TARGET_IP
export LAB_CIDR=127.0.0.1/32
date -u +%Y-%m-%dT%H:%M:%SZ
```

---

## Procedimiento de Reproducción

### 1. Despliegue de la Aplicación
```bash
# 1. Instalar servidor web
sudo apt update && sudo apt install -y nginx

# 2. Desplegar aplicación estática
sudo mkdir -p /var/www/netops-portal
sudo cp -r app/* /var/www/netops-portal/

# 3. Habilitar configuración Nginx con hardening
sudo cp nginx/netops-portal.conf /etc/nginx/sites-available/netops-portal
sudo ln -s /etc/nginx/sites-available/netops-portal /etc/nginx/sites-enabled/netops-portal
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Validar sintaxis y reiniciar servicio
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Hardening Aplicado (Fase E)
- **Ocultamiento de Banners y Versión (`server_tokens off;`):** Elimina la divulgación del texto plano de la versión del servidor (`nginx 1.18.0 (Ubuntu)`), mitigando reconocimiento automatizado y mapeo de CVEs conocidos.
- **Cabeceras HTTP de Seguridad:** Inyección de `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` y `Referrer-Policy: no-referrer`.
- **Protección de Archivos Ocultos:** Denegación estricta de acceso a rutas dotfiles (`location ~ /\. { deny all; return 403; }`).
- **Sanitización del Inventario:** Eliminación de IPs internas y versiones de sistemas operativos en `app/public-inventory.txt`.

### 3. Verificación y Retest (Fase F - Purple Team)
```bash
mkdir -p evidence/retest
nmap -Pn -sV -p 80 "$TARGET_IP" -oA evidence/retest/nmap_port80
curl -I "$TARGET_URL/" | tee evidence/retest/headers_after.txt
curl -i "$TARGET_URL/.git/config" | tee evidence/retest/hidden_path.txt
```

---

## Estructura del Repositorio
```text
Lab3-FDSI-lab/
├── app/                        # Archivos web estáticos y catálogo sanitizado
│   └── public-inventory.txt    # Inventario sanitizado (Paso 16 - Principio de Menor Exposición)
├── nginx/                      # Configuraciones de servidor web
│   ├── netops-portal.conf      # Configuración de producción endurecida
│   └── netops-portal-hardened.conf # Plantilla detallada de hardening
├── diagramas/                  # Diagramas DFD y arquitectura
├── evidence/                   # Evidencias técnicas reproducibles
│   ├── red/                    # Escaneos y pruebas ofensivas iniciales
│   ├── blue/                   # Telemetría de logs, PCAP y reglas de detección
│   └── retest/                 # Validación Purple Team post-hardening (Paso 17)
├── reports/zap-passive/        # Reporte de análisis de vulnerabilidades pasivas
├── risk-register.md            # Matriz de riesgos STRIDE (R01-R09) y análisis de CVEs
├── stride-analysis.md          # Modelado de amenazas, activos e hipótesis
└── README.md                   # Documentación principal del proyecto
```

---

## Uso Responsable de IA
La IA funcionó como copiloto analítico para depurar configuraciones y estructurar las hipótesis STRIDE. Ningún PCAP fue enviado completo y todos los datos usados son estrictamente ficticios.
