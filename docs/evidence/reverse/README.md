# Evidencia: Reverse Engineering CTF

Índice de la evidencia por punto de la guía. Cada documento sigue el orden **hipótesis → evidencia → resultado**.

| Punto de la guía | Documento | Resultado |
|---|---|---|
| 0. Preparación | [`baseline.txt`](baseline.txt) (sección de evidencia visual) | entorno WSL con binutils, gdb y file; binarios copiados |
| 1. Baseline forense | [`baseline.txt`](baseline.txt) | ELF64 x86-64 dinámicos; hashes verificados |
| 2. Nivel 1 | [`level1.md`](level1.md) | `FLAG{strings_are_evidence}` |
| 3. Nivel 2 (Ghidra) | [`level2.md`](level2.md) | clave `FDSI-REVERSE-2026` · `FLAG{ghidra_plus_gdb}` |
| 4. Confirmación con GDB | [`gdb.md`](gdb.md) | retorno de la validación: 0 (fallida) vs 1 (válida) |
| 5. Boss (stripped) | [`boss.md`](boss.md) | validación recuperada sin símbolos |
| Preguntas de análisis | [`preguntas-analisis.md`](preguntas-analisis.md) | 7 respuestas |

Carpetas de apoyo:

- [`screenshots/`](screenshots/): capturas numeradas por paso ([índice](screenshots/README.md)).
- [`logs/`](logs/): salidas completas de terminal y GDB ([índice](logs/README.md)).

Resumen general, guion del cierre de 3 minutos y conclusiones: [`../../../reverse-analysis.md`](../../../reverse-analysis.md) · README del laboratorio: [`../../../README.md`](../../../README.md)
