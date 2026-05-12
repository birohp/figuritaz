from pypdf import PdfReader
import sys

def extract_text(pdf_path, output_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

if __name__ == "__main__":
    extract_text("Controle_Figurinhas_Ludopedio_pdf.pdf", "pdf_content.txt")
