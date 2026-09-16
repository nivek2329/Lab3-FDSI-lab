# Evidencias Blue Team — Laboratorio 3

## Responsable: Kevin Andrey Ángel Acevedo (Blue Team)

## Checklist de Detecciones y Telemetría
- [x] Captura PCAP del tráfico HTTP (60 seg) en `lab3-http.pcap`
- [x] Revisión y correlación de `access.log` con acciones de Red Team
- [x] Revisión de `error.log` (errores de rutas inexistentes)
- [x] Correlación de al menos 3 eventos entre ataque y defensa
- [x] Regla de detección: 5+ respuestas 404 en 5 min documentada y probada
- [x] Verificación de headers antes y después del hardening
- [x] Línea de tiempo Purple Team consolidada

---

## Archivos de Evidencia en este Directorio
- `lab3-http.pcap`: Captura de red en formato libpcap con el tráfico HTTP sin cifrar sobre el puerto 80.
- `evidencia_wireshark.png`: Captura de pantalla de Wireshark mostrando el seguimiento de flujo TCP en texto plano.
- `trafico_red_wireshark.txt`: Extracción en texto plano de la secuencia TCP demostrando la lectura no autorizada del inventario en tránsito.
- `access_log_sample.txt`: Muestra representativa de los logs de acceso de Nginx.
- `error_log_sample.txt`: Registros de error correspondientes a los códigos 404 producidos por el fuzzing del Red Team.
- `access_log_correlation.txt`: Análisis detallado de correlación evento por evento.
- `detection-rules.md`: Definición formal de reglas de detección (404s, User-Agents y dotfiles) y línea de tiempo Purple Team.
- `detection_rule_test.txt`: Prueba de ejecución del script awk sobre los logs validando la alarma de escaneo.
- `headers_before.txt` / `headers_after.txt`: Evidencia de cabeceras HTTP antes y después del hardening.
