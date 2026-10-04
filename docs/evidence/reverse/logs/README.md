# Logs de terminal y GDB

Salidas de texto completas que complementan las capturas. Se generaron en un entorno Linux x86-64 con GNU gdb 15.1, usando los mismos binarios (SHA-256 verificado). Las ejecuciones equivalentes en WSL del equipo están en `../screenshots/` (18-20d).

| Archivo | Contenido | Usado en |
|---|---|---|
| [`nivel2_18_clave_y_flag.txt`](nivel2_18_clave_y_flag.txt) | Clave reconstruida y ejecución fallida/válida | [`level2.md`](../level2.md) |
| [`gdb_19a_clave_fallida.txt`](gdb_19a_clave_fallida.txt) | GDB con `AAAA` | [`gdb.md`](../gdb.md) |
| [`gdb_19b_longitud_ok_contenido_incorrecto.txt`](gdb_19b_longitud_ok_contenido_incorrecto.txt) | GDB con 17 caracteres incorrectos | [`gdb.md`](../gdb.md) |
| [`gdb_19c_clave_valida.txt`](gdb_19c_clave_valida.txt) | GDB con la clave válida | [`gdb.md`](../gdb.md) |
| [`boss_20_nm_strings_readelf.txt`](boss_20_nm_strings_readelf.txt) | file, nm, secciones eliminadas, strings del stripped | [`boss.md`](../boss.md) |
| [`gdb_26_boss_stripped.txt`](gdb_26_boss_stripped.txt) | GDB por dirección en el stripped | [`gdb.md`](../gdb.md), [`boss.md`](../boss.md) |
