# Reverse Engineering CTF: análisis consolidado

FDSI 2026-2 · Lab. No. 04 Parte 2 · Ruta local (crackmes ELF x86-64)

| Nivel | Binario | Técnica clave | Resultado |
|---|---|---|---|
| 0-1 Baseline | los tres | `file`, `sha256sum`, `readelf` | hashes verificados contra la guía |
| 1 Recon | `crackme_level1` | `strings` + `objdump` | clave `REDTEAM-101` · `FLAG{strings_are_evidence}` |
| 2 Decompile | `crackme_level2` | Ghidra + GDB | clave `FDSI-REVERSE-2026` · `FLAG{ghidra_plus_gdb}` |
| Boss | `crackme_level2_stripped` | flujo, referencias, Ghidra, GDB por dirección | misma lógica y misma clave recuperadas sin símbolos |

Detalle: [`docs/evidence/reverse/baseline.txt`](docs/evidence/reverse/baseline.txt) · [`level1.md`](docs/evidence/reverse/level1.md) · [`level2.md`](docs/evidence/reverse/level2.md) · [`gdb.md`](docs/evidence/reverse/gdb.md) · [`boss.md`](docs/evidence/reverse/boss.md) · [`preguntas-analisis.md`](docs/evidence/reverse/preguntas-analisis.md)

---

## Boss Level: binario sin símbolos

### ¿Qué desapareció al hacer strip?

```text
$ file crackme_level2_stripped
... dynamically linked ... stripped
$ nm crackme_level2_stripped
nm: crackme_level2_stripped: no symbols
$ nm -D crackme_level2_stripped        # solo quedan los imports dinámicos
U __libc_start_main  U printf  U putchar  U puts  U strlen
```

Secciones eliminadas respecto a `crackme_level2` (de 36 a 28): `.symtab`, `.strtab`, `.debug_aranges`, `.debug_info`, `.debug_abbrev`, `.debug_line`, `.debug_str`, `.debug_line_str`.
Por eso se pierden los nombres `main`, `validate_key`, `reveal_flag`, `k`, `expected`, `candidate` y `score`, junto con la relación con el fuente `crackme_level2.c`.
**Lo que NO desaparece:** el código máquina, las cadenas de `.rodata` (`License accepted.`, `Invalid license.`), los datos `23 51 17 6A` y `65 15 44 ...`, y los imports dinámicos (`strlen`, `puts`).
Evidencia (WSL): `docs/evidence/reverse/screenshots/20a_boss_wsl_file_nm_strings.png` · `20d_boss_wsl_nm_no_symbols.png` · Log: `docs/evidence/reverse/logs/boss_20_nm_strings_readelf.txt`

### Cómo se encontró la validación sin nombres

1. **Punto de entrada:** `entry` (`0x401070`) carga `MOV RDI, FUN_00401267` y llama a `__libc_start_main`. Por convención, el primer argumento es `main`, así que `FUN_00401267` = **main**.
   Captura: `screenshots/22_boss_ghidra_entry_libc_start_main_FUN_00401267.png`
2. **Referencias a cadenas:** en `FUN_00401267` aparecen `puts("License accepted.")` / `puts("Invalid license.")`. La rama la decide `iVar1 = FUN_00401156(param_2[1])`, es decir, la función que recibe `argv[1]`. Se renombró a `validate_key_recuperada`, y `FUN_004011f3` (llamada en el camino de éxito) a `reveal_flag_recuperada`.
   Capturas: `23_boss_ghidra_FUN_00401267_es_main.png`, `24_boss_ghidra_main_renombrado_xrefs.png`
3. **Comportamiento:** `FUN_00401156` llama a `strlen` y compara con `0x11`, recorre 17 bytes, aplica XOR con `DAT_0040208b[i & 3]` y acumula con OR contra `DAT_00402090[i]`. Es **la misma lógica del Nivel 2**, solo que con `DAT_xxx` en lugar de `k` / `expected`.
   Captura: `25_boss_ghidra_validacion_recuperada_DAT_00402090_DAT_0040208b.png`
