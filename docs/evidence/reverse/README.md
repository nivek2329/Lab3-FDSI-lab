# Evidencia: Reverse Engineering CTF

Índice de la evidencia por punto de la guía. Las capturas se muestran aquí mismo y están agrupadas en el orden del procedimiento; cada una tiene una breve descripción.

| Punto de la guía | Documento | Resultado |
|---|---|---|
| 0. Preparación | [`baseline.md`](baseline.md) | Entorno WSL, herramientas y copia de binarios |
| 1. Baseline forense | [`baseline.md`](baseline.md) | ELF64 x86-64 dinámicos; hashes verificados |
| 2. Nivel 1 | [`level1.md`](level1.md) | `FLAG{strings_are_evidence}` |
| 3. Nivel 2 (Ghidra) | [`level2.md`](level2.md) | `FDSI-REVERSE-2026` · `FLAG{ghidra_plus_gdb}` |
| 4. Confirmación con GDB | [`gdb.md`](gdb.md) | Retornos 0 y 1 comprobados |
| 5. Boss (stripped) | [`boss.md`](boss.md) | Validación recuperada sin símbolos |
| Preguntas de análisis | [`preguntas-analisis.md`](preguntas-analisis.md) | 7 respuestas |


## Puntos 0–1 · Preparación y baseline forense

### Paso 0 · directorio ~/fdsi-reverse y copia de los binarios

![Paso 0 · directorio ~/fdsi-reverse y copia de los binarios](screenshots/01_paso0_copia_binarios_fdsi-reverse.png)

### Paso 0 · instalación de binutils, gdb y file

![Paso 0 · instalación de binutils, gdb y file](screenshots/02_paso0_instalacion_binutils_gdb_file.png)

### Paso 0-1 · file y sha256sum

![Paso 0-1 · file y sha256sum](screenshots/03_paso0-1_file_y_sha256_hashes.png)

### Paso 0 · carpeta de evidencia en el repo

![Paso 0 · carpeta de evidencia en el repo](screenshots/04_paso0_estructura_docs_evidence_reverse.png)

### Paso 1 · readelf -h

![Paso 1 · readelf -h](screenshots/05_paso1_readelf_cabeceras_elf.png)


## Punto 2 · Nivel 1

### Nivel 1 · ejecución con dato falso

![Nivel 1 · ejecución con dato falso](screenshots/06_nivel1_ejecucion_access_denied.png)

### Nivel 1 · strings

![Nivel 1 · strings](screenshots/07_nivel1_strings_password_embebido.png)

### Nivel 1 · objdump de main

![Nivel 1 · objdump de main](screenshots/08a_nivel1_objdump_main_strcmp.png)

### Nivel 1 · objdump .rodata

![Nivel 1 · objdump .rodata](screenshots/08b_nivel1_objdump_rodata_redteam101.png)
### Nivel 1 · FLAG obtenida

![Nivel 1 · FLAG obtenida](screenshots/09_nivel1_access_granted_flag.png)


## Punto 3 · Nivel 2 con Ghidra

### Nivel 2 · ejecución y strings

![Nivel 2 · ejecución y strings](screenshots/10_nivel2_ejecucion_invalid_y_strings.png)

### Nivel 2 · objdump .rodata

![Nivel 2 · objdump .rodata](screenshots/11_nivel2_objdump_rodata_bytes_no_legibles.png)

### Nivel 2 · Ghidra iniciado

![Nivel 2 · Ghidra iniciado](screenshots/12_nivel2_ghidra_iniciado.png)

### Nivel 2 · proyecto Non-Shared

![Nivel 2 · proyecto Non-Shared](screenshots/13_nivel2_ghidra_proyecto_nonshared.png)

### Nivel 2 · importación ELF

![Nivel 2 · importación ELF](screenshots/14a_nivel2_ghidra_import_elf_x86-64.png)

### Nivel 2 · resumen de importación

![Nivel 2 · resumen de importación](screenshots/14b_nivel2_ghidra_import_results_summary.png)

