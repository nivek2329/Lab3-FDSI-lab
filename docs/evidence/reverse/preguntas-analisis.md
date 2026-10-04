# Preguntas de análisis

Respuestas a las 7 preguntas de la guía. Evidencia de soporte: [`baseline.txt`](baseline.txt), [`level1.md`](level1.md), [`level2.md`](level2.md), [`gdb.md`](gdb.md) y [`boss` en reverse-analysis.md](../../../reverse-analysis.md).

1. **¿Qué información se obtuvo sin ejecutar el binario?** Formato ELF64 x86-64, linking dinámico, presencia o ausencia de símbolos, librerías importadas (`strcmp`/`strlen`), mensajes, la contraseña del Nivel 1 en texto plano, los arreglos `k` y `expected` del Nivel 2 y el algoritmo completo (vía Ghidra).
2. **¿Por qué una contraseña compilada como string es insegura?** Porque queda tal cual en `.rodata`, y cualquiera con el ejecutable la lee con `strings` en segundos, sin ejecutarlo.
3. **¿Qué cambió entre `crackme_level2` y `crackme_level2_stripped`?** Solo se quitaron metadatos (`.symtab`, `.strtab`, `.debug_*`). El código, los datos y el comportamiento son idénticos, así que la clave y la FLAG son las mismas.
4. **¿Qué ventaja tuvo Ghidra sobre `objdump`?** Decompila a pseudo-C, resuelve referencias a datos y cadenas, muestra XREFs y permite renombrar y comentar. Así se reconstruye el algoritmo sin leer instrucción por instrucción.
5. **¿Qué confirmó GDB que el análisis estático no demostraba?** El comportamiento real: valores en registros (longitud 4 frente a 17, operandos del XOR, `score`), y que el retorno cambia de 0 a 1 solo con la clave reconstruida.
6. **¿Por qué Burp Suite no es una herramienta de reversing de binarios?** Burp intercepta y modifica tráfico HTTP entre cliente y servidor; no desensambla ni decompila código máquina. Analiza el protocolo, no el ejecutable.
7. **¿Qué controles evitarían secretos embebidos?** Validar en servidor; usar firmas asimétricas para licencias (el binario solo lleva la clave pública); guardar hashes lentos con sal en lugar de secretos; usar gestores de secretos o variables de entorno; escanear secretos en CI (gitleaks, trufflehog); revisión de código; distribuir binarios stripped (solo dificulta, no protege).

---

## Respuestas ampliadas (aporte de Daniel Peña)

### 1. ¿Qué información pudiste obtener sin ejecutar el binario?
Mediante el análisis estático preliminar con `file`, `readelf` y `strings`, se logró obtener sin ejecutar ninguna instrucción:
* **Arquitectura y formato:** Binarios en formato ELF de 64 bits para arquitectura x86-64 en orden de bytes *little-endian*.
* **Modelo de vinculación:** Vinculación dinámica (`dynamically linked`) utilizando el intérprete `/lib64/ld-linux-x86-64.so.2` y dependencias de la biblioteca estándar de C (`libc.so.6`).
* **Símbolos y metadatos:** Presencia de tablas de símbolos y secciones de depuración DWARF en los niveles 1 y 2, revelando los nombres de funciones (`main`, `validate_key`, `reveal_flag`, `print_flag`).
* **Cadenas de texto constantes:** Todos los textos almacenados en la sección de solo lectura (`.rodata`), tales como mensajes de uso, notificaciones de éxito/fallo y, en el Nivel 1, la contraseña de acceso en texto claro (`REDTEAM-101`).

---

### 2. ¿Por qué una contraseña compilada como string es un diseño inseguro?
Compilar una contraseña directamente como un literal de cadena (Hardcoded Password - CWE-259) es un diseño inseguro porque:
1. Las cadenas constantes se almacenan sin cifrar ni transformar en la sección de datos estáticos (`.rodata`) del archivo ejecutable.
2. Cualquier persona que tenga acceso al archivo puede extraerlas de forma trivial mediante comandos estándar como `strings` o inspección con un editor hexadecimal, sin necesidad de ejecutar el programa, desensamblarlo ni entender su flujo lógico.
3. Viola el principio de Kerckhoffs y el principio de separación entre código y secretos.

---

