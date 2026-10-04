# Nivel 2 — Ghidra: reconstruir la validación

**Binario:** `crackme_level2` · SHA-256 `8dc5931dfbf74d7371de9ca9ed8cc57bfe0af4521346202dcd1c701dd8b6f4e5`
**Herramientas:** ejecución directa, `strings`, `objdump`, Ghidra 12.1.4 (proyecto Non-Shared `FDSI-Reverse`)
**Resultado:** clave `FDSI-REVERSE-2026` · `FLAG{ghidra_plus_gdb}`

---

## 1. Observación inicial (caja negra)

```text
$ ./crackme_level2
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.
Uso: ./crackme_level2 <license-key>

$ ./crackme_level2 AAAA
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.
Invalid license.
```

El programa recibe una **license-key** y responde `License accepted.` o `Invalid license.`

## 2. ¿Por qué `strings` ya no basta? (diferencia con el Nivel 1)

`strings -n 5 crackme_level2` muestra el banner y los mensajes, pero **ninguna clave legible**:

- Ya no se importa `strcmp`; ahora aparece `strlen`. Eso indica que la clave se valida por longitud y luego byte a byte, sin comparar cadenas directamente.
- Aparecen nombres de depuración útiles: `validate_key` y `expected`.
- En `.rodata`, después de `Invalid license.`, hay bytes no imprimibles:

```text
402080 64206c69 63656e73 652e0023 51176a00  d license..#Q.j.
402090 65154423 0e03523c 6603442f 0e632758  e.D#..R<f.D/.c'X
4020a0 15                                   .
```

Evidencia: `screenshots/10_nivel2_ejecucion_invalid_y_strings.png` · `screenshots/11_nivel2_objdump_rodata_bytes_no_legibles.png`

![Nivel 2: ejecución inicial y resultado de strings](screenshots/10_nivel2_ejecucion_invalid_y_strings.png)

![Nivel 2: bytes ofuscados en rodata](screenshots/11_nivel2_objdump_rodata_bytes_no_legibles.png)

## 3. Hipótesis

> La clave no está en texto plano. Está **transformada** y guardada como bytes en `.rodata`, y una función
> (`validate_key`) aplica una transformación a cada carácter de la entrada y la compara con esos bytes.

## 4. Análisis en Ghidra

### 4.1 Proyecto e importación
- Proyecto **Non-Shared** `FDSI-Reverse`.
- Import: *Format* ELF, *Language* `x86:LE:64:default:gcc`, compilador gcc. En el resumen aparece el fuente original `crackme_level2.c`, porque el binario no está stripped.
- Se aceptó el análisis automático.

Evidencia: `screenshots/12_nivel2_ghidra_iniciado.png` · `13_nivel2_ghidra_proyecto_nonshared.png` · `14a_nivel2_ghidra_import_elf_x86-64.png` · `14b_nivel2_ghidra_import_results_summary.png`

![Nivel 2: Ghidra abierto](screenshots/12_nivel2_ghidra_iniciado.png)

![Nivel 2: proyecto Non-Shared creado](screenshots/13_nivel2_ghidra_proyecto_nonshared.png)

![Nivel 2: importación ELF en Ghidra](screenshots/14a_nivel2_ghidra_import_elf_x86-64.png)

![Nivel 2: resumen del análisis en Ghidra](screenshots/14b_nivel2_ghidra_import_results_summary.png)

### 4.2 `main`: ¿quién decide?

Decompilador de `main` (Ghidra):

```c
if (argc == 2) {
    iVar1 = validate_key(argv[1]);      // <- decisión
    if (iVar1 == 0) { puts("Invalid license.");  iVar1 = 3; }
    else            { puts("License accepted."); reveal_flag(); iVar1 = 0; }
} else {
    printf("Uso: %s <license-key>\n", *argv); iVar1 = 1;
}
```

La decisión depende **solo** del valor de retorno de `validate_key(argv[1])`: distinto de 0 significa válida.
Evidencia: `screenshots/15_nivel2_ghidra_main_decompilado.png`

![Nivel 2: función main decompilada](screenshots/15_nivel2_ghidra_main_decompilado.png)

