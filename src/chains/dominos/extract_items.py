import pdfplumber, re, json
from collections import defaultdict, Counter
PDF = "Canadian-Nutrition-Guide-Final-Secure.pdf"
COLS = ["weight_g","calories_kcal","calories_from_fat","fat_g","saturated_fat_g","trans_fat_g",
        "cholesterol_mg","sodium_mg","carbohydrates_g","fibre_g","total_sugars_g","protein_g"]

def fnum(s):
    try: return float(s)
    except: return None
def is_num(t): return bool(re.fullmatch(r"\d+(\.\d+)?", t))
def clean(s):
    s = s.replace("�", "ñ")
    s = re.sub(r"Jalape[^A-Za-z]*o", "Jalapeño", s)
    s = s.replace("Phlly", "Philly")
    s = re.sub(r"[^\x00-\x7Fñ&\"']", " ", s)
    return re.sub(r"\s+", " ", s).strip()
def get_rows(page):
    words = page.extract_words(keep_blank_chars=False)
    rows = defaultdict(list)
    for w in words:
        rows[round(w['top']/2.0)].append(w)
    return [(t*2.0, sorted(rows[t], key=lambda w: w['x0'])) for t in sorted(rows)]
def nut12(nums):
    vals = [fnum(w['text']) for w in sorted(nums, key=lambda w: w['x0'])[:12]]
    return dict(zip(COLS, vals))
def nearest_assign(datarows, frags):
    buckets = {i: [] for i in range(len(datarows))}
    for ft, txt in frags:
        i = min(range(len(datarows)), key=lambda i: abs(datarows[i]['top']-ft))
        buckets[i].append((ft, txt))
    for i, d in enumerate(datarows):
        d['namefrag'] = clean(" ".join(t for _, t in sorted(buckets[i])))

pdf = pdfplumber.open(PDF)
items = []
SIZEMAP = {"S":"Small","M":"Medium","L":"Large","XL":"X-Large"}
BOILER = re.compile(r"Serving|Weight|Amount|Calories|Sugars|Carbohyd|Cholesterol|Sodium|Protein|Fiber|Trans|Saturated|Ingredient|Nutrition|proper bake"
                    r"|eziS|gnivreS|thgieW|seirolaC|muidoS|nietorP|rebiF|sraguS|setardyhobraC|loretselohC|detarutaS|snarT", re.I)
UNIT_LEAD = re.compile(r"^(poutine|tainer|container|brownie|cake|cup|order|slices?|pieces?|Dish|ml)\s+", re.I)

def frac_serv(serv):
    m = re.search(r"1/\d+ of pizza", serv)
    return m.group(0) if m else serv

def parse_feast(pi):
    rows = get_rows(pdf.pages[pi])
    datarows = []; frags = []
    for top, row in rows:
        nums = [w for w in row if is_num(w['text']) and w['x0'] >= 276]
        if len(nums) >= 12:
            serv = " ".join(w['text'] for w in row if 205 <= w['x0'] < 276)
            datarows.append({"top": top, "serv": serv, "nut": nut12(nums)})
        else:
            txt = clean(" ".join(w['text'] for w in row if w['x0'] < 205))
            if txt and top > 88 and not BOILER.search(txt) and "crust)" not in txt and len(txt) > 2:
                frags.append((top, txt))
    groups = [datarows[i:i+4] for i in range(0, len(datarows), 4)]
    for g in groups:
        lo = min(d['top'] for d in g); hi = max(d['top'] for d in g)
        cand = [t for (ft, t) in frags if lo-5 <= ft <= hi+5]
        name = clean(" ".join(cand)) if cand else "Feast Pizza"
        for d in g:
            m = re.match(r"(S|M|L|XL)\b", d['serv']); sz = SIZEMAP.get(m.group(1), "") if m else ""
            items.append({"name": f"{name} ({sz})", "category": "Feast Pizzas", "subcategory": name,
                          "serving": frac_serv(d['serv']), "nutrition": d['nut']})
parse_feast(14); parse_feast(15)

