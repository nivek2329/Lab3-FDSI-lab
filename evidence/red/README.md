# Evidencias Red Team — Laboratorio 3

## Responsable: Sergio Daniel Buitrago Suancha

## Formato de evidencia
Cada prueba debe documentarse con el siguiente formato:

### Template
```
## [ID] — [Nombre de la prueba]
- **Hipótesis STRIDE:** [Categoría e hipótesis]
- **Comando:** [Comando exacto ejecutado]
- **Timestamp UTC:** [YYYY-MM-DDTHH:MM:SSZ]
- **IP Origen:** [IP de Kali]
- **IP Destino:** [TARGET_IP]
- **Resultado esperado:** [Qué se espera observar]
- **Resultado obtenido:** [Output real]
- **Interpretación:** [Análisis del resultado]
- **Archivo de evidencia:** [Ruta al archivo]
```

## Checklist de pruebas
- [ ] Reconocimiento con Nmap (puerto 80)
- [ ] curl -i a la página principal
- [ ] curl -I headers del inventario
- [ ] curl al inventario completo
- [ ] curl a rutas inexistentes (404)
- [ ] curl a archivos ocultos (.git/config)
- [ ] Acceso directo al simulador sin autenticación
- [ ] ZAP pasivo (sin Active Scan)

## Archivos esperados en este directorio
- `nmap_port80.nmap` / `.xml` / `.gnmap`
- `curl_home.txt`
- `curl_headers.txt`
- `curl_inventory.txt`
- `curl_simulate.txt`
- `curl_hidden_path.txt`
- `start.txt` (timestamp de inicio)
- `end.txt` (timestamp de fin)
