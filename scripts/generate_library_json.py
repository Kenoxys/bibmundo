#!/usr/bin/env python3
"""Genera un archivo JSON con la lista de PDFs de la carpeta LIBRARY.

El archivo resultante se coloca en pwa/library.json para que la PWA lo consuma.

Este script usa `pdfinfo` (poppler-utils) para extraer el título de cada PDF.
"""

import json
import os
import re
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LIB_DIR = os.path.join(ROOT, 'LIBRARY')
OUTPUT = os.path.join(ROOT, 'pwa', 'library.json')

CATEGORY_RULES = [
    ('biblia', ['biblia', 'reina', 'renia', 'diccionario', 'comentario', 'biblico', 'biblical']),
    ('estudio', ['estudio', 'concordancia', 'geografía', 'geografia', 'concordance']),
    ('predicacion', ['sermón', 'sermon', 'doctrina', 'predicaci', 'preaching']),
    ('pastoral', ['pastoral', 'eclesiología', 'eclesiologia', 'pastor']),
]


def title_from_pdf(path: str) -> str:
    try:
        out = subprocess.check_output(['pdfinfo', path], stderr=subprocess.DEVNULL, text=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        return os.path.splitext(os.path.basename(path))[0]
    for line in out.splitlines():
        if line.startswith('Title:'):
            return line.split(':', 1)[1].strip() or os.path.splitext(os.path.basename(path))[0]
    return os.path.splitext(os.path.basename(path))[0]


def choose_category(title: str) -> str:
    text = title.lower()
    for cat, keywords in CATEGORY_RULES:
        for kw in keywords:
            if kw in text:
                return cat
    return 'otro'


def main() -> None:
    if not os.path.isdir(LIB_DIR):
        raise SystemExit(f'No se encontró la carpeta LIBRARY en: {LIB_DIR}')

    items = []
    for filename in sorted(os.listdir(LIB_DIR)):
        if not filename.lower().endswith('.pdf'):
            continue
        path = os.path.join(LIB_DIR, filename)
        title = title_from_pdf(path)
        # Correcciones comunes de metadatos
        title = title.replace('Renia-', 'Reina-').replace('Renia ', 'Reina ')
        category = choose_category(title)
        item = {
            'id': os.path.splitext(filename)[0],
            'file': f'/LIBRARY/{filename}',
            'title': title,
            'category': category,
            'excerpt': '',
        }
        items.append(item)

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump({'books': items}, f, ensure_ascii=False, indent=2)

    print(f'Generado {OUTPUT} con {len(items)} entradas.')


if __name__ == '__main__':
    main()