### 4.3 `validate_key`: la validación

Decompilador de `validate_key` (Ghidra, antes de renombrar):

```c
sVar2 = strlen(candidate);
if (sVar2 == 0x11) {
    score = 0;
    for (i = 0; i < 0x11; i = i + 1) {
        score = score | (byte)("e\x15D#\x0e\x03R<f\x03D/..."[i] ^
                               "#Q\x17j"[(uint)i & 3] ^ candidate[i]);
    }
    uVar1 = (uint)(score == 0);
} else {
    uVar1 = 0;
}
return uVar1;
```

Evidencia:
- `screenshots/16a_nivel2_ghidra_validate_key_original.png`: decompilador antes de renombrar.

  ![Nivel 2: validate_key original en Ghidra](screenshots/16a_nivel2_ghidra_validate_key_original.png)
- `screenshots/16b_nivel2_ghidra_validate_key_renombrado_xor.png`: renombres `key_len`/`is_valid`; en el Listing se ven las instrucciones `XOR` (`004011b9`, `004011cf`), `OR` (`004011d5`) y `CMP`/`SETZ` (`004011e7`) que corresponden al pseudocódigo.

  ![Nivel 2: validate_key y operaciones XOR](screenshots/16b_nivel2_ghidra_validate_key_renombrado_xor.png)
- `screenshots/16c_nivel2_ghidra_validate_key_comentario_xor.png`: comentario de análisis sobre la línea del XOR.

  ![Nivel 2: comentario de análisis XOR](screenshots/16c_nivel2_ghidra_validate_key_comentario_xor.png)
- `screenshots/17a_nivel2_ghidra_listing_k_23-51-17-6a.png`: `k.1` en `0x0040208b` = `23 51 17 6A`.

  ![Nivel 2: bytes del arreglo k en el Listing](screenshots/17a_nivel2_ghidra_listing_k_23-51-17-6a.png)
- `screenshots/17b_nivel2_ghidra_listing_expected_17_bytes.png`: `expected.0` en `0x00402090`, los 17 bytes `[0]..[16]`.

  ![Nivel 2: bytes del arreglo expected en el Listing](screenshots/17b_nivel2_ghidra_listing_expected_17_bytes.png)
- `screenshots/18b_nivel2_wsl_objdump_validate_key_parte1.png` y `18c_..._parte2.png`: `objdump -d -M intel --disassemble=validate_key` en WSL, donde se ven las mismas instrucciones fuera de Ghidra (`mov [rbp-0x18],0x11`, `call strlen`, `and eax,0x3`, `lea ... <k.1>`, `xor`, `lea ... <expected.0>`, `or`, `sete`).

  ![Nivel 2: desensamblado de validate_key, parte 1](screenshots/18b_nivel2_wsl_objdump_validate_key_parte1.png)
  ![Nivel 2: desensamblado de validate_key, parte 2](screenshots/18c_nivel2_wsl_objdump_validate_key_parte2.png)

| Elemento | Hallazgo |
|---|---|
| **Longitud esperada** | `strlen(candidate) == 0x11` → **17 caracteres** |
| **Arreglo cíclico `k`** | `"#Q\x17j"` en `0x0040208b` = `23 51 17 6A` (4 bytes), indexado con `i & 3` (= `i % 4`) |
| **Arreglo `expected`** | `0x00402090`, 17 bytes: `65 15 44 23 0E 03 52 3C 66 03 44 2F 0E 63 27 58 15` |
| **Transformación por byte** | `transformed = candidate[i] XOR k[i % 4]` |
| **Condición de éxito** | `score` acumula con OR cada diferencia `expected[i] XOR transformed`. Es válida solo si `score == 0`, es decir, si **todos** los bytes coinciden |

Detalle: el uso de OR acumulado (`score |= ...`) en lugar de salir en el primer byte distinto hace que la función recorra siempre los 17 bytes. Esto evita salir al primer byte distinto, pero no basta para afirmar que toda la función sea de tiempo constante.

## 5. Pseudocódigo propio

