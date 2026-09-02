# Reglas de Detección — Blue Team | Laboratorio 3

## Responsable: Kevin Andrey Ángel Acevedo

---

## Regla 1: Escaneo de rutas (múltiples 404)

**Descripción:** Detectar cuando una misma IP genera 5 o más respuestas HTTP 404 en un periodo de 5 minutos, lo cual puede indicar enumeración de directorios o fuzzing.

**Comando de detección:**
```bash
sudo awk '$9 ~ /404/ {print $1, $4, $7, $9}' /var/log/nginx/netops-access.log | sort | uniq -c | sort -nr | head
```

**Limitaciones:**
- No distingue entre errores legítimos y enumeración maliciosa
- Depende de la ventana de tiempo del log
- No bloquea automáticamente (solo detecta)

**Falsos positivos posibles:**
- Usuarios que siguen enlaces rotos
- Crawlers legítimos
- Errores de configuración en enlaces internos

---

## Regla 2: Detección de herramientas de reconocimiento

**Descripción:** Identificar User-Agents conocidos de herramientas de escaneo (Nmap, curl, ZAP).

**Comando de detección:**
```bash
sudo grep -E 'nmap|curl|ZAP|nikto|gobuster|dirb' /var/log/nginx/netops-access.log | tail -n 30
```

**Limitaciones:**
- Los atacantes pueden falsificar el User-Agent
- curl es una herramienta legítima de administración
- Solo detecta herramientas conocidas

---

## Regla 3: Acceso a rutas sensibles

**Descripción:** Detectar intentos de acceso a archivos ocultos o rutas administrativas.

**Comando de detección:**
```bash
sudo grep -E '\.(git|env|htpasswd|htaccess|bak|sql)' /var/log/nginx/netops-access.log
```

**Limitaciones:**
- Solo detecta patrones conocidos
- No detecta rutas ofuscadas

---

## Plantilla de línea de tiempo Purple Team

| Hora UTC | Acción Red Team | Evidencia Blue Team | Conclusión |
|----------|----------------|--------------------|-----------|
| HH:MM:SS | Nmap port 80 | access.log puede no registrar SYN scan | Diferenciar red vs. aplicación |
| HH:MM:SS | GET / | 200 en access.log | Correlación confirmada |
| HH:MM:SS | GET /public-inventory.txt | 200 en access.log + PCAP | Contenido visible por HTTP |
| HH:MM:SS | GET /ruta-inexistente | 404 en access.log | Detección validada (regla 1) |
| HH:MM:SS | GET /.git/config | 403 en access.log | Hardening efectivo |
| HH:MM:SS | ZAP pasivo | Múltiples GETs en access.log | Headers analizados |
