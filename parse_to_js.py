import re

def parse_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    categories = []
    
    for line in lines:
        line = line.strip()
        if not line: continue
        if "CONTROLE DE FIGURINHAS" in line or "DA COPA 2026" in line: continue
        
        # Caso especial para Estados Unidos
        line = line.replace("Estados UnidosUSA1", "Estados Unidos USA1")
        line = line.replace("Costa do MarfimCIV1", "Costa do Marfim CIV1")
        line = line.replace("Arábia SauditaKSA1", "Arábia Saudita KSA1")
        line = line.replace("Cabo VerdeCPV1", "Cabo Verde CPV1")
        line = line.replace("Nova ZelândiaNZL1", "Nova Zelândia NZL1")
        line = line.replace("África do SulRSA1", "África do Sul RSA1")
        line = line.replace("Coreia do SulKOR1", "Coreia do Sul KOR1")
        line = line.replace("Rep. TchecaCZE1", "Rep. Tcheca CZE1")
        
        parts = line.split()
        if len(parts) < 2: continue
        
        name_parts = []
        sticker_codes = []
        
        found_code = False
        for p in parts:
            # Se já encontramos códigos ou se esta parte parece um código (tem número)
            if found_code:
                sticker_codes.append(p)
            else:
                # Códigos típicos: FWC1, MEX1, 00, CC1
                if re.search(r'\d', p):
                    found_code = True
                    sticker_codes.append(p)
                else:
                    name_parts.append(p)
        
        if sticker_codes:
            category_name = " ".join(name_parts)
            
            # Caso especial para "GrupoPaís"
            if "GrupoPaís" in category_name:
                category_name = "FIFA World Cup"
            
            # Filtrar categorias inválidas (como "Página inicial" ou "L", "A" que aparecem no PDF)
            if category_name in ["L", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "Página inicial", "DA COPA", "Fifa World Cup History"]:
                continue

            categories.append({
                "id": category_name.lower().replace(" ", "_"),
                "name": category_name,
                "stickers": sticker_codes
            })

    return categories

def generate_js(categories):
    js_content = "export const CATEGORIES = [\n"
    for cat in categories:
        js_content += f"  {{ id: '{cat['id']}', name: '{cat['name']}', stickers: {cat['stickers']} }},\n"
    js_content += "];\n\n"
    
    total = sum(len(cat['stickers']) for cat in categories)
    js_content += f"export const TOTAL_STICKERS = {total};\n\n"
    
    js_content += """
export const calculateStats = (collection) => {
  const total = TOTAL_STICKERS;
  const coladas = Object.values(collection).filter(s => s.status === 'collected').length;
  const repetidas = Object.values(collection).reduce((acc, s) => acc + (s.repeated || 0), 0);
  const faltando = total - coladas;
  const porcentagem = total > 0 ? ((coladas / total) * 100).toFixed(1) : 0;

  return { total, coladas, repetidas, faltando, porcentagem };
};
"""
    return js_content

if __name__ == "__main__":
    cats = parse_txt("pdf_content.txt")
    js = generate_js(cats)
    with open("src/lib/stickers.js", "w", encoding="utf-8") as f:
        f.write(js)
