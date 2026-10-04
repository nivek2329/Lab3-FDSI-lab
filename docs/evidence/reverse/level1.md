# Nivel 1 — "Strings are evidence"

**Binario:** `crackme_level1` · SHA-256 `61e980febe84b1003b5a3b641468e915b984f7fdd835be9828af54233f88c68c`
**Herramientas:** ejecución directa, `strings`, `objdump`
**Resultado:** `FLAG{strings_are_evidence}`

---

## 1. Observación inicial (caja negra)

Primero ejecutamos el programa sin conocer nada de su interior:

```text
$ ./crackme_level1
=== FDSI CrackMe Level 1 ===
Uso: ./crackme_level1 <password>

$ ./crackme_level1 prueba
=== FDSI CrackMe Level 1 ===
Access denied.
```

El programa recibe **un argumento** (`<password>`) y responde con un mensaje de éxito o de fallo.
Evidencia: `screenshots/06_nivel1_ejecucion_access_denied.png`

![Nivel 1: ejecución con contraseña incorrecta](screenshots/06_nivel1_ejecucion_access_denied.png)

## 2. Hipótesis

> Si el programa valida la contraseña comparando cadenas, la contraseña debe estar almacenada en el binario
> y `strings` debería revelarla cerca de los mensajes de éxito/fallo.

## 3. Evidencia estática

### 3.1 `strings -n 5 crackme_level1`

```text
putchar
printf
strcmp            <- el programa compara cadenas
...
REDTEAM-101       <- cadena candidata, justo antes de los mensajes
=== FDSI CrackMe Level 1 ===
Uso: %s <password>
Access granted.
Access denied.
...
password
print_flag        <- nombre de función: el binario NO está stripped
GNU C17 14.2.0 ... -g -O0 ...
```

Hallazgos:

- `strcmp` entre las funciones importadas → la validación es una comparación directa de cadenas.
- `REDTEAM-101` está en la misma zona (`.rodata`) que el banner y los mensajes `Access granted/denied`.
- Como el binario conserva símbolos y `debug_info`, se ven nombres internos como `password` y `print_flag`.
- La FLAG **no** aparece en `strings`: las cadenas raras `!).(H` y `,3>?49?'H` son bytes ofuscados de `print_flag`.

Evidencia: `screenshots/07_nivel1_strings_password_embebido.png`

![Nivel 1: contraseña descubierta con strings](screenshots/07_nivel1_strings_password_embebido.png)

### 3.2 `objdump -d -M intel --disassemble=main crackme_level1`

| Dirección | Instrucción | Significado |
|---|---|---|
| `4011e7` | `lea rax,[rip+0xe16]  # 402004` | carga la dirección `0x402004` (la contraseña) |
| `4011ee` | `mov [rbp-0x8],rax` | la guarda en una variable local (`password`) |
| `401201` | `cmp DWORD PTR [rbp-0x14],0x2` / `je` | verifica que `argc == 2`; si no, imprime `Uso:` y retorna 1 |
| `40122c`–`401234` | `mov rax,[rbp-0x20]; add rax,0x8; mov rax,[rax]` | obtiene `argv[1]` (la entrada del usuario) |
| `401237`–`40123e` | `rsi = password`, `rdi = argv[1]` | argumentos de `strcmp` |
| `401241` | `call strcmp@plt` | compara la entrada con la contraseña |
| `401246`–`401248` | `test eax,eax` / `jne 401265` | si **no** son iguales salta a `Access denied` |
| `40124a`–`401259` | `puts("Access granted.")` / `call print_flag` | camino de éxito |

Evidencia: `screenshots/08a_nivel1_objdump_main_strcmp.png`

![Nivel 1: comparación observada en main con objdump](screenshots/08a_nivel1_objdump_main_strcmp.png)

### 3.3 `objdump -s -j .rodata crackme_level1`

```text
402000 01000200 52454454 45414d2d 31303100  ....REDTEAM-101.
402010 3d3d3d20 46445349 20437261 636b4d65  === FDSI CrackMe
...
402040 00416363 65737320 6772616e 7465642e  .Access granted.
402050 00416363 65737320 64656e69 65642e00  .Access denied..
```

La dirección `0x402004` (usada por el `lea` de `main`) contiene exactamente `REDTEAM-101`.
Esto conecta la cadena de `strings` con el argumento que recibe `strcmp`.
Evidencia: `screenshots/08b_nivel1_objdump_rodata_redteam101.png`

![Nivel 1: contraseña localizada en rodata](screenshots/08b_nivel1_objdump_rodata_redteam101.png)

## 4. Lógica reconstruida (pseudocódigo propio)

```c
int main(int argc, char **argv) {
    const char *password = "REDTEAM-101";      // en .rodata, 0x402004
    puts("=== FDSI CrackMe Level 1 ===");
    if (argc != 2) {
        printf("Uso: %s <password>\n", argv[0]);
        return 1;
    }
    if (strcmp(argv[1], password) == 0) {
        puts("Access granted.");
        print_flag();                          // decodifica y muestra la FLAG
        return 0;
    }
    puts("Access denied.");
    return 2;
}
```

Detalle de `print_flag` (en `objdump --disassemble=print_flag`): la función guarda 26 bytes en la pila y los recorre con un ciclo `for (i = 0; i <= 0x19; i++)`. Cada byte se descifra con `xor al, 0x5a` y se imprime con `putchar`. Por eso la FLAG no aparece como texto con `strings`: solo existe descifrada en tiempo de ejecución.

## 5. Confirmación dinámica

```text
$ ./crackme_level1 REDTEAM-101
=== FDSI CrackMe Level 1 ===
Access granted.
FLAG{strings_are_evidence}
```

La hipótesis quedó confirmada.
Evidencia: `screenshots/09_nivel1_access_granted_flag.png`

![Nivel 1: acceso válido y FLAG obtenida](screenshots/09_nivel1_access_granted_flag.png)

## 6. ¿Por qué `strings` puede revelar secretos embebidos?

- Un literal de C como `"REDTEAM-101"` se compila tal cual en la sección `.rodata`, en texto plano y legible.
- `strings` solo busca secuencias de caracteres imprimibles, así que cualquiera que tenga el ejecutable ve el secreto **sin ejecutarlo**.
- La comparación directa con `strcmp` hace que la contraseña quede en memoria y en disco en texto plano.
- Compilar con `-g` y sin strip facilita aún más el análisis: se ven los nombres `password` y `print_flag`, e incluso la ruta del fuente.

**Lección de desarrollo seguro:** nunca embeber credenciales en el binario. La validación debe hacerse en el servidor, o contra un hash lento con sal (bcrypt/Argon2). Los secretos deben venir de un gestor de secretos o de variables de entorno, y los binarios de producción deben distribuirse stripped. Ofuscar la FLAG con XOR (como hace `print_flag`) solo retrasa el análisis; no es cifrado real.

## 7. Complemento (aporte de Daniel Peña)

El almacenamiento de contraseñas, llaves maestras o secretos codificados directamente en el código fuente (Hardcoded Credentials - CWE-259) es un grave fallo de diseño. Cualquier binario compilado expone sus constantes en texto claro, permitiendo que atacantes o auditores extraigan las credenciales en segundos con utilidades forenses básicas como `strings`. Los secretos deben externalizarse mediante variables de entorno o sistemas de gestión de credenciales (KMS / Vault).