def parse_specialty():
    rows = get_rows(pdf.pages[19])
    datarows = []; frags = []
    for top, row in rows:
        nums = [w for w in row if is_num(w['text']) and w['x0'] >= 276]
        if len(nums) >= 12:
            serv = " ".join(w['text'] for w in row if 205 <= w['x0'] < 276)
            datarows.append({"top": top, "serv": serv, "nut": nut12(nums)})
        else:
            txt = clean(" ".join(w['text'] for w in row if w['x0'] < 276))
            if txt and not BOILER.search(txt) and len(txt) > 2:
                frags.append((top, txt))
    for d in datarows:
        near = [t for (ft, t) in frags if abs(ft-d['top']) <= 7]
        lab = clean(" ".join(near))
        big = "Domino's 6 Cheese" if re.search(r"6 Cheese", lab, re.I) else ("Buffalo Chicken" if re.search(r"Buffalo", lab, re.I) else "Specialty")
        cm = re.search(r"\((Gluten Free|Crunchy Thin[^)]*|NYS|Pan)\)", lab)
        crust = cm.group(1).replace("Crunchy Thin Crust", "Crunchy Thin") if cm else ""
        m = re.match(r"(S|M|L|XL)\b", d['serv']); sz = SIZEMAP.get(m.group(1), "") if m else ""
        nm = big + " Pizza"
        full = f"{nm} ({sz}{', '+crust if crust else ''})"
        items.append({"name": full, "category": "Specialty Pizzas", "subcategory": nm,
                      "serving": frac_serv(d['serv']), "nutrition": d['nut']})
# parse_specialty()  # page 19 crust-variants are messy & redundant with Feast pizzas; skipped

SECTIONS = [("BYO","BYO Pasta"),("TOPPINGS","Pasta Toppings"),("DIPPING","Dipping Cups"),
            ("BREADS","Breads"),("CHICKEN","Chicken"),("PASTA","Pasta"),("DESSERTS","Desserts"),("OTHER","Other")]
SERV_RE = re.compile(r"(\d+/\d+|\d+)\s*(pieces?|piece|Dish|order|packet|cups?|cake|brownie|poutine|con-?\s*tainer|slices?|ml)", re.I)
def parse_sides(pi, start_cat):
    rows = get_rows(pdf.pages[pi])
    headers = []; datarows = []; frags = []
    for top, row in rows:
        joined = " ".join(w['text'] for w in row)
        nums = [w for w in row if is_num(w['text']) and w['x0'] >= 205]
        sec = None
        for key, cat in SECTIONS:
            if re.search(rf"\b{key}\b", joined) and len(nums) < 12:
                sec = cat; break
        if sec and len(nums) < 12 and len(row) <= 4:
            headers.append((top, sec)); continue
        if len(nums) >= 12:
            serv = " ".join(w['text'] for w in row if 165 <= w['x0'] < 206)
            namepart = clean(" ".join(w['text'] for w in row if w['x0'] < 206))
            datarows.append({"top": top, "serv": serv, "nut": nut12(nums), "selfname": namepart})
        else:
            txt = clean(" ".join(w['text'] for w in row if w['x0'] < 206))
            if txt and not BOILER.search(txt) and not re.match(r"^\(?\d", txt) and len(txt) > 1:
                frags.append((top, txt))
    nearest_assign(datarows, frags)
    def catfor(top):
        c = start_cat
        for ht, cat in headers:
            if ht <= top+3: c = cat
        return c
    for d in datarows:
        label = clean((d['namefrag'] + " " + d['selfname']).strip())
        sm = SERV_RE.search(label)
        serv = sm.group(0) if sm else clean(d['serv'])
        name = clean(label.replace(serv, "")) if serv else label
        name = UNIT_LEAD.sub("", name)
        name = clean(re.sub(r"^\d+\s+(?=[A-Z])", "", name))
        cat = catfor(d['top'])
        if cat in ("BYO Pasta","Pasta Toppings","Dipping Cups"): continue
        if not name or len(name) < 2: continue
        items.append({"name": name, "category": cat, "subcategory": cat, "serving": clean(serv), "nutrition": d['nut']})
parse_sides(20, "Breads"); parse_sides(21, "Pasta"); parse_sides(22, "Other")

json.dump({"items": items}, open("nutrition-data/menu_items.json", "w"), indent=1)
print("TOTAL:", len(items))
for c, n in Counter(i['category'] for i in items).items(): print("  ", c, n)
print()
for i in items:
    if i['category'] in ("Specialty Pizzas","Breads","Chicken","Pasta","Desserts","Other"):
        print(f"{i['category'][:9]:9s}|{i['name'][:50]:50s}|{str(i['serving'])[:15]:15s}|{i['nutrition']['calories_kcal']}c {i['nutrition']['protein_g']}p")
