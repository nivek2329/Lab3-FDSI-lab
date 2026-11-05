# Laboratorio 6 — Code Breaker: El Misterio del Código Oculto

**Asignatura:** Fundamentos de Seguridad de la Información (FDSI)  
**Institución:** Escuela Colombiana de Ingeniería Julio Garavito  
**Grupo:** G06  
**Integrantes:**
- Kevin Andrey Ángel Acevedo
- Sergio Daniel Buitrago Suancha
- Daniel Julian Peña Bonilla

---

## 🎯 Propósito y Misión del Reto

El reto **Code Breaker** consiste en realizar ingeniería inversa sobre un programa ejecutable de laboratorio compilado en formato **ELF Linux x86-64** (`reto_codebreakers_linux_x64`), del cual **no se dispone de su código fuente**.

El objetivo es descubrir la clave secreta que protege la bóveda digital y demostrar la obtención de la bandera (**FLAG**).

---

## 🏆 Resultados y Solución Verificada

| Parámetro | Resultado Obtenido |
|---|---|
| **Clave en Texto Claro** | `BREAKER#2026` |
| **Bandera (Flag)** | `FLAG{CODEBREAKERS_ECI}` |
| **Mensaje de Validación** | `ACCESO CONCEDIDO` |
| **Algoritmo de Protección** | Cifrado simétrico AES-256 en modo CBC con padding PKCS#7 |
| **Clave AES-256 (32 bytes)** | `CodeBreakersECI_AES256_KEY_2026!` |
| **Vector de Inicialización (IV)** | `ECI_VECTOR_2026!` |
| **Bloque Cifrado (`aes_ct`)** | `d6 7f 57 89 f4 51 af eb f2 b6 e5 66 f8 7f b9 79` |
| **Punto de Decisión Lógica** | Función `main`, bifurcación `strcmp` (Líneas 461–468 en Ghidra) |

---

## 📂 Contenido Exclusivo del Laboratorio 6

```
.
├── codebreakers/
│   ├── reto_codebreakers_linux_x64                # Ejecutable ELF x86-64 del reto
│   ├── CODEBREAKERS_Guia_Estudiantes_Windows.html # Guía interactiva y validador autónomo
│   ├── LEEME_RETO.md                              # Guía y reglas del estudiante
│   └── LEER_PRIMERO.txt                           # Indicaciones de inicio
├── docs/
│   ├── REPORTE_CODEBREAKER.md                     # Informe técnico detallado de 5 fases
│   └── evidence/codebreaker/                      # Evidencias visuales y registros de ejecución
│       ├── 01_ghidra_string_search_cadenas.jpg    # Búsqueda de cadenas en Ghidra
│       ├── 02_ghidra_main_decompiler_inicio.jpg   # Entrada de la función main
│       ├── 03_ghidra_main_listing_entry.jpg       # Vista del desensamblado Listing
│       ├── 04_ghidra_decompiler_strcmp_validacion.jpg # Lógica de comparación strcmp
│       ├── 05_ghidra_string_search_completo.jpg   # Cadenas de texto en .rodata
│       ├── 06_ghidra_listing_rodata_banner.png    # Referencia cruzada (XREF) main
│       ├── 07_ghidra_listing_bytes_clave_aes.png  # Llave AES-256 en memoria
│       ├── 08_cyberchef_descifrado_aes_manual.png # Criptoanálisis manual en CyberChef
│       └── 09_terminal_wsl_ejecucion_binario_flag.txt # Log de ejecución dinámica en WSL
└── README.md
```

---

## 🔬 Metodología de Resolución

1. **Inspección Inicial (Ghidra):**  
   Se importó el binario `reto_codebreakers_linux_x64` como ELF x86-64 en Ghidra. Al realizar una búsqueda de cadenas (`Search -> For Strings...`), se identificó que la contraseña **no** estaba almacenada en texto plano.
2. **Localización de Constantes Criptográficas:**  
   En la sección `.rodata` se recuperaron la llave AES-256 (`CodeBreakersECI_AES256_KEY_2026!`), el vector IV (`ECI_VECTOR_2026!`) y el bloque cifrado `d6 7f 57 89 f4 51 af eb f2 b6 e5 66 f8 7f b9 79`.
3. **Análisis del Flujo de Control:**  
   En el descompilador de Ghidra (función `main`), se ubicó la comparación:
   ```c
   iVar21 = strcmp((char *)&local_1a8, (char *)&local_1c8);
   if (iVar21 == 0) {
       puts("ACCESO CONCEDIDO");
       puts("FLAG{CODEBREAKERS_ECI}");
   }
   ```
4. **Criptoanálisis Manual (CyberChef / PowerShell):**  
   Al descifrar manualmente el bloque cifrado con AES-256-CBC, la clave y el IV, se obtuvo el texto plano: **`BREAKER#2026`**.
5. **Validación Dinámica:**  
   Al ejecutar `./reto_codebreakers_linux_x64` e introducir `BREAKER#2026`, el programa concede acceso y emite la bandera.

---

## 📄 Documentación Completa
El informe formal con el desglose técnico, análisis de seguridad y lecciones aprendidas se encuentra en:  
👉 [`docs/REPORTE_CODEBREAKER.md`](docs/REPORTE_CODEBREAKER.md)