### Nivel 2 · main decompilado

![Nivel 2 · main decompilado](screenshots/15_nivel2_ghidra_main_decompilado.png)

### Nivel 2 · validate_key original

![Nivel 2 · validate_key original](screenshots/16a_nivel2_ghidra_validate_key_original.png)

### Nivel 2 · validate_key renombrado

![Nivel 2 · validate_key renombrado](screenshots/16b_nivel2_ghidra_validate_key_renombrado_xor.png)

### Nivel 2 · validate_key con comentario

![Nivel 2 · validate_key con comentario](screenshots/16c_nivel2_ghidra_validate_key_comentario_xor.png)

### Nivel 2 · arreglo k en el Listing

![Nivel 2 · arreglo k en el Listing](screenshots/17a_nivel2_ghidra_listing_k_23-51-17-6a.png)

### Nivel 2 · arreglo expected en el Listing

![Nivel 2 · arreglo expected en el Listing](screenshots/17b_nivel2_ghidra_listing_expected_17_bytes.png)

### Nivel 2 · clave válida y FLAG (WSL)

![Nivel 2 · clave válida y FLAG (WSL)](screenshots/18_nivel2_wsl_clave_valida_flag.png)

### Nivel 2 · objdump validate_key (WSL) parte 1

![Nivel 2 · objdump validate_key (WSL) parte 1](screenshots/18b_nivel2_wsl_objdump_validate_key_parte1.png)

### Nivel 2 · objdump validate_key (WSL) parte 2

![Nivel 2 · objdump validate_key (WSL) parte 2](screenshots/18c_nivel2_wsl_objdump_validate_key_parte2.png)


## Punto 4 · Confirmación dinámica con GDB

### GDB · retorno 0 vs 1 (WSL)

![GDB · retorno 0 vs 1 (WSL)](screenshots/19_gdb_wsl_validate_key_retorno_0_vs_1.png)

### GDB · disassemble validate_key (WSL)

![GDB · disassemble validate_key (WSL)](screenshots/19b_gdb_wsl_disassemble_validate_key.png)

### GDB · registros y retorno (WSL)

![GDB · registros y retorno (WSL)](screenshots/19c_gdb_wsl_registros_retorno_0_vs_1_flag.png)


## Punto 5 · Boss Level stripped

### Boss · file, nm -D, strings (WSL)

![Boss · file, nm -D, strings (WSL)](screenshots/20a_boss_wsl_file_nm_strings.png)

### Boss · objdump de main (WSL)

![Boss · objdump de main (WSL)](screenshots/20b_boss_wsl_objdump_main_call_401156.png)

### Boss · GDB por dirección (WSL)

![Boss · GDB por dirección (WSL)](screenshots/20c_boss_wsl_gdb_break_por_direccion_flag.png)

### Boss · nm sin símbolos (WSL)

![Boss · nm sin símbolos (WSL)](screenshots/20d_boss_wsl_nm_no_symbols.png)

### Boss · importación en Ghidra

![Boss · importación en Ghidra](screenshots/21_boss_ghidra_import_stripped_sin_simbolos.png)

### Boss · entry y __libc_start_main

![Boss · entry y __libc_start_main](screenshots/22_boss_ghidra_entry_libc_start_main_FUN_00401267.png)

### Boss · main identificado

![Boss · main identificado](screenshots/23_boss_ghidra_FUN_00401267_es_main.png)

### Boss · funciones renombradas

![Boss · funciones renombradas](screenshots/24_boss_ghidra_main_renombrado_xrefs.png)

### Boss · validación recuperada

![Boss · validación recuperada](screenshots/25_boss_ghidra_validacion_recuperada_DAT_00402090_DAT_0040208b.png)

## Material complementario

- [Logs de consola y GDB](logs/README.md).
- [Índice de capturas](screenshots/README.md).
- [Análisis consolidado y guion de cierre](../../../reverse-analysis.md).
- [README del laboratorio](../../../README.md).
