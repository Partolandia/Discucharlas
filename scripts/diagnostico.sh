#!/usr/bin/env bash
# Dice en qué estado está esta copia del proyecto. Pega la salida completa.
echo "carpeta:    $(pwd)"
echo "rama:       $(git rev-parse --abbrev-ref HEAD 2>&1)"
echo "commit:     $(git rev-parse --short HEAD 2>&1)"
echo "remoto:     $(git config --get remote.origin.url 2>&1)"
echo "en GitHub:  $(git ls-remote --heads origin main 2>/dev/null | cut -c1-7)"
echo
echo "¿/entrar tiene el formulario?"
if grep -q "FormularioAcceso" src/app/entrar/page.tsx 2>/dev/null; then
  echo "  sí - el código local está al día"
else
  echo "  NO - esta copia es vieja; falta traer los cambios"
fi
echo
echo "cambios sin guardar:"
git status --short 2>&1 | head -10 || true
echo
echo "compilación previa en caché: $([ -d .next ] && echo "sí (.next existe)" || echo "no")"
echo "node: $(node -v 2>&1)"
