import pdfplumber, re, json
from collections import defaultdict

PDF = "Canadian-Nutrition-Guide-Final-Secure.pdf"
COLS = ["weight_g","calories_kcal","calories_from_fat","fat_g","saturated_fat_g",
        "trans_fat_g","cholesterol_mg","sodium_mg","carbohydrates_g","fibre_g",
        "total_sugars_g","protein_g"]
NUT = COLS[1:]  # exclude weight from nutrition object? keep weight separate

SAUCE_ORDER = ["Pizza Sauce","BBQ Sauce","Alfredo Sauce","Garlic Parmesan White Sauce",
               "Hearty Marinara Sauce","Hearty Marinara","Ranch","Donair Sauce*"]
SAUCE_SET = set(SAUCE_ORDER)
CHEESE_TIERS = ["Light Cheese","Regular Cheese","Extra Cheese","Double Cheese","Triple Cheese"]
CHEESE_SET = set(CHEESE_TIERS)

# page -> (size, crust display names list)
PAGE_META = {
 1:("6\" Personal", ["Hand Tossed"]),
 2:("Small", ["Gluten Free"]),
 3:("Small", ["Crunchy Thin"]),
 4:("Small", ["Hand Tossed"]),
 5:("Medium", ["Crunchy Thin"]),
 6:("Medium", ["Hand Tossed"]),
 7:("Medium", ["Pan"]),
 8:("Medium", ["New York Style"]),
 9:("Medium", ["Parmesan Stuffed Crust"]),
 10:("Large", ["Hand Tossed","Crunchy Thin"]),
 11:("Large", ["New York Style"]),
 12:("X-Large", ["Hand Tossed"]),
 13:("X-Large", ["New York Style"]),
}

def fnum(s):
    try: return float(s)
    except: return None
def is_num(t): return bool(re.fullmatch(r"\d+(\.\d+)?", t))
def clean_name(s):
    s = s.replace("�","ñ").replace("Jalapeno","Jalapeño")
    s = re.sub(r"\s+"," ",s).strip()
    return s

def get_rows(page):
    words = page.extract_words(keep_blank_chars=False)
    rows = defaultdict(list)
    for w in words: rows[round(w['top']/2.0)].append(w)
    return [sorted(rows[t],key=lambda w:w['x0']) for t in sorted(rows)]

def parse_row(row):
    nums=[w for w in row if is_num(w['text']) and w['x0']>=276]
    name_tok=[w for w in row if 140<=w['x0']<276 and not (is_num(w['text']) and w['x0']>=276)]
    if len(nums)<12: return None
    nums=sorted(nums,key=lambda w:w['x0'])[:12]
    vals=[fnum(w['text']) for w in nums]
    name=clean_name(" ".join(w['text'] for w in name_tok))
    return name, dict(zip(COLS,vals))

pdf=pdfplumber.open(PDF)
pizzas=[]
for pi,(size,crust_names) in PAGE_META.items():
    page=pdf.pages[pi]
    words=page.extract_words()
    serv=""
    for top in sorted(set(round(w['top']/2) for w in words)):
        line=[w for w in words if round(w['top']/2)==top]
        txt=" ".join(w['text'] for w in sorted(line,key=lambda w:w['x0']))
        m=re.search(r"1/\d+ of pizza[^A-Za-z]*(or [\d ]*slices?)?", txt)
        if txt.strip().startswith("Size of") or m:
            serv=clean_name(re.sub(r"(loretselohC|detarutaS|sraguS|rebiF|\).g\().*","",txt)); break
    parsed=[r for r in (parse_row(r) for r in get_rows(page)) if r]
    if not parsed: 
        print("WARN no rows p",pi); continue
    ncrust=len(crust_names)
    crust_rows=parsed[:ncrust]
    rest=parsed[ncrust:]
    sauces=[];cheeses=[];cheese_seen=set();toppings=[];topping_seen=set()
    for name,nut in rest:
        nm=name
        tier=" ".join(nm.split()[:2])
        if nm in SAUCE_SET:
            sauces.append({"name":nm.replace(" Sauce","") if nm!="Pizza Sauce" else nm,"raw":nm,"nutrition":nut})
        elif tier in CHEESE_SET:
            if tier not in cheese_seen:
                cheese_seen.add(tier); cheeses.append({"name":tier,"nutrition":nut})
        else:
            key=nm.rstrip("*")
            if not nm or key in topping_seen: continue
            topping_seen.add(key)
            toppings.append({"name":key,"limited":nm.endswith("*"),"nutrition":nut})
    for ci,cname in enumerate(crust_names):
        pizzas.append({
            "size":size,"crust":cname,"serving":serv,
            "crust_nutrition":crust_rows[ci][1],
            "sauces":sauces,"cheeses":cheeses,"toppings":toppings,
        })

json.dump({"pizzas":pizzas},open("nutrition-data/pizza_components.json","w"),indent=1)
# sanity print
for p in pizzas:
    print(f"{p['size']:11s} {p['crust']:22s} serv={p['serving'][:34]:34s} crustCal={p['crust_nutrition']['calories_kcal']} sauces={len(p['sauces'])} cheese={len(p['cheeses'])} top={len(p['toppings'])}")
