# Confirmación dinámica con GDB

**Binario:** `crackme_level2` (con símbolos) y `crackme_level2_stripped` (Boss).
**Objetivo:** demostrar en ejecución, no adivinar, que el pseudocódigo reconstruido en Ghidra es correcto.
**Entornos:** sesión principal en WSL Ubuntu del equipo (capturas 18 y 19). Las sesiones detalladas de `logs/` corrieron en Linux x86-64 con GNU gdb 15.1. Los binarios son los originales; el SHA-256 coincide con el de la guía.

Las sesiones completas están en `logs/` y se reproducen con los comandos que aparecen en cada sección.

## 0. Sesión en WSL Ubuntu (equipo del estudiante)

```bash
gdb -q ./crackme_level2 -ex "break validate_key" -ex "run AAAA" -ex "finish" \
    -ex "run FDSI-REVERSE-2026" -ex "finish" -ex "continue" -ex "quit"
```

| Ejecución | Se detiene en | `finish` → valor de retorno | Salida del programa |
|---|---|---|---|
| `run AAAA` | `validate_key (candidate="AAAA")` | `Value returned is $1 = 0` | (no llega al mensaje de éxito) |
| `run FDSI-REVERSE-2026` | `validate_key (candidate="FDSI-REVERSE-2026")` | `Value returned is $2 = 1` | `License accepted.` · `FLAG{ghidra_plus_gdb}` |

El retorno de `validate_key` cambia de **0 a 1** solo con la clave reconstruida, y `main` en `0x4012d2` (`test eax,eax`) decide con ese valor.
Evidencia: `screenshots/19_gdb_wsl_validate_key_retorno_0_vs_1.png` · `screenshots/18_nivel2_wsl_clave_valida_flag.png`

![GDB: retorno 0 para clave errónea y 1 para válida](screenshots/19_gdb_wsl_validate_key_retorno_0_vs_1.png)

![Nivel 2: clave válida y FLAG en WSL](screenshots/18_nivel2_wsl_clave_valida_flag.png)

![GDB: desensamblado de validate_key](screenshots/19b_gdb_wsl_disassemble_validate_key.png)

![GDB: registros, retornos y FLAG](screenshots/19c_gdb_wsl_registros_retorno_0_vs_1_flag.png)

Las secciones siguientes amplían la sesión con registros y memoria (longitud, operandos del XOR, acumulador `score`).

---

## 1. Puntos de interrupción usados (relación con Ghidra)

| Dirección | Instrucción | Qué representa en el pseudocódigo |
|---|---|---|
| `0x401156` / `validate_key` | inicio de la función | entrada `candidate` en `RDI` |
| `0x401176` | `cmp [rbp-0x18], rax` | `strlen(candidate) == 0x11` (`RAX` = longitud real, `[rbp-0x18]` = 17) |
| `0x4011b9` | `xor eax, ecx` | `transformed = candidate[i] ^ k[i & 3]` (`ECX` = carácter, `EAX` = byte de `k`) |
| `0x4011d5` | `or [rbp-0x4], eax` | `score \|= expected[i] ^ transformed` |
| `0x4011e7` | `cmp [rbp-0x4], 0` / `sete al` | retorno `score == 0` |
| `0x4012d2` (en `main`) | `test eax, eax` | decisión `License accepted` / `Invalid license` |

## 2. Caso A: clave fallida por longitud (`AAAA`)

Log: `logs/gdb_19a_clave_fallida.txt`

```text
(gdb) break validate_key
(gdb) break *0x401176
(gdb) run AAAA
Breakpoint 1, validate_key (candidate=0x7fffffff9963 "AAAA")
(gdb) x/s $rdi
0x7fffffff9963: "AAAA"
(gdb) continue
Breakpoint 2, 0x0000000000401176 in validate_key (...)
(gdb) info registers rax
rax            0x4                 4          <- strlen("AAAA")
(gdb) x/gx $rbp-0x18
0x7fffffff8fd8: 0x0000000000000011            <- longitud esperada = 17
(gdb) finish
Value returned is $1 = 0
(gdb) info registers eax
eax            0x0                 0
(gdb) continue
Invalid license.
[Inferior 1 exited with code 03]
```

**Conclusión:** `4 != 17`, así que la función retorna 0 sin entrar al ciclo. `main` imprime `Invalid license.` y sale con código 3, como en el pseudocódigo.

## 3. Caso B: longitud correcta, contenido incorrecto (17 x `A`)

Log: `logs/gdb_19b_longitud_ok_contenido_incorrecto.txt`

```text
(gdb) break *0x4011b9
(gdb) break *0x4011e7
(gdb) run AAAAAAAAAAAAAAAAA
Breakpoint 1, validate_key (candidate='A' <repeats 17 times>)
(gdb) printf "i=%d candidate[i]=0x%02x k[i%%4]=0x%02x\n", *(long*)($rbp-0x10), $ecx, $eax & 0xff
i=0  candidate[i]=0x41  k[i%4]=0x23           <- operandos del XOR
(gdb) continue
Breakpoint 2, validate_key (...)
(gdb) printf "score = 0x%x\n", *(unsigned int*)($rbp-0x4)
score = 0x7f                                   <- hubo diferencias
(gdb) finish
Value returned is $1 = 0
Invalid license.
```