4. **Confirmación:** en GDB, `break validate_key` falla (`Function not defined`), pero `break *0x401156` y `break *0x4011e7` funcionan. Con `FDSI-REVERSE-2026` se obtiene `score = 0`, `EAX = 1` y la FLAG.
   Evidencia (WSL): `screenshots/20b_boss_wsl_objdump_main_call_401156.png` (en `main`: `call 401156` → `test eax,eax` → `je` → `lea 402068 "License accepted."` / `lea 40207a "Invalid license."`) · `screenshots/20c_boss_wsl_gdb_break_por_direccion_flag.png` · Log: `logs/gdb_26_boss_stripped.txt`

Importación en Ghidra (sin nombres de fuente, 32 símbolos frente a 55 del binario con símbolos): `screenshots/21_boss_ghidra_import_stripped_sin_simbolos.png`

---

## Preguntas de análisis

Versión completa, con las respuestas ampliadas del equipo: [`docs/evidence/reverse/preguntas-analisis.md`](docs/evidence/reverse/preguntas-analisis.md)

1. **¿Qué información se obtuvo sin ejecutar el binario?** Formato ELF64 x86-64, linking dinámico, presencia o ausencia de símbolos, librerías importadas (`strcmp`/`strlen`), mensajes, la contraseña del Nivel 1 en texto plano, los arreglos `k` y `expected` del Nivel 2 y el algoritmo completo (vía Ghidra).
2. **¿Por qué una contraseña compilada como string es insegura?** Porque queda tal cual en `.rodata`, y cualquiera con el ejecutable la lee con `strings` en segundos, sin ejecutarlo.
3. **¿Qué cambió entre `crackme_level2` y `crackme_level2_stripped`?** Solo se quitaron metadatos (`.symtab`, `.strtab`, `.debug_*`). El código, los datos y el comportamiento son idénticos, así que la clave y la FLAG son las mismas.
4. **¿Qué ventaja tuvo Ghidra sobre `objdump`?** Decompila a pseudo-C, resuelve referencias a datos y cadenas, muestra XREFs y permite renombrar y comentar. Así se reconstruye el algoritmo sin leer instrucción por instrucción.
5. **¿Qué confirmó GDB que el análisis estático no demostraba?** El comportamiento real: valores en registros (longitud 4 frente a 17, operandos del XOR, `score`), y que el retorno cambia de 0 a 1 solo con la clave reconstruida.
6. **¿Por qué Burp Suite no es una herramienta de reversing de binarios?** Burp intercepta y modifica tráfico HTTP entre cliente y servidor; no desensambla ni decompila código máquina. Analiza el protocolo, no el ejecutable.
7. **¿Qué controles evitarían secretos embebidos?** Validar en servidor; usar firmas asimétricas para licencias (el binario solo lleva la clave pública); guardar hashes lentos con sal en lugar de secretos; usar gestores de secretos o variables de entorno; escanear secretos en CI (gitleaks, trufflehog); revisión de código; distribuir binarios stripped (solo dificulta, no protege).

## Cierre de 3 minutos (guion)

1. **Qué observamos:** tres ELF x86-64 con hashes verificados. El Nivel 1 respondía `Access denied` y `strings` mostraba `REDTEAM-101` junto a los mensajes y a `strcmp`.
2. **Hipótesis:** N1 compara contra una cadena embebida. N2 ya no muestra la clave, así que la transforma byte a byte y la compara con datos de `.rodata`.
3. **Función o condición encontrada:** en N1, `strcmp(argv[1], "REDTEAM-101")`. En N2, `validate_key`: longitud 17 y `candidate[i] ^ k[i%4] == expected[i]` con `k = 23 51 17 6A`. Invertimos el XOR y obtuvimos `FDSI-REVERSE-2026`. En el Boss la ubicamos sin nombres: `entry` → `__libc_start_main(main)` → la llamada que decide entre `License accepted` e `Invalid license`.
4. **Cómo lo confirmamos:** ejecutando con la clave y con GDB, donde el retorno pasa de 0 a 1, `score` queda en 0 y aparece la FLAG. También funciona por dirección en el binario stripped.
5. **Lección de desarrollo seguro:** todo lo que se distribuye al cliente puede leerse. XOR no es cifrado y strip no es protección; los secretos y las validaciones de licencia deben vivir en el servidor o basarse en criptografía asimétrica.
