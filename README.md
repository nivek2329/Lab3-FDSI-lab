# 🔒 NetOps Secure Execution Portal — Laboratorio 3 FDSI

## Descripción
Prototipo de portal web para la ejecución controlada de scripts en equipos de red (firewalls, routers y switches). El sistema permite consultar un inventario ficticio de dispositivos y simular la ejecución de scripts aprobados de solo lectura.

**Opción 2:** Ejecución controlada de scripts remotos en equipos de red.

## Equipo — Grupo G06
| Rol | Integrante | Responsabilidad |
|-----|-----------|----------------|
| Blue Team | Kevin Andrey Ángel Acevedo | Defensa, monitoreo, logs, detecciones, hardening |
| Red Team | Sergio Daniel Buitrago Suancha | Reconocimiento, validación, pruebas autorizadas |

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
export TARGET_IP=IP_ASIGNADA
export TARGET_URL=http://$TARGET_IP
export LAB_CIDR=CIDR_AUTORIZADO
date -u +%Y-%m-%dT%H:%M:%SZ
```

## Despliegue

### 1. Instalar Nginx
```bash
sudo apt update && sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### 2. Copiar archivos del portal
```bash
sudo mkdir -p /var/www/netops-portal
sudo cp app/* /var/www/netops-portal/
```

### 3. Configurar virtual host
```bash
sudo cp nginx/netops-portal.conf /etc/nginx/sites-available/netops-portal
sudo ln -s /etc/nginx/sites-available/netops-portal /etc/nginx/sites-enabled/netops-portal
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configurar firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from "$LAB_CIDR" to any port 80 proto tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

### 5. Verificar
```bash
curl -i http://127.0.0.1/
curl -I http://127.0.0.1/public-inventory.txt
```

## Estructura del Repositorio
```
Lab3-FDSI-lab/
├── app/
│   ├── index.html              # Portal principal
│   ├── public-inventory.txt    # Inventario de dispositivos
│   ├── scripts-catalog.html    # Catálogo de scripts aprobados
│   ├── simulate.html           # Simulador de ejecución
│   ├── audit-log.html          # Visor de auditoría
│   └── style.css               # Estilos
├── nginx/
│   └── netops-portal.conf      # Configuración Nginx con hardening
├── diagrams/
│   └── dfd-lab3.md             # DFD con límites de confianza
├── evidence/
│   ├── red/                    # Evidencias Red Team
│   └── blue/                   # Evidencias Blue Team
├── reports/
│   └── zap-passive/            # Reporte ZAP pasivo
├── risk-register.md            # Registro de riesgos
├── stride-analysis.md          # Análisis STRIDE
└── README.md                   # Este archivo
```

## Funcionalidades del Portal
1. **Inventario de Dispositivos**: Consulta de equipos de red registrados (datos ficticios)
2. **Catálogo de Scripts**: Scripts aprobados de solo lectura con clasificación de riesgo
3. **Simulador de Ejecución**: Simulación controlada con outputs ficticios
4. **Registro de Auditoría**: Trazabilidad de todas las ejecuciones simuladas

## Seguridad
- ⚠️ El servicio opera por HTTP (sin TLS) — riesgo aceptado para Lab 3
- ⚠️ Sin autenticación ni autorización — pendiente para Lab 4
- ✅ Headers de seguridad configurados (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- ✅ Server tokens ocultos
- ✅ Directorio listing deshabilitado
- ✅ Archivos ocultos bloqueados

## Uso Responsable de IA
Se utilizó IA como copiloto analítico para:
- Generación de estructura del proyecto
- Outputs ficticios de comandos de red
- Análisis STRIDE

Toda afirmación fue verificada contra documentación oficial y el criterio del equipo.

## Licencia
Uso académico autorizado — FDSI 2026-2