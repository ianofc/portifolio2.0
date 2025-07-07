import os
from fpdf import FPDF

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PDF = os.path.join(ROOT_DIR, "documentacao_projeto.pdf")
MAX_FILE_SIZE = 100*1024  # 100 KB

def list_files(startpath):
    structure = []
    for root, dirs, files in os.walk(startpath):
        rel_root = os.path.relpath(root, startpath)
        structure.append((rel_root, dirs, files))
    return structure

def read_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            if len(content) > 2000:
                return content[:2000] + "\n... (conteúdo truncado)\n"
            return content
    except Exception as e:
        return f"(Não foi possível ler o arquivo: {e})"

class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, "Documentação do Projeto Newportifolio", ln=True, align="C")
        self.ln(4)

    def chapter_title(self, title):
        self.set_font("Arial", "B", 12)
        self.set_text_color(30, 144, 255)
        self.cell(0, 8, title, ln=True)
        self.set_text_color(0, 0, 0)

    def chapter_body(self, body):
        self.set_font("Courier", "", 9)
        self.multi_cell(0, 5, body)
        self.ln(2)

pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

pdf.set_font("Arial", "B", 16)
pdf.cell(0, 10, "Sumário de Pastas e Arquivos", ln=True)
pdf.ln(4)

for rel_root, dirs, files in list_files(ROOT_DIR):
    if rel_root == ".":
        rel_root = ""
    pdf.chapter_title(f"Pasta: {rel_root or ROOT_DIR}")
    for d in dirs:
        pdf.set_font("Arial", "I", 10)
        pdf.cell(0, 6, f"[DIR] {os.path.join(rel_root, d)}", ln=True)
    for f in files:
        if f == os.path.basename(__file__) or f.endswith(".pdf"):
            continue
        filepath = os.path.join(ROOT_DIR, rel_root, f)
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 6, f"Arquivo: {os.path.join(rel_root, f)}", ln=True)
        # Conteúdo do arquivo
        if os.path.getsize(filepath) < MAX_FILE_SIZE:
            content = read_file(filepath)
            pdf.chapter_body(content)
        else:
            pdf.chapter_body("(Arquivo grande demais para exibir o conteúdo completo.)")
    pdf.ln(2)

pdf.output(OUTPUT_PDF)
print(f"PDF de documentação gerado em: {OUTPUT_PDF}")
