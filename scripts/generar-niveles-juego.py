# Genera los mapas de los tres niveles y comprueba que todo sea alcanzable.
#
# Con IMPULSO_SALTO = 285 y GRAVEDAD = 760 la doctora sube 53 px: puede subir
# tres filas de golpe (48 px) pero no cuatro (64 px). De ahí las dos reglas:
#   - una plataforma es alcanzable si hay suelo o plataforma tres filas abajo
#     y a no más de tres columnas de distancia horizontal;
#   - todo objeto tiene que estar sobre una plataforma alcanzable.
FILAS = 12
SALTO_FILAS = 3

class Mapa:
    def __init__(self, nombre, lema, ancho):
        self.nombre, self.lema, self.ancho = nombre, lema, ancho
        self.f = [["." for _ in range(ancho)] for _ in range(FILAS)]
        self.plataformas = []      # (fila, c0, c1)
        self.objetos = []          # (fila, col, simbolo)

    def linea(self, fila, c0, c1, ch):
        for c in range(c0, c1 + 1):
            self.f[fila][c] = ch

    def poner(self, fila, col, ch):
        self.f[fila][col] = ch

    def suelo(self, huecos):
        self.huecos = huecos
        self.linea(10, 0, self.ancho - 1, "#")
        self.linea(11, 0, self.ancho - 1, "#")
        for (a, b) in huecos:
            assert b - a <= 2, "pozo de más de 3 baldosas: no se puede saltar"
            self.linea(10, a, b, ".")
            self.linea(11, a, b, "~")

    def plataforma(self, fila, c0, c1):
        self.linea(fila, c0, c1, "=")
        self.plataformas.append((fila, c0, c1))

    def objeto(self, fila, col, simbolo):
        self.poner(fila, col, simbolo)
        self.objetos.append((fila, col, simbolo))

    # ── comprobaciones ────────────────────────────────────────────────
    def apoyo(self, fila, c0, c1):
        """¿Hay desde dónde saltar a esta plataforma?"""
        for salto in range(1, SALTO_FILAS + 1):
            abajo = fila + salto
            if abajo >= 10:
                # el suelo cuenta si no es un pozo justo debajo del tramo
                if any(not self.en_hueco(c) for c in range(max(0, c0 - 3), min(self.ancho, c1 + 4))):
                    return True
            for (pf, pc0, pc1) in self.plataformas:
                if pf == abajo and pc0 - 3 <= c1 and pc1 + 3 >= c0:
                    return True
        return False

    def en_hueco(self, col):
        return any(a <= col <= b for (a, b) in self.huecos)

    def revisar(self):
        for (fila, c0, c1) in self.plataformas:
            for (a, b) in self.huecos:
                assert c1 < a or c0 > b, \
                    "%s: la plataforma fila %d cols %d-%d hace techo sobre el pozo %d-%d y corta el salto" % (
                        self.nombre, fila, c0, c1, a, b)
            assert self.apoyo(fila, c0, c1), \
                "%s: la plataforma fila %d cols %d-%d no es alcanzable" % (self.nombre, fila, c0, c1)
        for (fila, col, simbolo) in self.objetos:
            debajo = self.f[fila + 1][col]
            assert debajo in ("=", "#"), \
                "%s: el objeto %s en (%d,%d) flota en el aire" % (self.nombre, simbolo, fila, col)
        for fila in self.f:
            assert len(fila) == self.ancho

    def js(self):
        cuerpo = "\n".join('      "%s",' % "".join(fila) for fila in self.f)
        return '  {\n    nombre: "%s",\n    lema: "%s",\n    filas: [\n%s\n    ],\n  },' % (
            self.nombre, self.lema, cuerpo)

# ── Nivel 1 ───────────────────────────────────────────────────────────────
n1 = Mapa("Las puertas negras", "Tu primer turno de guardia.", 80)
n1.suelo([(10, 11), (53, 53)])
n1.plataforma(7, 22, 25); n1.objeto(6, 23, "j")
n1.plataforma(7, 34, 37)
n1.plataforma(4, 38, 41); n1.objeto(3, 39, "v")
n1.plataforma(7, 43, 46); n1.objeto(6, 44, "m")
n1.plataforma(7, 58, 61); n1.objeto(6, 59, "j")
for c in (17, 31, 48, 63):
    n1.poner(9, c, "o")
n1.poner(6, 35, "o")
n1.poner(9, 27, "Q")
n1.poner(9, 68, "R")
n1.poner(9, 74, "A")
n1.poner(9, 2, "P")

# ── Nivel 2 ───────────────────────────────────────────────────────────────
n2 = Mapa("El desfiladero", "Las púas y la lava no perdonan.", 96)
n2.suelo([(14, 16), (30, 32), (52, 54), (70, 71)])
n2.plataforma(7, 20, 23); n2.poner(6, 21, "o")
n2.plataforma(4, 24, 27); n2.objeto(3, 25, "j")
n2.plataforma(7, 40, 43); n2.objeto(6, 41, "m")
n2.plataforma(4, 44, 47)
n2.plataforma(1, 46, 50); n2.objeto(0, 48, "v")
n2.plataforma(7, 60, 63); n2.objeto(6, 61, "m")
n2.plataforma(7, 78, 81); n2.poner(6, 79, "o")
n2.plataforma(4, 74, 77); n2.objeto(3, 75, "j")
n2.linea(9, 36, 37, "^")
n2.poner(9, 65, "^")
for c in (10, 26, 45, 58, 76, 88):
    n2.poner(9, c, "o")
n2.poner(9, 19, "Q")
n2.poner(9, 49, "R")
n2.poner(9, 67, "Q")
n2.poner(9, 84, "R")
n2.poner(9, 92, "A")
n2.poner(9, 2, "P")

# ── Nivel 3 ───────────────────────────────────────────────────────────────
n3 = Mapa("La montaña de fuego", "Hasta el Capitán necesita anestesia.", 108)
n3.suelo([(16, 18), (34, 36), (45, 47), (62, 64), (75, 77)])
n3.plataforma(7, 24, 27); n3.poner(6, 25, "o")
n3.plataforma(4, 28, 31); n3.objeto(3, 29, "j")
n3.plataforma(7, 38, 41); n3.objeto(6, 39, "j")
n3.plataforma(7, 50, 53); n3.objeto(6, 51, "m")
n3.plataforma(4, 54, 57)
n3.plataforma(1, 56, 60); n3.objeto(0, 58, "v")
n3.plataforma(7, 66, 69); n3.objeto(6, 67, "m")
n3.plataforma(4, 70, 73); n3.objeto(3, 71, "j")
n3.linea(9, 28, 29, "^")
n3.poner(9, 71, "^")
for c in (12, 22, 43, 59, 80, 88):
    n3.poner(9, c, "o")
n3.poner(9, 20, "Q")
n3.poner(9, 49, "R")
n3.poner(9, 84, "Q")
n3.poner(9, 96, "C")
n3.poner(9, 104, "A")
n3.poner(9, 2, "P")

niveles = [n1, n2, n3]
for nivel in niveles:
    nivel.revisar()
print("const NIVELES = [")
for nivel in niveles:
    print(nivel.js())
print("];")
