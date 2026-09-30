# Validación Dinámica de Ejecución con GDB

## 1. Objetivo
Demostrar en tiempo de ejecución, mediante puntos de interrupción (*breakpoints*) e inspección directa de registros del procesador en el depurador GNU (`gdb`), que el comportamiento del programa y la obtención de la bandera dependen exclusivamente del valor devuelto por la función de validación en el registro de retorno (`RAX`).

---

## 2. Metodología de Depuración

Se utilizó el binario `crackme_level2` compilado con arquitectura x86-64 y formato ELF.

### A. Configuración de Sintaxis e Inserción de Breakpoint
```text
$ gdb -q ./crackme_level2
Reading symbols from ./crackme_level2...
(gdb) set disassembly-flavor intel
(gdb) break validate_key
Breakpoint 1 at 0x401156: file crackme_level2.c, line 12.
```
<img width="950" height="522" alt="image" src="https://github.com/user-attachments/assets/a635ba67-28c4-4bb6-9b2b-d8615e3154a6" />

---

### B. Prueba con Clave Inválida (`CLAVE_ERRONEA`)
Se ejecutó el programa suministrando una clave incorrecta:
```text
(gdb) run CLAVE_ERRONEA
Starting program: /home/daniel/Lab3-FDSI-lab/crackme_level2 CLAVE_ERRONEA
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.

Breakpoint 1, validate_key (candidate=0x7fffffffe342 "CLAVE_ERRONEA") at crackme_level2.c:12
(gdb) finish
Run till exit from #0  validate_key (candidate=0x7fffffffe342 "CLAVE_ERRONEA") at crackme_level2.c:12
0x00000000004012d2 in main ()
Value returned is $1 = 0
(gdb) info registers rax
rax            0x0                 0
(gdb) continue
Continuing.
Invalid license.
[Inferior 1 (process 4125) exited with code 03]
```

**Análisis de la prueba fallida:**
* Al alcanzar el final de `validate_key`, el valor devuelto en el registro acumulador `RAX` es `0`.
* En la función `main` (dirección `0x4012d2`), se ejecuta la instrucción:
  ```nasm
  4012d2: test   eax, eax
  4012d4: je     4012f1 <main+0x8a>
  ```
* Dado que `EAX == 0`, la bandera *Zero Flag* (`ZF`) se activa a `1`, provocando el salto condicional `je` hacia la rutina de fallo que imprime `"Invalid license."` y finaliza con código de salida `3`.

---

### C. Prueba con la Clave Reconstruida (`FDSI-REVERSE-2026`)
Se reanudó la ejecución suministrando la clave válida derivada en Ghidra:
```text
(gdb) run FDSI-REVERSE-2026
Starting program: /home/daniel/Lab3-FDSI-lab/crackme_level2 FDSI-REVERSE-2026
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.

Breakpoint 1, validate_key (candidate=0x7fffffffe342 "FDSI-REVERSE-2026") at crackme_level2.c:12
(gdb) info registers rdi
rdi            0x7fffffffe342      140737488347970
(gdb) x/s $rdi
0x7fffffffe342: "FDSI-REVERSE-2026"
(gdb) finish
Run till exit from #0  validate_key (candidate=0x7fffffffe342 "FDSI-REVERSE-2026") at crackme_level2.c:12
0x00000000004012d2 in main ()
Value returned is $2 = 1
(gdb) info registers rax
rax            0x1                 1
(gdb) continue
Continuing.
License accepted.
FLAG{ghidra_plus_gdb}
[Inferior 1 (process 4130) exited normally]
```
<img width="954" height="774" alt="image" src="https://github.com/user-attachments/assets/1ca667c7-1bd2-4a8d-81b6-d488109385b3" />

**Análisis de la confirmación:**
* Con la clave `FDSI-REVERSE-2026`, todos los bytes transformados coincidieron con el arreglo esperado, por lo que el acumulador interno finalizó en `0`.
* La instrucción `sete al` cargó el valor `1` en `AL` (`RAX = 1`).
* En `main`, `test eax, eax` no activa la bandera de cero (`ZF = 0`), de modo que el salto condicional `je` **no se toma**.
* El flujo continúa secuencialmente hacia la invocación de `puts("License accepted.")` y la posterior rutina `reveal_flag()`, imprimiendo la bandera oficial `FLAG{ghidra_plus_gdb}`.

### Evidencia Visual de Depuración con GDB:
![Sesión de depuración interactiva en GDB con breakpoints y registros](screenshots/screenshot_gdb.png)

---

## 3. Conclusión
La depuración dinámica confirmó sin margen de error la hipótesis derivada en el análisis estático. Permitió constatar el valor real de los registros de la arquitectura x86-64 en memoria y demostró cómo un cambio en el bit de retorno altera de forma determinista el flujo de control del ejecutable.
