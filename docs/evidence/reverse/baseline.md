# Punto 0–1 · Preparación y baseline forense

Este paso prepara el entorno de análisis, verifica los tres ejecutables entregados e identifica su formato y arquitectura. El registro completo de comandos, cabeceras y hashes está en [`baseline.txt`](baseline.txt).

## Evidencias visuales

### Copia de los binarios al directorio de trabajo

![Paso 0: copia de los binarios](screenshots/01_paso0_copia_binarios_fdsi-reverse.png)

### Instalación de binutils, GDB y file

![Paso 0: herramientas instaladas en WSL](screenshots/02_paso0_instalacion_binutils_gdb_file.png)

### Identificación ELF y hashes SHA-256

![Paso 0–1: tipo ELF y hashes](screenshots/03_paso0-1_file_y_sha256_hashes.png)

### Organización de los documentos de evidencia

![Paso 0: estructura de docs/evidence/reverse](screenshots/04_paso0_estructura_docs_evidence_reverse.png)

### Cabeceras ELF con readelf

![Paso 1: cabeceras ELF inspeccionadas con readelf](screenshots/05_paso1_readelf_cabeceras_elf.png)

## Resultado

Los tres archivos son ejecutables ELF64 para x86-64. `crackme_level1` y `crackme_level2` conservan símbolos de depuración; `crackme_level2_stripped` no los conserva. Los hashes SHA-256 documentados permiten comprobar la integridad de los binarios.
