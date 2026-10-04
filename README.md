# Laboratorio 4 — Ingeniería inversa

Repositorio de entrega del laboratorio 4 de Fundamentos de Seguridad Informática. Incluye el paquete de trabajo, la guía con el desarrollo por pasos, las evidencias capturadas en Ghidra y terminal, y el análisis consolidado.

## Contenido del laboratorio

- [`FDSI_Guia2_Reverse_Engineering_ESTUDIANTES/`](FDSI_Guia2_Reverse_Engineering_ESTUDIANTES/): binarios y guía de la actividad.
- [`docs/evidence/reverse/README.md`](docs/evidence/reverse/README.md): índice de evidencias y resultados por punto.
- [`docs/evidence/reverse/baseline.txt`](docs/evidence/reverse/baseline.txt): preparación, identificación y hashes de los binarios.
- [`docs/evidence/reverse/level1.md`](docs/evidence/reverse/level1.md): análisis del nivel 1.
- [`docs/evidence/reverse/level2.md`](docs/evidence/reverse/level2.md): análisis del nivel 2 en Ghidra.
- [`docs/evidence/reverse/gdb.md`](docs/evidence/reverse/gdb.md): comprobación dinámica con GDB.
- [`docs/evidence/reverse/boss.md`](docs/evidence/reverse/boss.md): análisis del binario stripped.
- [`docs/evidence/reverse/preguntas-analisis.md`](docs/evidence/reverse/preguntas-analisis.md): respuestas de análisis.
- [`docs/evidence/reverse/logs/`](docs/evidence/reverse/logs/): salidas de consola y sesiones de depuración.
- [`docs/evidence/reverse/screenshots/`](docs/evidence/reverse/screenshots/): capturas numeradas, organizadas e identificadas en su índice.
- [`reverse-analysis.md`](reverse-analysis.md): síntesis técnica y guion para la presentación.

## Resultados

| Reto | Hallazgo | Evidencia principal |
|---|---|---|
| Nivel 1 | `FLAG{strings_are_evidence}` | [`level1.md`](docs/evidence/reverse/level1.md) |
| Nivel 2 | `FLAG{ghidra_plus_gdb}` | [`level2.md`](docs/evidence/reverse/level2.md), [`gdb.md`](docs/evidence/reverse/gdb.md) |
| Boss stripped | `FLAG{ghidra_plus_gdb}` | [`boss.md`](docs/evidence/reverse/boss.md) |

## Reproducción

1. Consulta [`README_ESTUDIANTE.md`](FDSI_Guia2_Reverse_Engineering_ESTUDIANTES/README_ESTUDIANTE.md) para los requisitos y el procedimiento de la actividad.
2. Sigue [`docs/evidence/reverse/README.md`](docs/evidence/reverse/README.md) en orden. Cada sección enlaza las capturas y los logs que respaldan el resultado.
3. Para el análisis detallado y el guion de cierre, consulta [`reverse-analysis.md`](reverse-analysis.md).

## Evidencias visuales por punto

Las capturas principales se muestran a continuación. El [índice de evidencias](docs/evidence/reverse/README.md) contiene la galería completa organizada por cada punto de la guía, con todas las capturas, sus descripciones y enlaces a los análisis.

### Puntos 0–1 · Preparación y baseline

![Hashes SHA-256 y tipo de archivo ELF](docs/evidence/reverse/screenshots/03_paso0-1_file_y_sha256_hashes.png)

### Punto 2 · Nivel 1

![Contraseña visible con strings](docs/evidence/reverse/screenshots/07_nivel1_strings_password_embebido.png)

![Bandera obtenida en el nivel 1](docs/evidence/reverse/screenshots/09_nivel1_access_granted_flag.png)

### Punto 3 · Nivel 2 con Ghidra

![Función principal decompilada en Ghidra](docs/evidence/reverse/screenshots/15_nivel2_ghidra_main_decompilado.png)

![Validación XOR analizada en Ghidra](docs/evidence/reverse/screenshots/16b_nivel2_ghidra_validate_key_renombrado_xor.png)

![Bandera obtenida tras reconstruir la clave](docs/evidence/reverse/screenshots/18_nivel2_wsl_clave_valida_flag.png)

### Punto 4 · Confirmación con GDB

![GDB compara retornos 0 y 1](docs/evidence/reverse/screenshots/19_gdb_wsl_validate_key_retorno_0_vs_1.png)

### Punto 5 · Boss Level stripped

![Binario stripped importado en Ghidra](docs/evidence/reverse/screenshots/21_boss_ghidra_import_stripped_sin_simbolos.png)

![Validación recuperada en Ghidra](docs/evidence/reverse/screenshots/25_boss_ghidra_validacion_recuperada_DAT_00402090_DAT_0040208b.png)
## Uso responsable de IA

Se utilizó asistencia de IA como apoyo para revisar la redacción y organizar el análisis. Las conclusiones deben contrastarse con las capturas, los logs y la ejecución de las herramientas incluidas como evidencia.
