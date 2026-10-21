# Registro de Riesgos — Laboratorio 3

## Grupo G06 | FDSI 2026-2

| ID | Amenaza STRIDE | Descripción | Impacto | Probabilidad | Estado | Evidencia | Acción Lab 4 |
|----|---------------|-------------|---------|-------------|--------|-----------|-------------|
| R01 | Information Disclosure | HTTP transmite inventario y scripts en texto claro; cualquier observador en la red puede leer el contenido | Alto | Alta | **Pendiente Lab 4** | PCAP muestra contenido legible | Implementar HTTPS con certificado TLS |
| R02 | Information Disclosure | Headers de respuesta revelan tecnología del servidor (Nginx) | Medio | Alta | **Mitigado** | `curl -I` antes/después | `server_tokens off` aplicado |
| R03 | Spoofing | Sin autenticación, cualquier usuario puede acceder al portal y simular ejecuciones | Alto | Alta | **Pendiente Lab 4** | Acceso anónimo verificado | Implementar autenticación y roles |
| R04 | Repudiation | Sin correlación temporal robusta, difícil atribuir quién realizó cada consulta | Medio | Media | **Mitigado parcialmente** | Comparación access.log vs comandos | Logs centralizados con identidad |
| R05 | Tampering | Sin TLS, un intermediario podría alterar el inventario o scripts en tránsito | Alto | Media | **Pendiente Lab 4** | Ausencia de integridad demostrada | HTTPS + integridad de contenido |
| R06 | Elevation of Privilege | Sin control de roles, todos los usuarios tienen el mismo nivel de acceso | Alto | Alta | **Pendiente Lab 4** | Navegación directa a simulate.html | RBAC (Role-Based Access Control) |
| R07 | Denial of Service | Sin rate limiting, un atacante podría saturar el servicio | Medio | Baja | **Aceptado** | No se ejecuta DoS en el lab | Rate limiting en Lab 5/6 |
| R08 | Information Disclosure | Archivos ocultos (.git/config) podrían exponer estructura del repo | Medio | Media | **Corregido** | `curl /.git/config` retorna 403 | `location ~ /\. { deny all; }` |

## Resumen
- **Corregidos:** 1 (R08)
- **Mitigados:** 2 (R02, R04)
- **Aceptados:** 1 (R07)
- **Pendientes Lab 4:** 4 (R01, R03, R05, R06)
