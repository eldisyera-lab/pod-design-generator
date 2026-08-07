# ============================================================
# GENERADOR DE DISENOS PARA TAZAS, CAMISETAS Y PULOVERES
# Creado para principiantes - Solo copiar, pegar y ejecutar
# No necesitas saber programar para usarlo
# ============================================================

import os
import random
from PIL import Image, ImageDraw, ImageFont

# -----------------------------------------------------------
# PARTE 1: CONFIGURACION (Puedes cambiar esto facilmente)
# -----------------------------------------------------------

# Carpeta donde se guardaran los disenos
CARPETA_SALIDA = "output_designs"

# Tamanos de impresion en pixeles (a 300 DPI, calidad profesional)
TAMANOS = {
    "taza": (3000, 3000),      # Taza 11oz
    "camiseta": (4500, 5400),  # Camiseta
    "pulover": (4500, 4050),   # Pulover / Hoodie
    "bolso": (3000, 3000),     # Tote bag
}

# Paletas de colores (elige la que mas te guste)
COLORES = {
    "calido": {
        "fondo": "#1A1A2E",
        "texto": "#FFFFFF",
        "subtexto": "#B8C5D6",
        "acento": "#E94560",
        "decoracion": "#533483"
    },
    "frio": {
        "fondo": "#0F172A",
        "texto": "#F1F5F9",
        "subtexto": "#94A3B8",
        "acento": "#38BDF8",
        "decoracion": "#818CF8"
    },
    "oscuro": {
        "fondo": "#000000",
        "texto": "#FFFFFF",
        "subtexto": "#A1A1AA",
        "acento": "#FBBF24",
        "decoracion": "#92400E"
    },
    "pastel": {
        "fondo": "#FFF0F5",
        "texto": "#4A044E",
        "subtexto": "#7C3AED",
        "acento": "#EC4899",
        "decoracion": "#A855F7"
    },
    "neon": {
        "fondo": "#0A0A0A",
        "texto": "#FFFFFF",
        "subtexto": "#00FF88",
        "acento": "#FF006E",
        "decoracion": "#FB5607"
    }
}

# Frases listas para usar (puedes agregar las tuyas)
FRASES = {
    "cafe": [
        ("But First, Coffee", "Because adulting is hard"),
        ("Coffee & Chaos", "Professional caffeine consumer"),
        ("Espresso Yourself", "Powered by beans"),
        ("Decaf? No Thanks", "Life begins after coffee"),
    ],
    "perros": [
        ("Dog Mom", "My kids have paws"),
        ("Pawsitive Vibes", "Official treat distributor"),
        ("Fur Mama", "Will talk about my dog"),
        ("Life is Better With Dogs", "Professional belly rubber"),
    ],
    "profesores": [
        ("Teach, Love, Inspire", "Teaching is a work of heart"),
        ("Chaos Coordinator", "Surviving on coffee & markers"),
        ("Off Duty Teacher", "Summer is my reward"),
        ("Blessed & Stressed", "Grade papers, not people"),
    ],
    "gimnasio": [
        ("Sore Today, Strong Tomorrow", "Currently under construction"),
        ("Beast Mode", "My warm-up is your workout"),
        ("No Pain No Gain", "Will squat for tacos"),
        ("Gym Hair, Don't Care", "Rest day? What's that?"),
    ],
    "viajes": [
        ("Wanderlust", "Passport ready"),
        ("Not All Who Wander Are Lost", "Catch flights, not feelings"),
        ("Collect Moments", "Home is where the WiFi is"),
        ("Adventure Awaits", "Currently out of office"),
    ],
    "sarcastico": [
        ("I'm Not Arguing", "I'm just explaining why I'm right"),
        ("Sarcasm Loading...", "Please wait..."),
        ("Professional Overthinker", "It's a beautiful day to leave me alone"),
        ("Nope. Not Today.", "Approach with caffeine"),
    ]
}

# Palabras que NO puedes usar (protegidas por ley)
PALABRAS_PROHIBIDAS = [
    "disney", "marvel", "nike", "adidas", "starbucks", "keep calm",
    "harry potter", "batman", "superman", "mickey", "apple", "iphone"
]

