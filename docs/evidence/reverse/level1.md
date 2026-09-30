# Nivel 1 — Recon ("Strings are evidence")

## 1. Hipótesis Inicial
Al tratarse del nivel de reconocimiento introductorio, la hipótesis de trabajo formulada fue que el mecanismo de autenticación del programa realiza una verificación estática elemental: compara la entrada introducida por el usuario con una cadena embebida en texto claro almacenada en la sección de datos de solo lectura (`.rodata`) del binario ejecutable.

---

## 2. Metodología y Ejecución de Comandos

### A. Prueba de ejecución inicial
Se ejecutó el programa sin parámetros y con entradas aleatorias para observar su comportamiento e identificar mensajes de error o pistas:
```bash
./crackme_level1
# Salida: Uso: ./crackme_level1 <password>

./crackme_level1 prueba
# Salida: Access denied.
```

### B. Análisis Estático con `strings`
Se inspeccionaron las cadenas de caracteres imprimibles de longitud mínima 5 con la herramienta `strings`:
```bash
strings -n 5 crackme_level1 | grep -iE "REDTEAM|FLAG|Access|pass"
```
Se identificaron de inmediato las siguientes cadenas relevantes:
* `REDTEAM-101`
* `Access granted.`
* `Access denied.`

### C. Inspección del Desensamblado (`objdump`)
Se verificó el flujo del programa en ensamblador con sintaxis Intel:
```bash
objdump -d -M intel crackme_level1 | grep -A 25 "<main>:"
```
**Observación técnica:** En la función `main`, se cargan en los registros `RDI` y `RSI` el argumento suministrado por línea de comandos (`argv[1]`) y la dirección en `.rodata` que apunta a `"REDTEAM-101"`. Posteriormente, se invoca a `strcmp@plt`. Si el resultado devuelto en `EAX` es `0` (las cadenas son idénticas), la bifurcación condicional (`jne`) no se ejecuta y se llama directamente a `print_flag`.

---

## 3. Confirmación Dinámica y Obtención de la Bandera (FLAG)
Se suministró la cadena descubierta como argumento al binario:
```bash
./crackme_level1 REDTEAM-101
```

### Salida oficial en terminal:
```text
=== FDSI CrackMe Level 1 ===
Access granted.
FLAG{strings_are_evidence}
```

### Evidencia Visual:
![Ejecución y obtención de FLAG Nivel 1](screenshots/screenshot_level1.png)

---

## 4. Enseñanza de Desarrollo Seguro
El almacenamiento de contraseñas, llaves maestras o secretos codificados directamente en el código fuente (Hardcoded Credentials - CWE-259) es un grave fallo de diseño. Cualquier binario compilado expone sus constantes en texto claro, permitiendo que atacantes o auditores extraigan las credenciales en segundos con utilidades forenses básicas como `strings`. Los secretos deben externalizarse mediante variables de entorno o sistemas de gestión de credenciales (KMS / Vault).
