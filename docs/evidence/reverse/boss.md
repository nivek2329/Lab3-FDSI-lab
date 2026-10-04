# Boss Level: binario sin símbolos (`crackme_level2_stripped`)

## ¿Qué desapareció al hacer strip?

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
Evidencia (WSL): `screenshots/20a_boss_wsl_file_nm_strings.png` · `20d_boss_wsl_nm_no_symbols.png` · Log: `logs/boss_20_nm_strings_readelf.txt`

![Boss: file, nm y strings del binario stripped](screenshots/20a_boss_wsl_file_nm_strings.png)

![Boss: nm confirma la ausencia de símbolos](screenshots/20d_boss_wsl_nm_no_symbols.png)

## Cómo se encontró la validación sin nombres

1. **Punto de entrada:** `entry` (`0x401070`) carga `MOV RDI, FUN_00401267` y llama a `__libc_start_main`. Por convención, el primer argumento es `main`, así que `FUN_00401267` = **main**.
   Captura: `screenshots/22_boss_ghidra_entry_libc_start_main_FUN_00401267.png`

![Boss: seguimiento desde entry hasta main](screenshots/22_boss_ghidra_entry_libc_start_main_FUN_00401267.png)
2. **Referencias a cadenas:** en `FUN_00401267` aparecen `puts("License accepted.")` / `puts("Invalid license.")`. La rama la decide `iVar1 = FUN_00401156(param_2[1])`, es decir, la función que recibe `argv[1]`. Se renombró a `validate_key_recuperada`, y `FUN_004011f3` (llamada en el camino de éxito) a `reveal_flag_recuperada`.
   Capturas: `23_boss_ghidra_FUN_00401267_es_main.png`, `24_boss_ghidra_main_renombrado_xrefs.png`

![Boss: main identificado en Ghidra](screenshots/23_boss_ghidra_FUN_00401267_es_main.png)

![Boss: función renombrada y referencias cruzadas](screenshots/24_boss_ghidra_main_renombrado_xrefs.png)
3. **Comportamiento:** `FUN_00401156` llama a `strlen` y compara con `0x11`, recorre 17 bytes, aplica XOR con `DAT_0040208b[i & 3]` y acumula con OR contra `DAT_00402090[i]`. Es **la misma lógica del Nivel 2**, solo que con `DAT_xxx` en lugar de `k` / `expected`.
   Captura: `25_boss_ghidra_validacion_recuperada_DAT_00402090_DAT_0040208b.png`

![Boss: validación reconstruida desde los datos](screenshots/25_boss_ghidra_validacion_recuperada_DAT_00402090_DAT_0040208b.png)
4. **Confirmación:** en GDB, `break validate_key` falla (`Function not defined`), pero `break *0x401156` y `break *0x4011e7` funcionan. Con `FDSI-REVERSE-2026` se obtiene `score = 0`, `EAX = 1` y la FLAG.
   Evidencia (WSL): `screenshots/20b_boss_wsl_objdump_main_call_401156.png` (en `main`: `call 401156` → `test eax,eax` → `je` → `lea 402068 "License accepted."` / `lea 40207a "Invalid license."`) · `screenshots/20c_boss_wsl_gdb_break_por_direccion_flag.png` · Log: `logs/gdb_26_boss_stripped.txt`

![Boss: llamada a la validación en objdump](screenshots/20b_boss_wsl_objdump_main_call_401156.png)

![Boss: breakpoint por dirección y FLAG en GDB](screenshots/20c_boss_wsl_gdb_break_por_direccion_flag.png)

Importación en Ghidra (sin nombres de fuente, 32 símbolos frente a 55 del binario con símbolos): `screenshots/21_boss_ghidra_import_stripped_sin_simbolos.png`

![Boss: importación del binario stripped en Ghidra](screenshots/21_boss_ghidra_import_stripped_sin_simbolos.png)

Confirmación dinámica detallada: [`gdb.md`](gdb.md), sección 6.
