# Registro de Riesgos — Laboratorio 3

## Grupo G06: Daniel Julián Peña Bonilla · Kevin Andrey Ángel Acevedo · Sergio Daniel Buitrago Suancha | FDSI 2026-2

| ID | Amenaza STRIDE | Descripción | Impacto | Probabilidad | Estado | Evidencia | Acción Lab 4 |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|
| **R01** | Information Disclosure | HTTP transmite inventario y scripts en texto claro; cualquier observador en la red puede leer el contenido | Alto | Alta | **Pendiente Lab 4** | PCAP muestra contenido legible (`lab3-http.pcap`) | Implementar HTTPS con certificado TLS |
| **R02** | Information Disclosure | Headers de respuesta revelan tecnología y versión del servidor (Nginx 1.18.0) | Medio | Alta | **Mitigado** | `curl -I` y Nmap antes/después (`evidence/retest/`) | `server_tokens off` aplicado |
| **R03** | Spoofing | Sin autenticación, cualquier usuario puede acceder al portal y simular ejecuciones | Alto | Alta | **Pendiente Lab 4** | Acceso anónimo verificado (`curl_home.txt`) | Implementar autenticación, sesiones y tokens |
| **R04** | Repudiation | Sin correlación temporal robusta, difícil atribuir quién realizó cada consulta | Medio | Media | **Mitigado parcialmente** | Comparación `access.log` vs comandos | Logs centralizados con identidad de usuario |
| **R05** | Tampering | Sin TLS, un intermediario podría alterar el inventario o scripts en tránsito | Alto | Media | **Pendiente Lab 4** | Ausencia de integridad demostrada en HTTP | HTTPS + verificación de integridad (checksums) |
| **R06** | Elevation of Privilege | Sin control de roles, todos los usuarios anónimos tienen el mismo nivel de acceso | Alto | Alta | **Pendiente Lab 4** | Navegación directa a `simulate.html` sin login | RBAC (Role-Based Access Control) |
| **R07** | Denial of Service | Sin rate limiting, un atacante podría saturar el servicio web | Medio | Baja | **Aceptado** | No se ejecutó DoS (alcance controlado) | Rate limiting en Lab 5/6 (WAF / Nginx limit_req) |
| **R08** | Information Disclosure | Archivos ocultos (`.git/config`) exponían la estructura interna del repositorio | Medio | Media | **Corregido** | `curl /.git/config` retorna 403 Forbidden | Directiva `location ~ /\. { deny all; return 403; }` |
| **R09** | Information Disclosure | Exposición de IPs de gestión internas y versiones de SO de firewalls/routers en archivo público | Alto | Alta | **Corregido** | Versión sanitizada en Git (`app/public-inventory.txt`) | Política de mínima exposición y catálogo público disociado |

## Resumen de Estados
- **Corregidos:** 2 (R08, R09)
- **Mitigados:** 2 (R02, R04)
- **Aceptados:** 1 (R07)
- **Pendientes Lab 4:** 4 (R01, R03, R05, R06)
