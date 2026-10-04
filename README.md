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

## Uso responsable de IA

Se utilizó asistencia de IA como apoyo para revisar la redacción y organizar el análisis. Las conclusiones deben contrastarse con las capturas, los logs y la ejecución de las herramientas incluidas como evidencia.