### 3. ¿Qué cambió entre `crackme_level2` y `crackme_level2_stripped`?
El proceso de despojado (*strip*) elimina las secciones no esenciales para la ejecución en tiempo de ejecución, específicamente la tabla de símbolos (`.symtab`) y la tabla de cadenas de símbolos (`.strtab`).
* **Lo que cambió:** Los nombres legibles de variables globales y funciones definidas por el usuario (`main`, `validate_key`, `k`, `expected`) desaparecieron de la tabla de símbolos. Comandos como `nm` o desensambladores planos solo muestran direcciones de memoria sin etiquetas nemotécnicas.
* **Lo que permaneció idéntico:** El código de máquina en `.text`, los opcodes en ensamblador, las constantes en `.rodata` y la lógica de validación matemática. El ejecutable se comporta y valida la clave exactamente de la misma manera.

---

### 4. ¿Qué ventaja tuvo Ghidra sobre `objdump`?
Mientras que `objdump` únicamente ofrece una representación lineal de instrucciones desensambladas en ensamblador (nemónicos como `mov`, `lea`, `cmp`, `je`), Ghidra proporciona:
1. **Decompilación avanzada a C:** Reconstruye estructuras de control de alto nivel (bucles `for`/`while`, bloques `if-else`), tipos de datos de variables y firmas de funciones.
2. **Grafo de flujo de control (CFG):** Visualización clara de las bifurcaciones y caminos de ejecución del programa.
3. **Referencias cruzadas (XREFs):** Capacidad de rastrear instantáneamente qué instrucciones leen o escriben en una dirección de memoria o cadena específica.
4. **Capacidad de renombrado y tipado interactivo:** Permite al analista cambiar nombres de variables y estructuras a medida que deduce su propósito, facilitando el análisis de programas complejos o despojados de símbolos.

---

### 5. ¿Qué confirmó GDB que el análisis estático por sí solo no demostraba?
GDB permitió la comprobación empírica en tiempo de ejecución:
1. Validó que el flujo del programa en `main` depende directamente del valor retornado en el registro `RAX` (`0` para clave errónea, `1` para clave válida).
2. Permitió observar el estado real de los registros del procesador (`RDI`, `RAX`, banderas `ZF`) en los puntos de decisión críticos.
3. Descartó posibles mecanismos de ofuscación dinámica, trampas anti-análisis o corrupción de memoria que el análisis puramente estático no puede prever con total certeza.

---

### 6. ¿Por qué Burp Suite no es una herramienta de ingeniería inversa de binarios?
Porque Burp Suite está diseñado exclusivamente como un **proxy de interceptación y auditoría para aplicaciones web** que operan sobre la capa de aplicación de la red (protocolos HTTP, HTTPS y WebSockets). Burp Suite analiza el tráfico entre cliente y servidor. 
En cambio, la ingeniería inversa de binarios requiere analizar archivos ejecutables compilados a código de máquina nativo (ELF, PE, Mach-O), inspeccionando registros del procesador, llamadas al sistema (syscalls), desensamblado de instrucciones x86/ARM y gestión de memoria, tareas para las cuales se requieren herramientas como Ghidra, IDA Pro, Binary Ninja, Radare2 o GDB.

---

### 7. ¿Qué controles de desarrollo evitarían embebidos inseguros de secretos en software real?
Para mitigar la exposición de secretos en software en producción, se deben aplicar los siguientes controles:
1. **Gestores centralizados de secretos:** Utilizar bóvedas seguras como HashiCorp Vault, AWS Secrets Manager, Azure Key Vault o Google Cloud Secret Manager.
2. **Inyección en tiempo de despliegue:** Suministrar credenciales y claves mediante variables de entorno protegidas o montajes de secretos en contenedores, evitando versionarlos en Git.
3. **Escaneo automatizado de código (SAST / Secret Scanning):** Implementar herramientas como TruffleHog, GitGuardian o Semgrep en los flujos de integración continua (CI/CD) para bloquear cualquier commit que contenga cadenas sensibles o patrones de credenciales.
4. **Validación en el servidor (Zero-Trust Client):** Nunca almacenar claves de validación maestras ni algoritmos de licencia críticos en software que se distribuye al cliente final; toda autenticación debe validarse en un backend seguro mediante firmas digitales asimétricas o hashes robustos (Argon2, PBKDF2).