```c
const uint8_t k[4]         = {0x23, 0x51, 0x17, 0x6A};
const uint8_t expected[17] = {0x65,0x15,0x44,0x23,0x0E,0x03,0x52,0x3C,
                              0x66,0x03,0x44,0x2F,0x0E,0x63,0x27,0x58,0x15};

int validate_key(const char *candidate) {
    if (strlen(candidate) != 17) return 0;       // 1) longitud exacta
    uint32_t diff = 0;
    for (size_t i = 0; i < 17; i++) {
        uint8_t transformed = candidate[i] ^ k[i % 4];   // 2) XOR con clave cíclica
        diff |= transformed ^ expected[i];               // 3) acumula diferencias
    }
    return diff == 0;                             // 4) válida si no hubo diferencias
}
```

## 6. Reconstrucción de la clave

XOR es reversible: si `candidate[i] ^ k[i%4] == expected[i]`, entonces **`candidate[i] = expected[i] ^ k[i%4]`**.

| i | expected | k[i%4] | XOR | char |
|---|---|---|---|---|
| 0 | 65 | 23 | 46 | F |
| 1 | 15 | 51 | 44 | D |
| 2 | 44 | 17 | 53 | S |
| 3 | 23 | 6A | 49 | I |
| 4 | 0E | 23 | 2D | - |
| 5 | 03 | 51 | 52 | R |
| 6 | 52 | 17 | 45 | E |
| 7 | 3C | 6A | 56 | V |
| 8 | 66 | 23 | 45 | E |
| 9 | 03 | 51 | 52 | R |
| 10 | 44 | 17 | 53 | S |
| 11 | 2F | 6A | 45 | E |
| 12 | 0E | 23 | 2D | - |
| 13 | 63 | 51 | 32 | 2 |
| 14 | 27 | 17 | 30 | 0 |
| 15 | 58 | 6A | 32 | 2 |
| 16 | 15 | 23 | 36 | 6 |

**Clave candidata:** `FDSI-REVERSE-2026`, de 17 caracteres, lo que cumple la longitud.

Script de verificación (WSL):

```bash
python3 -c "k=bytes.fromhex('2351176a');e=bytes.fromhex('651544230e03523c6603442f0e63275815');print(bytes(e[i]^k[i%4] for i in range(17)).decode())"
```

## 7. Confirmación en ejecución

```text
$ ./crackme_level2 AAAA
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.
Invalid license.
$ ./crackme_level2 FDSI-REVERSE-2026
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.
License accepted.
FLAG{ghidra_plus_gdb}
```

La clave reconstruida estáticamente fue aceptada, lo que confirma la hipótesis. La demostración paso a paso con GDB está en [`gdb.md`](gdb.md).
Evidencia: `screenshots/18_nivel2_wsl_clave_valida_flag.png` (ejecución en WSL Ubuntu del equipo) · `logs/nivel2_18_clave_y_flag.txt`

![Nivel 2: clave válida y FLAG en WSL](screenshots/18_nivel2_wsl_clave_valida_flag.png)

## 8. Lección de desarrollo seguro

- Ofuscar la clave con XOR **no es cifrado**: la clave `k` y el resultado `expected` viajan dentro del mismo binario, así que el proceso se invierte en segundos.
- Cualquier validación hecha **solo del lado del cliente** puede reconstruirse con un decompilador (Ghidra).
- Las licencias y secretos reales deben validarse en un servidor, o con firmas asimétricas (el binario guarda solo la clave **pública**). Si hay que comparar secretos, se debe usar un hash lento con sal.
- Lo bueno del diseño: el acumulador evita salir al primer byte distinto y procesa los 17 bytes si la longitud es correcta. Eso no basta para afirmar que toda la validación tenga tiempo constante. Aun así, eso no compensa tener el secreto embebido.

---

## 9. Capturas complementarias del equipo (GitHub)

<img width="949" height="186" alt="image" src="https://github.com/user-attachments/assets/a2a3f43d-d252-44c8-a3c0-b815d7d434ba" />
<img width="949" height="906" alt="image" src="https://github.com/user-attachments/assets/af86379a-8d36-4352-8457-67d6929c3f5c" />
<img width="952" height="586" alt="image" src="https://github.com/user-attachments/assets/af82d0eb-7200-4208-881c-74caab3042d5" />
