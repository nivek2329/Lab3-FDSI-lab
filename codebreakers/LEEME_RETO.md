# CODEBREAKERS — El misterio del codigo oculto

## Tu mision
Recibiras un programa ejecutable de laboratorio, pero NO su codigo fuente.
Necesitas descubrir la clave correcta y demostrar que el programa te entrega una bandera (FLAG).
No se trata de adivinar claves ni de entrar en cuentas reales: es un programa creado expresamente para este ejercicio.

## Reglas
- Solo analiza el archivo `reto_codebreakers_linux_x64` que te entrega el monitor.
- No lo modifiques ni uses programas ajenos o desconocidos.
- No utilices claves, equipos, servidores o cuentas de otras personas.

## Primer intento (Linux o WSL de Windows)
Desde la carpeta donde guardaste el archivo:

```bash
chmod +x reto_codebreakers_linux_x64
./reto_codebreakers_linux_x64
```

Prueba una palabra cualquiera. Probablemente dira ACCESO DENEGADO.

## Tu investigacion
1. Importa el archivo en Ghidra (instalado de antemano por el equipo docente).
2. Haz el analisis automatico.
3. Busca texto dentro del binario con `Search > for Strings`.
4. Encuentra una pista de la clave.
5. Localiza el codigo que compara la entrada con la clave (consulta la vista Decompiler).
6. Ejecuta otra vez el programa y escribe la clave descubierta.
7. Muestra al monitor la FLAG obtenida.

## Evidencia que presentas
- Cual es la clave (comentasela al monitor, no la publiques antes de que tus companeros lo intenten).
- Que palabra o funcion del programa te llevo a esa conclusion.
- Que mensaje produce el programa cuando se introduce la clave correcta.

## Nota de compatibilidad
El archivo suministrado es un ejecutable **ELF de Linux x86-64**. Se puede analizar con Ghidra en Windows, Linux o macOS, pero para ejecutarlo necesitas Linux x86-64 o WSL con Linux en un PC x86-64. Si no dispones de Linux/WSL, pide a un monitor la demostracion en el equipo de laboratorio.