# -----------------------------------------------------------
# PARTE 2: FUNCIONES (No necesitas tocar esto, solo funciona)
# -----------------------------------------------------------

def hex_a_rgb(color_hex):
    """Convierte un color tipo #FF0000 a numeros que entiende la computadora"""
    color_hex = color_hex.lstrip("#")
    return tuple(int(color_hex[i:i+2], 16) for i in (0, 2, 4))

def verificar_copyright(texto):
    """Revisa que no uses palabras prohibidas"""
    texto_minuscula = texto.lower()
    for palabra in PALABRAS_PROHIBIDAS:
        if palabra in texto_minuscula:
            print(f"⚠️  CUIDADO: '{palabra}' esta protegido. Usa otra frase.")
            return False
    return True

def obtener_fuente(tamano, negrita=False):
    """Busca una fuente bonita en tu computadora"""
    # Intenta usar fuentes comunes del sistema
    nombres_fuentes = [
        "arialbd.ttf" if negrita else "arial.ttf",
        "DejaVuSans-Bold.ttf" if negrita else "DejaVuSans.ttf",
        "LiberationSans-Bold.ttf" if negrita else "LiberationSans-Regular.ttf",
    ]

    for nombre in nombres_fuentes:
        try:
            return ImageFont.truetype(nombre, tamano)
        except:
            continue

    # Si no encuentra ninguna, usa la basica
    return ImageFont.load_default()