**Conclusión:** pasa el filtro de longitud y recorre el ciclo, pero `score != 0`, así que es inválida. En el registro se ve el XOR entre el carácter (`0x41`) y `k[0]` (`0x23`), tal como lo muestra el decompilador.

## 4. Caso C: clave reconstruida (`FDSI-REVERSE-2026`)

Log: `logs/gdb_19c_clave_valida.txt`

```text
(gdb) run FDSI-REVERSE-2026
Breakpoint 1, validate_key (candidate="FDSI-REVERSE-2026")
(gdb) printf ...
i=0  candidate[i]=0x46  k[i%4]=0x23           <- 0x46 ^ 0x23 = 0x65 = expected[0]
(gdb) continue
Breakpoint 2, validate_key (...)
(gdb) printf "score = 0x%x\n", *(unsigned int*)($rbp-0x4)
score = 0x0                                    <- ninguna diferencia
(gdb) finish
Value returned is $1 = 1
(gdb) info registers eax
eax            0x1                 1
(gdb) continue
License accepted.
FLAG{ghidra_plus_gdb}
[Inferior 1 exited normally]
```

**Conclusión:** con la clave reconstruida, `score` termina en 0 y `validate_key` retorna **1**. `main` toma el camino de éxito y `reveal_flag` imprime la FLAG.

## 5. ¿Qué confirmó GDB que el análisis estático no demostraba?

- Que la hipótesis funciona **en ejecución real**: el retorno cambia de 0 a 1 solo con la clave reconstruida.
- Los valores concretos en registros y memoria: longitud real contra la esperada, operandos del XOR y valor final del acumulador `score`.
- Que la decisión depende únicamente de `EAX` al volver de `validate_key`, que es lo que evalúa `test eax,eax` en `main`.
- Que el bucle procesa los 17 bytes cuando la longitud es válida, sin salir al primer byte distinto. Esto no demuestra que toda la función tenga tiempo constante.

## 6. Boss: la misma confirmación sin símbolos

Log: `logs/gdb_26_boss_stripped.txt`

```text
(gdb) break validate_key
Function "validate_key" not defined.          <- el nombre ya no existe
(gdb) break *0x401156                          <- dirección hallada por flujo (entry -> main -> call)
(gdb) break *0x4011e7
(gdb) run FDSI-REVERSE-2026
Breakpoint 1, 0x0000000000401156 in ?? ()
(gdb) x/s $rdi
0x7fffffff994d: "FDSI-REVERSE-2026"
(gdb) continue
Breakpoint 2, 0x00000000004011e7 in ?? ()
(gdb) printf "score = 0x%x\n", *(unsigned int*)($rbp-0x4)
score = 0x0
(gdb) finish
(gdb) info registers eax
eax            0x1                 1
License accepted.
FLAG{ghidra_plus_gdb}
```

Sin símbolos, GDB muestra `?? ()` en lugar de nombres, pero el código máquina es idéntico. Los breakpoints por **dirección** funcionan igual.

Misma prueba en WSL: `Function "validate_key" not defined`, `Breakpoint 2, 0x401156 in ?? ()`, `x/s $rdi` = `"FDSI-REVERSE-2026"`, `eax 0x1`, FLAG.
Evidencia: `screenshots/20c_boss_wsl_gdb_break_por_direccion_flag.png`

![Boss: breakpoint por dirección y FLAG en GDB](screenshots/20c_boss_wsl_gdb_break_por_direccion_flag.png)

---

## 7. Complemento: banderas y salto condicional (aporte de Daniel Peña)

**Análisis de la prueba fallida:**
* Al alcanzar el final de `validate_key`, el valor devuelto en el registro acumulador `RAX` es `0`.
* En la función `main` (dirección `0x4012d2`), se ejecuta la instrucción:
  ```nasm
  4012d2: test   eax, eax
  4012d4: je     4012f1 <main+0x8a>
  ```
* Dado que `EAX == 0`, la bandera *Zero Flag* (`ZF`) se activa a `1`, provocando el salto condicional `je` hacia la rutina de fallo que imprime `"Invalid license."` y finaliza con código de salida `3`.


**Análisis de la confirmación:**
* Con la clave `FDSI-REVERSE-2026`, todos los bytes transformados coincidieron con el arreglo esperado, por lo que el acumulador interno finalizó en `0`.
* La instrucción `sete al` cargó el valor `1` en `AL` (`RAX = 1`).
* En `main`, `test eax, eax` no activa la bandera de cero (`ZF = 0`), de modo que el salto condicional `je` **no se toma**.
* El flujo continúa secuencialmente hacia la invocación de `puts("License accepted.")` y la posterior rutina `reveal_flag()`, imprimiendo la bandera oficial `FLAG{ghidra_plus_gdb}`.


### Capturas del equipo (GitHub)

<img width="950" height="522" alt="image" src="https://github.com/user-attachments/assets/a635ba67-28c4-4bb6-9b2b-d8615e3154a6" />
<img width="954" height="774" alt="image" src="https://github.com/user-attachments/assets/1ca667c7-1bd2-4a8d-81b6-d488109385b3" />
