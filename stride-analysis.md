# Análisis STRIDE — Laboratorio 3

## Grupo G06 | Kevin Ángel (Blue) · Sergio Buitrago (Red) | FDSI 2026-2

## Modelo de Amenazas

El análisis STRIDE se aplica al portal **NetOps Secure Execution Portal**, un sistema web que permite consultar inventarios de dispositivos de red y simular la ejecución de scripts aprobados.

### Activos identificados
1. Portal web (HTML estático servido por Nginx)
2. Inventario de dispositivos de red (public-inventory.txt)
3. Catálogo de scripts aprobados
4. Simulador de ejecución y registro de auditoría
5. Logs del servidor (access.log, error.log)

---

## Hipótesis STRIDE

| ID | Categoría STRIDE | Hipótesis técnica | Método de validación | Resultado esperado | Evidencia |
|----|-----------------|-------------------|---------------------|-------------------|----------|
| H1 | **Information Disclosure** | HTTP permite observar el inventario de dispositivos y los outputs de scripts en tránsito. Un observador pasivo en la red puede leer toda la información. | Captura PCAP con tcpdump filtrada en puerto 80; inspección con Wireshark | Contenido del inventario visible en texto plano dentro del PCAP | `evidence/blue/lab3-http.pcap` |
| H2 | **Information Disclosure** | Los headers de respuesta HTTP revelan la tecnología del servidor (versión de Nginx), facilitando la identificación de vulnerabilidades conocidas. | `curl -I $TARGET_URL/` y ZAP en modo pasivo | Header `Server: nginx/X.X.X` visible antes del hardening | `evidence/red/curl_headers.txt` |
| H3 | **Repudiation** | Sin un mecanismo de correlación temporal robusto, el equipo no puede atribuir con certeza qué IP realizó cada solicitud al inventario o al simulador. | Comparar timestamps de comandos Red Team con registros en access.log | Correlación posible pero no garantizada (NTP, timezone) | `evidence/blue/access_log_correlation.txt` |
| H4 | **Tampering** | Sin TLS, un intermediario (MITM) podría alterar el contenido del inventario o los resultados del simulador durante el tránsito. No se ejecutará MITM real. | Demostrar ausencia de protección de integridad; verificar que no hay checksum ni firma | HTTP no ofrece mecanismo de integridad nativo | Análisis teórico documentado |
| H5 | **Spoofing** | Sin autenticación, cualquier usuario con acceso a la red puede hacerse pasar por un operador autorizado y acceder al portal completo, incluyendo el simulador. | Acceso anónimo desde Kali al portal; navegación a simulate.html sin credenciales | Acceso completo sin restricciones | `evidence/red/curl_home.txt` |
| H6 | **Elevation of Privilege** | Sin control de roles ni autorización, un usuario que debería tener acceso de solo lectura al inventario puede acceder al simulador de ejecución de scripts. | Navegación directa a `/simulate.html` desde cualquier IP | No hay diferenciación de permisos entre páginas | `evidence/red/curl_simulate.txt` |

---

## Matriz de Priorización

| Prioridad | ID | Categoría | Justificación |
|-----------|-----|-----------|---------------|
| 🔴 Alta | H1 | Info. Disclosure | Todo el tráfico es observable; afecta confidencialidad del inventario |
| 🔴 Alta | H5 | Spoofing | Sin autenticación = sin control de identidad |
| 🟡 Media | H4 | Tampering | MITM teórico; no se ejecuta pero el riesgo existe |
| 🟡 Media | H6 | Elev. Privilege | Sin roles; todos pueden simular ejecuciones |
| 🟢 Baja | H2 | Info. Disclosure | Mitigado con server_tokens off |
| 🟢 Baja | H3 | Repudiation | Mitigado parcialmente con logs |

---

## Amenaza prioritaria para Laboratorio 4
**Spoofing (H5)**: La falta de autenticación es el riesgo más crítico. En el Lab 4 se implementarán certificados TLS, autenticación, sesiones y roles para resolverlo.