def crear_diseno(nicho, paleta_nombre, producto, frase_personalizada=None, subfrase_personalizada=None):
    """
    Esta es la funcion magica que crea el diseno.
    Tu solo le dices: que nicho, que colores, y que producto.
    """

    # Elegir frases
    if frase_personalizada:
        frase_principal = frase_personalizada
        frase_secundaria = subfrase_personalizada or ""
    else:
        frase_principal, frase_secundaria = random.choice(FRASES[nicho])

    # Verificar que sea legal
    if not verificar_copyright(frase_principal):
        return None

    # Obtener colores
    colores = COLORES[paleta_nombre]
    ancho, alto = TAMANOS[producto]

    # Crear la imagen en blanco
    imagen = Image.new("RGB", (ancho, alto), hex_a_rgb(colores["fondo"]))
    dibujar = ImageDraw.Draw(imagen)

    # Dibujar circulos decorativos de fondo
    dibujar.ellipse(
        [(-ancho//4, -alto//4), (ancho//3, alto//3)],
        fill=hex_a_rgb(colores["decoracion"])
    )
    dibujar.ellipse(
        [(ancho*2//3, alto*2//3), (ancho + ancho//5, alto + alto//5)],
        fill=hex_a_rgb(colores["acento"])
    )

    # Dibujar la frase principal (texto grande)
    tamano_fuente = min(ancho // 10, 300)
    fuente = obtener_fuente(tamano_fuente, negrita=True)

    # Si el texto es muy largo, hacer la letra mas pequena
    caja = dibujar.textbbox((0, 0), frase_principal, font=fuente)
    ancho_texto = caja[2] - caja[0]
    while ancho_texto > ancho * 0.8 and tamano_fuente > 50:
        tamano_fuente -= 15
        fuente = obtener_fuente(tamano_fuente, negrita=True)
        caja = dibujar.textbbox((0, 0), frase_principal, font=fuente)
        ancho_texto = caja[2] - caja[0]

    # Calcular posicion centrada
    caja = dibujar.textbbox((0, 0), frase_principal, font=fuente)
    ancho_texto = caja[2] - caja[0]
    alto_texto = caja[3] - caja[1]
    x = (ancho - ancho_texto) // 2
    y = (alto // 2) - alto_texto - 50

    # Dibujar sombra sutil
    dibujar.text((x+5, y+5), frase_principal, font=fuente, fill=(0, 0, 0))
    # Dibujar texto real
    dibujar.text((x, y), frase_principal, font=fuente, fill=hex_a_rgb(colores["texto"]))

    # Dibujar la frase secundaria (texto pequeno)
    if frase_secundaria:
        tamano_secundaria = max(tamano_fuente // 2, 40)
        fuente_secundaria = obtener_fuente(tamano_secundaria, negrita=False)

        caja = dibujar.textbbox((0, 0), frase_secundaria, font=fuente_secundaria)
        ancho_sec = caja[2] - caja[0]
        while ancho_sec > ancho * 0.75 and tamano_secundaria > 25:
            tamano_secundaria -= 5
            fuente_secundaria = obtener_fuente(tamano_secundaria, negrita=False)
            caja = dibujar.textbbox((0, 0), frase_secundaria, font=fuente_secundaria)
            ancho_sec = caja[2] - caja[0]

        caja = dibujar.textbbox((0, 0), frase_secundaria, font=fuente_secundaria)
        ancho_sec = caja[2] - caja[0]
        x_sec = (ancho - ancho_sec) // 2
        y_sec = (alto // 2) + 80

        dibujar.text((x_sec, y_sec), frase_secundaria, font=fuente_secundaria, fill=hex_a_rgb(colores["subtexto"]))

    # Dibujar una linea decorativa
    linea_y = (alto // 2) + 30
    linea_ancho = min(ancho // 3, 500)
    linea_x = (ancho - linea_ancho) // 2
    dibujar.rectangle(
        [linea_x, linea_y, linea_x + linea_ancho, linea_y + 10],
        fill=hex_a_rgb(colores["acento"])
    )

    # Guardar la imagen
    os.makedirs(CARPETA_SALIDA, exist_ok=True)
    nombre_archivo = f"{nicho}_{paleta_nombre}_{producto}.png"
    ruta = os.path.join(CARPETA_SALIDA, nombre_archivo)
    imagen.save(ruta, "PNG", dpi=(300, 300))

    print(f"✅ Diseno creado: {nombre_archivo}")
    print(f"   Tamano: {ancho}x{alto} pixeles | Producto: {producto}")
    return ruta

def crear_muchos_disenos(cantidad=5):
    """Crea varios disenos automaticamente"""
    print(f"\n🚀 Creando {cantidad} disenos automaticos...\n")

    nichos = list(FRASES.keys())
    paletas = list(COLORES.keys())
    productos = list(TAMANOS.keys())

    for i in range(cantidad):
        nicho = random.choice(nichos)
        paleta = random.choice(paletas)
        producto = random.choice(productos)

        crear_diseno(nicho, paleta, producto)

    print(f"\n🎉 {cantidad} disenos listos en la carpeta '{CARPETA_SALIDA}/'\n")

# -----------------------------------------------------------
# PARTE 3: AQUI ES DONDE TU DECIDES QUE CREAR
# -----------------------------------------------------------

if __name__ == "__main__":
    print("=" * 55)
    print("   ☕ GENERADOR DE DISENOS - MODO FACIL")
    print("=" * 55)

    # OPCION A: Crear UN diseno personalizado
    # Cambia el texto entre comillas por lo que tu quieras
    print("\n📌 Opcion 1: Diseno personalizado")
    crear_diseno(
        nicho="cafe",           # Elige: cafe, perros, profesores, gimnasio, viajes, sarcastico
        paleta_nombre="calido", # Elige: calido, frio, oscuro, pastel, neon
        producto="taza",        # Elige: taza, camiseta, pulover, bolso
        frase_personalizada="Cafe Cubano",  # <-- ESCRIBE AQUI TU FRASE
        subfrase_personalizada="Hecho con amor en la isla"  # <-- Y AQUI LA SUB-FRASE
    )

    # OPCION B: Crear muchos disenos automaticos
    # Descomenta la siguiente linea (quita el # del principio) para usarla
    # crear_muchos_disenos(cantidad=10)

    print("\n" + "=" * 55)
    print("✨ Revisa la carpeta 'output_designs'")
    print("📤 Envialos a tus amigos en Espana")
    print("=" * 55)
