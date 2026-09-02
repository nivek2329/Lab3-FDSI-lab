# Diagrama de Flujo de Datos (DFD) — Laboratorio 3

## Grupo G06 | FDSI 2026-2

### DFD Nivel 0 — Portal NetOps

```mermaid
flowchart LR
    subgraph TB1["Límite de Confianza 1: Red Externa"]
        U["👤 Usuario / Kali Linux\n(Red Team)"]
    end

    subgraph TB2["Límite de Confianza 2: Servidor"]
        subgraph APP["Aplicación Web"]
            NGX["🔧 Nginx\nPuerto 80"]
            INV["📄 Inventario\npublic-inventory.txt"]
            SCR["📋 Catálogo Scripts\nscripts-catalog.html"]
            SIM["⚡ Simulador\nsimulate.html"]
            AUD["📊 Auditoría\naudit-log.html"]
        end
        LOG["📝 Logs\naccess.log / error.log"]
    end

    U -->|"HTTP GET /"| NGX
    U -->|"HTTP GET /public-inventory.txt"| NGX
    U -->|"HTTP GET /simulate.html"| NGX
    NGX -->|"Sirve archivos"| INV
    NGX -->|"Sirve archivos"| SCR
    NGX -->|"Sirve archivos"| SIM
    NGX -->|"Sirve archivos"| AUD
    NGX -->|"Registra eventos"| LOG

    style TB1 fill:#1a1a2e,stroke:#f85149,stroke-width:2px,color:#f0f6fc
    style TB2 fill:#0d1117,stroke:#3fb950,stroke-width:2px,color:#f0f6fc
    style NGX fill:#1f6feb,stroke:#58a6ff,color:#fff
```

### Descripción de Límites de Confianza

| Límite | Descripción | Riesgo principal |
|--------|------------|------------------|
| **LT1: Red Externa → Servidor** | Tráfico HTTP no cifrado cruza la red. Cualquier nodo intermedio puede observar o alterar el contenido. | Information Disclosure, Tampering |
| **LT2: Nginx → Archivos** | Nginx sirve archivos estáticos sin autenticación. No hay validación de identidad del solicitante. | Spoofing, Elevation of Privilege |

### Flujos de Datos

| # | Origen | Destino | Dato | Protocolo | Protección |
|---|--------|---------|------|-----------|------------|
| F1 | Usuario | Nginx | Solicitud HTTP (GET) | HTTP/1.1 | Ninguna (texto claro) |
| F2 | Nginx | Usuario | Contenido HTML/TXT | HTTP/1.1 | Ninguna (texto claro) |
| F3 | Nginx | Logs | Evento de acceso | Filesystem | Permisos Unix |
| F4 | Usuario | Simulador | Datos del formulario | HTTP/1.1 + JS local | Ninguna |
