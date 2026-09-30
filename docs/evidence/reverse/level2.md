# Nivel 2 — Reverse Engineering: Reconstrucción Algorítmica con Ghidra

## 1. Hipótesis Inicial
A diferencia del Nivel 1, la clave de licencia no reside en texto plano dentro del ejecutable. La hipótesis formulada es que el programa recibe una cadena por línea de comandos, valida su longitud esperada y somete cada byte a una operación matemática reversible (ofuscación simétrica byte a byte) para compararlo contra un arreglo constante precalculado en memoria.

---

## 2. Análisis Estático y Decompilación

Al importar `crackme_level2` en Ghidra e inspeccionar la función `main`, se identifica la invocación a la rutina `validate_key(char *candidate)` antes de decidir si mostrar `"License accepted."` o `"Invalid license."`.

### A. Condiciones de Validación Identificadas:
1. **Longitud requerida:** 
   Se calcula `strlen(candidate)` y se compara contra `0x11` (17 caracteres exactos en decimal). Si la longitud difiere, la función retorna inmediatamente `0`.
2. **Máscara Cíclica de Transformación (`k`):**
   Arreglo constante de 4 bytes ubicado en `.rodata` (`0x40208b`):
   ```c
   const unsigned char k[4] = { 0x23, 0x51, 0x17, 0x6a }; // ASCII: '#', 'Q', '\x17', 'j'
   ```
   El byte de la máscara correspondiente a la posición $i$ se selecciona mediante la operación bit a bit `i & 3` (equivalente a $i \pmod 4$).
3. **Arreglo Esperado (`expected`):**
   Arreglo de 17 bytes ubicado en `.rodata` (`0x402090`):
   ```c
   const unsigned char expected[17] = {
       0x65, 0x15, 0x44, 0x23, 0x0e, 0x03, 0x52, 0x3c,
       0x66, 0x03, 0x44, 0x2f, 0x0e, 0x63, 0x27, 0x58, 0x15
   };
   ```

### Evidencia Visual en Ghidra:
![Decompilación de validate_key en Ghidra con variables renombradas](screenshots/screenshot_ghidra_level2.png)

---

## 3. Pseudocódigo Propio Reconstruido

```c
int validate_key(const char *candidate) {
    // 1. Validación de tamaño
    if (strlen(candidate) != 17) {
        return 0;
    }

    // 2. Tablas constantes en memoria de solo lectura
    const unsigned char k[4] = { 0x23, 0x51, 0x17, 0x6a };
    const unsigned char expected[17] = {
        0x65, 0x15, 0x44, 0x23, 0x0e, 0x03, 0x52, 0x3c,
        0x66, 0x03, 0x44, 0x2f, 0x0e, 0x63, 0x27, 0x58, 0x15
    };

    // 3. Acumulador de discrepancias (resistencia a ataques de tiempo)
    int diff_accumulator = 0;
    for (size_t i = 0; i < 17; i++) {
        unsigned char transformed = (unsigned char)candidate[i] ^ k[i & 3];
        diff_accumulator |= (transformed ^ expected[i]);
    }

    // Retorna 1 si no hubo ninguna discrepancia (diff_accumulator == 0)
    return (diff_accumulator == 0);
}
```

---

## 4. Reconstrucción Matemática de la Clave
Dado que la transformación aplicada es una operación XOR bit a bit ($\oplus$) y el XOR es una operación involutiva (su propia inversa):
$$\text{candidate}[i] \oplus k[i \pmod 4] = \text{expected}[i] \iff \text{candidate}[i] = \text{expected}[i] \oplus k[i \pmod 4]$$

Calculando de forma determinista para cada índice de $i = 0$ hasta $16$:
* $i = 0$: `0x65 ^ 0x23 = 0x46` $\rightarrow$ `'F'`
* $i = 1$: `0x15 ^ 0x51 = 0x44` $\rightarrow$ `'D'`
* $i = 2$: `0x44 ^ 0x17 = 0x53` $\rightarrow$ `'S'`
* $i = 3$: `0x23 ^ 0x6a = 0x49` $\rightarrow$ `'I'`
* $i = 4$: `0x0e ^ 0x23 = 0x2d` $\rightarrow$ `'-'`
* $i = 5$: `0x03 ^ 0x51 = 0x52` $\rightarrow$ `'R'`
* $i = 6$: `0x52 ^ 0x17 = 0x45` $\rightarrow$ `'E'`
* $i = 7$: `0x3c ^ 0x6a = 0x56` $\rightarrow$ `'V'`
* $i = 8$: `0x66 ^ 0x23 = 0x45` $\rightarrow$ `'E'`
* $i = 9$: `0x03 ^ 0x51 = 0x52` $\rightarrow$ `'R'`
* $i = 10$: `0x44 ^ 0x17 = 0x53` $\rightarrow$ `'S'`
* $i = 11$: `0x2f ^ 0x6a = 0x45` $\rightarrow$ `'E'`
* $i = 12$: `0x0e ^ 0x23 = 0x2d` $\rightarrow$ `'-'`
* $i = 13$: `0x63 ^ 0x51 = 0x32` $\rightarrow$ `'2'`
* $i = 14$: `0x27 ^ 0x17 = 0x30` $\rightarrow$ `'0'`
* $i = 15$: `0x58 ^ 0x6a = 0x32` $\rightarrow$ `'2'`
* $i = 16$: `0x15 ^ 0x23 = 0x36` $\rightarrow$ `'6'`

**Clave de licencia resultante:** `FDSI-REVERSE-2026`

---

## 5. Ejecución y Verificación de la Bandera (FLAG)
Al ejecutar el binario con la clave calculada:
```bash
./crackme_level2 FDSI-REVERSE-2026
```

### Salida obtenida:
```text
=== FDSI CrackMe Level 2 ===
Hint: static + dynamic analysis.
License accepted.
FLAG{ghidra_plus_gdb}
```

### Evidencia Visual de Ejecución:
![Ejecución con licencia y bandera Nivel 2](screenshots/screenshot_level2.png)

---

## 6. Boss Level — Binario Stripped (`crackme_level2_stripped`)
Al ejecutar la misma clave contra `crackme_level2_stripped`:
```bash
./crackme_level2_stripped FDSI-REVERSE-2026
```
La salida es exactamente idéntica: `FLAG{ghidra_plus_gdb}`.

**Diferencia técnica:** Al pasar la utilidad `nm crackme_level2_stripped`, el sistema reporta `no symbols`. Al desensamblar con Ghidra o `objdump`, los identificadores `validate_key`, `main` y `expected` fueron eliminados de la tabla de símbolos. La función se localizó buscando la referencia cruzada (XREF) hacia la cadena `"License accepted."` en `.rodata` y analizando el flujo de entrada desde `_start` hacia el primer argumento de `__libc_start_main`.

### Evidencia Visual Boss Level (Stripped):
![Ejecución del binario stripped y verificación de símbolos](screenshots/screenshot_stripped.png)
