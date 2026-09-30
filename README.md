# NetOps Secure Execution Portal — Laboratorio 3 FDSI

## Descripción
Prototipo de portal web para la ejecución controlada de scripts en equipos de red (firewalls, routers y switches). El sistema permite consultar un inventario ficticio de dispositivos y simular la ejecución de scripts aprobados de solo lectura.

**Opción 2:** Ejecución controlada de scripts remotos en equipos de red.

## Equipo — Grupo G06
| Rol | Integrante | Responsabilidad |
|-----|-----------|----------------|
| Blue Team | Kevin Andrey Ángel Acevedo | Defensa, monitoreo, logs, detecciones, hardening |
| Red Team | Sergio Daniel Buitrago Suancha y Daniel Julian Peña Bonilla | Reconocimiento, validación, pruebas autorizadas |

### Reflexiones Individuales
**Kevin Andrey Ángel Acevedo (Blue Team):** 
Durante este laboratorio comprendí la importancia crítica de la visibilidad y correlación de eventos. Al analizar el tráfico HTTP en texto plano con Wireshark, evidencié cómo la falta de cifrado expone toda la estructura de la red (Information Disclosure). Además, al correlacionar los logs de Nginx, pude identificar patrones de escaneo de rutas (404), pero noté las limitaciones de basarse únicamente en IPs sin identidad. Esto demuestra que asegurar los headers y ocultar la versión del servidor mitiga el reconocimiento automatizado, pero la verdadera solución requiere TLS y autenticación robusta, sentando la base para el próximo laboratorio.

**Sergio Daniel Buitrago Suancha y Daniel Julian Peña Bonilla (Red Team):**
Al realizar las pruebas ofensivas sobre el portal, quedó claro lo sencillo que es enumerar un servidor web que carece de endurecimiento básico. Herramientas como Nmap y curl me permitieron identificar rápidamente la versión de Nginx y extraer información sensible del inventario sin ejecutar ningún exploit complejo. Además, la capacidad de acceder a archivos ocultos (como .git/config) y al simulador de scripts sin ninguna barrera de autenticación valida la hipótesis de Spoofing y Elevación de Privilegios. Esto subraya que la seguridad por oscuridad no es efectiva y que las aplicaciones web deben ser diseñadas asumiendo que la red está comprometida.

## Arquitectura

```
┌──────────────┐     HTTP:80     ┌──────────────────┐     fs      ┌─────────────────┐
│  Kali Linux  │ ──────────────► │  Ubuntu Server   │ ──────────► │  Sitio estático │
│  (Red Team)  │                 │  Nginx           │             │  HTML+CSS+JS    │
└──────────────┘                 └──────────────────┘             └─────────────────┘
                                        ▲
                                        │ logs, PCAP
                                 ┌──────┴──────┐
                                 │  Blue Team  │
                                 └─────────────┘
```

## Variables de Entorno
```bash
export TARGET_IP=127.0.0.1
export TARGET_URL=http://$TARGET_IP
export LAB_CIDR=127.0.0.1/32
date -u +%Y-%m-%dT%H:%M:%SZ
```

## Procedimiento de Reproducción

1. Instalar Nginx: `sudo apt update && sudo apt install -y nginx`
2. Crear directorio web: `sudo mkdir -p /var/www/netops-portal`
3. Copiar la aplicación: `sudo cp -r app/* /var/www/netops-portal/`
4. Copiar configuración de Nginx: `sudo cp nginx/netops-portal.conf /etc/nginx/sites-available/netops-portal`
5. Habilitar sitio: `sudo ln -s /etc/nginx/sites-available/netops-portal /etc/nginx/sites-enabled/netops-portal && sudo rm -f /etc/nginx/sites-enabled/default`
6. Reiniciar servicio: `sudo service nginx restart`

## Estructura del Repositorio
```
Lab3-FDSI-lab/
├── app/                        # Archivos web estáticos
├── nginx/                      # Configuración de servidor web
├── diagrams/                   # Diagramas de Flujo de Datos
├── docs/evidence/reverse/      # Evidencias de Ingeniería Inversa (Parte 2)
│   ├── baseline.txt            # Hashes SHA-256 e identificación ELF
│   ├── level1.md               # Reconocimiento y strings
│   ├── level2.md               # Reconstrucción algorítmica y Ghidra
│   ├── gdb.md                  # Depuración dinámica y confirmación en tiempo de ejecución
│   └── screenshots/            # Capturas de soporte
├── evidence/                   # Evidencias de ejecución
│   ├── red/                    # Escaneos y pruebas ofensivas
│   └── blue/                   # Logs y capturas de red
├── reports/zap-passive/        # Reporte exportado de ZAP
├── reverse-analysis.md         # Respuestas a las preguntas de análisis de Ingeniería Inversa
├── risk-register.md            # Registro de riesgos y mitigaciones
├── stride-analysis.md          # Análisis de amenazas
└── README.md                   # Este documento
```

---

## Parte 2 — Reverse Engineering Challenge Lab (Local CTF)

### Descripción
Ruta de laboratorio local orientada a la ingeniería inversa de binarios compilados en C para arquitectura Linux ELF x86-64, sin acceso al código fuente.

### Resumen de Banderas Obtenidas (CTF Flags)
| Nivel | Binario | Clave Encontrada | Bandera (FLAG) | Método |
| :--- | :--- | :--- | :--- | :--- |
| **Nivel 1** | `crackme_level1` | `REDTEAM-101` | `FLAG{strings_are_evidence}` | Reconocimiento estático con `strings` y `objdump` |
| **Nivel 2** | `crackme_level2` | `FDSI-REVERSE-2026` | `FLAG{ghidra_plus_gdb}` | Decompilación en Ghidra, reversión XOR e inspección GDB |
| **Boss Level** | `crackme_level2_stripped` | `FDSI-REVERSE-2026` | `FLAG{ghidra_plus_gdb}` | Análisis de binario sin símbolos mediante referencias cruzadas (XREFs) |

### Documentación de Evidencias
* **[Baseline Forense](docs/evidence/reverse/baseline.txt):** Hashes SHA-256 oficiales, tipos de archivo y cabeceras ELF.
* **[Nivel 1 - Recon](docs/evidence/reverse/level1.md):** Identificación de secretos embebidos en texto claro.
* **[Nivel 2 - Decompile](docs/evidence/reverse/level2.md):** Reconstrucción del algoritmo de validación XOR y pseudocódigo propio.
* **[Confirmación Dinámica GDB](docs/evidence/reverse/gdb.md):** Sesión de depuración con registros `RAX`/`RDI` y bifurcaciones condicionales.
* **[Preguntas de Análisis](reverse-analysis.md):** Respuestas técnicas a los 7 interrogantes planteados en la guía docente.

---

## Uso Responsable de IA
La IA funcionó como copiloto analítico para depurar configuraciones y estructurar las hipótesis STRIDE y de ingeniería inversa. Ningún PCAP fue enviado completo y todos los datos usados son estrictamente académicos/ficticios.

