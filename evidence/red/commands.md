# Plantillas de Comandos Red Team — Laboratorio 3

## Variables (configurar antes de ejecutar)
```bash
export TARGET_IP=IP_ASIGNADA
export TARGET_URL=http://$TARGET_IP
export LAB_CIDR=CIDR_AUTORIZADO
```

## 1. Registro de inicio
```bash
mkdir -p evidence/red
date -u +%Y-%m-%dT%H:%M:%SZ | tee evidence/red/start.txt
```

## 2. Reconocimiento Nmap
```bash
nmap -Pn -sV -p 80 "$TARGET_IP" -oA evidence/red/nmap_port80
```

## 3. Página principal
```bash
curl -i "$TARGET_URL/" | tee evidence/red/curl_home.txt
```

## 4. Headers del inventario
```bash
curl -I "$TARGET_URL/public-inventory.txt" | tee evidence/red/curl_headers.txt
```

## 5. Contenido del inventario
```bash
curl -s "$TARGET_URL/public-inventory.txt" | tee evidence/red/curl_inventory.txt
```

## 6. Acceso al simulador (sin autenticación)
```bash
curl -i "$TARGET_URL/simulate.html" | tee evidence/red/curl_simulate.txt
```

## 7. Prueba de rutas inexistentes (404)
```bash
curl -i "$TARGET_URL/admin" | tee evidence/red/curl_404_admin.txt
curl -i "$TARGET_URL/api/config" | tee evidence/red/curl_404_api.txt
curl -i "$TARGET_URL/backup.sql" | tee evidence/red/curl_404_backup.txt
```

## 8. Prueba de archivos ocultos
```bash
curl -i "$TARGET_URL/.git/config" | tee evidence/red/curl_hidden_path.txt
curl -i "$TARGET_URL/.env" | tee evidence/red/curl_env.txt
```

## 9. ZAP Pasivo
1. Abrir OWASP ZAP → Manual Explore
2. Ingresar `$TARGET_URL`
3. Navegar por todas las páginas
4. Revisar Alerts y Sites (SIN Active Scan)
5. Exportar reporte HTML a `reports/zap-passive/`

## 10. Registro de fin
```bash
date -u +%Y-%m-%dT%H:%M:%SZ | tee evidence/red/end.txt
```
