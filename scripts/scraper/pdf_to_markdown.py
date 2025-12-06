import pdfplumber
import re


def parse_polish_law_pdf(pdf_path, output_md_path):
    print(f"🔄 Rozpoczynam przetwarzanie pliku: {pdf_path}...")

    full_text = ""

    # 1. Ekstrakcja tekstu z PDF
    # Korzystamy z pdfplumber, bo najlepiej radzi sobie z układem szpaltowym i tabelami
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            # Wyciągamy tekst. x_tolerance pomaga łączyć literki w słowa
            text = page.extract_text(x_tolerance=2)
            if text:
                full_text += text + "\n"

            # Prosty pasek postępu
            if i % 10 == 0:
                print(f"   Przetworzono stronę {i + 1}/{total_pages}")

    print("✅ Ekstrakcja tekstu zakończona. Rozpoczynam formatowanie...")

    # 2. Czyszczenie "śmieci" (nagłówki/stopki ISAP)
    # Usuwamy numery stron, daty i frazy typu "Kancelaria Sejmu"
    lines = full_text.split("\n")
    cleaned_lines = []

    footer_pattern = re.compile(r"©Kancelaria Sejmu|s\. \d+/\d+|^\d{4}-\d{2}-\d{2}$")

    for line in lines:
        if not footer_pattern.search(line):
            cleaned_lines.append(line)

    text_content = "\n".join(cleaned_lines)

    # 3. Logika Regex - Zamiana struktury prawnej na Markdown
    # To jest kluczowe dla "Legislative Train Schedule" - tworzymy strukturę

    replacements = [
        # H1 - Księgi (np. KSIĘGA PIERWSZA)
        (r"(^|\n)(KSIĘGA [A-ZŚĆŹŻŁÓĘĄ]+)", r"\n\n# \2\n"),
        # H2 - Tytuły (np. TYTUŁ I)
        (r"(^|\n)(TYTUŁ [A-ZIVX]+)", r"\n\n## \2\n"),
        # H3 - Działy (np. DZIAŁ I)
        (r"(^|\n)(DZIAŁ [A-ZIVX]+)", r"\n\n### \2\n"),
        # H4 - Rozdziały (np. Rozdział I)
        (r"(^|\n)(Rozdział [A-ZIVX]+)", r"\n\n#### \2\n"),
        # Artykuły - Pogrubienie i nowa linia (np. Art. 1.)
        # Wyłapujemy "Art. 123." lub "Art. 123 § 1."
        (r"(^|\n)(Art\.\s\d+[a-z]*\.)", r"\n\n**\2**"),
        # Paragrafy - wcięcie punktowane
        (r"(^|\n)(§\s\d+\.)", r"\n\n* \2"),
    ]

    for pattern, replacement in replacements:
        text_content = re.sub(pattern, replacement, text_content)

    # 4. Usunięcie wielokrotnych pustych linii
    text_content = re.sub(r"\n{3,}", "\n\n", text_content)

    # 5. Zapis do pliku
    with open(output_md_path, "w", encoding="utf-8") as f:
        # Dodajemy nagłówek Frontmatter (opcjonalnie dla Hugo/Jekyll/Next.js)
        f.write(
            "---\
"
        )
        f.write(f"title: Kodeks Cywilny (Auto-generated)\n")
        f.write("source: ISAP (Kancelaria Sejmu)\n")
        f.write("type: law-document\n")
        f.write(
            "---\
\n"
        )
        f.write(text_content)

    print(f"🚀 Sukces! Plik zapisano jako: {output_md_path}")


# --- PRZYKŁAD UŻYCIA ---
# 1. Pobierz PDF Kodeksu Cywilnego z ISAP za pomocą: ../download/download_pdf.sh
# 2. PDF zostanie zapisany w ../output/kodeks.pdf
# 3. Uruchom skrypt.

if __name__ == "__main__":
    import sys
    import os

    # Ścieżka do output directory (tymczasowo dla PDF)
    scripts_dir = os.path.dirname(__file__)
    output_dir = os.path.join(scripts_dir, "..", "output")
    input_pdf = os.path.join(output_dir, "kodeks.pdf")

    # Ścieżka do public/laws/ dla Markdown
    public_laws_dir = os.path.join(scripts_dir, "..", "..", "public", "laws")
    output_md = os.path.join(public_laws_dir, "kodeks_cywilny.md")

    if not os.path.exists(input_pdf):
        print(f"❌ Błąd: Plik {input_pdf} nie istnieje!")
        print("Pobierz PDF za pomocą: ./scripts/download/download_pdf.sh")
        sys.exit(1)

    # Upewnij się, że katalog istnieje
    os.makedirs(public_laws_dir, exist_ok=True)

    parse_polish_law_pdf(input_pdf, output_md)
