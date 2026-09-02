# Evidencias Blue Team — Laboratorio 3

## Responsable: Kevin Andrey Ángel Acevedo

## Formato de evidencia
Cada detección debe documentarse con:

### Template
```
## H1 — Tráfico HTTP en texto plano (Information Disclosure)
- **Fuente:** PCAP (`lab3-http.pcap`) analizado en Wireshark
- **Timestamp UTC:** 2026-09-02T23:33:00Z
- **IP origen:** 127.0.0.1 (Localhost / Red Team)
- **Evento detectado:** Solicitudes GET hacia el portal y el inventario.
- **Correlación con Red Team:** El atacante navegó por `http://localhost/public-inventory.txt`.
- **Conclusión:** Al no usar HTTPS, cualquier intermediario en la red puede leer el inventario de dispositivos completo y la estructura del portal. Se confirma la vulnerabilidad de Information Disclosure.
- **Archivo de evidencia:** `lab3-http.pcap` y captura de pantalla `evidencia-wireshark.png`
```

## Checklist de detecciones
- [x] Captura PCAP del tráfico HTTP (60 seg)
- [ ] Revisión de access.log (correlación con Red Team)
- [ ] Revisión de error.log
- [ ] Correlación de al menos 3 eventos
- [ ] Regla de detección: 5+ respuestas 404 en 5 min
- [ ] Verificación de headers después del hardening
- [ ] Línea de tiempo Purple Team

## Archivos esperados en este directorio
- `lab3-http.pcap`
- `access_log_sample.txt`
- `error_log_sample.txt`
- `access_log_correlation.txt`
- `headers_before.txt`
- `headers_after.txt`
- `detection_rule_test.txt`
