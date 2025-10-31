from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime


app = Flask(__name__)


WELCOME_MESSAGES = [
    "Merhaba! Ben Kira – evde atık azaltma yolculuğunda yanındayım. 🎒♻️",
    "Hazır mısın? Küçük adımlarla büyük fark yaratacağız. Hadi başlayalım!",
]


QUICK_REPLIES = [
    {"title": "Nereden başlamalıyım?", "payload": "start"},
    {"title": "Günlük ipucu", "payload": "daily_tip"},
    {"title": "Alışverişte azalt", "payload": "shopping"},
    {"title": "Geri dönüşüm 101", "payload": "recycle"},
    {"title": "Kompost rehberi", "payload": "compost"},
    {"title": "Haftalık mini plan", "payload": "weekly_plan"},
]


INTENTS = {
    "greet": ["selam", "merhaba", "hey", "sa", "selamlar"],
    "start": ["nereden", "başla", "başlamak", "nasıl başlarım", "start"],
    "daily_tip": ["ipucu", "günlük ipucu", "tip", "daily_tip"],
    "shopping": ["alışveriş", "market", "satın alma", "shopping"],
    "recycle": ["geri dönüşüm", "recycle", "ayırma", "çöp ayrımı"],
    "compost": ["kompost", "organik", "yemek artığı", "compost"],
    "weekly_plan": ["plan", "haftalık", "program", "weekly_plan"],
    "goals": ["hedef", "hedefler", "goal"],
}


def detect_intent(message: str) -> str:
    text = (message or "").lower().strip()
    if not text:
        return "unknown"
    for intent, keywords in INTENTS.items():
        if any(keyword in text for keyword in keywords):
            return intent
    # simple fallbacks
    if any(x in text for x in ["plastik", "poşet", "şişe"]):
        return "shopping"
    if any(x in text for x in ["cam", "kağıt", "metal", "karton", "pet"]):
        return "recycle"
    if any(x in text for x in ["kabuk", "meyve", "sebze", "organik"]):
        return "compost"
    return "unknown"


def reply_for_intent(intent: str):
    if intent == "greet":
        return {
            "text": f"{WELCOME_MESSAGES[0]} {WELCOME_MESSAGES[1]}",
            "quick_replies": QUICK_REPLIES,
        }

    if intent == "start":
        return {
            "text": (
                "Başlamak için 3 basit adım öneriyorum:\n"
                "1) ÇIKAR: Evde en çok çıkan 3 atığı not et (örn. plastik şişe, ambalaj, kağıt).\n"
                "2) YER DEĞİŞTİR: Çöpe en yakın görülen yere geri dönüşüm kutusu koy.\n"
                "3) YERİNE KOY: Tek kullanımlık yerine tekrar kullanılabilir ürün hazırla (matara, bez çanta, kutu)."
            ),
            "quick_replies": QUICK_REPLIES,
        }

    if intent == "daily_tip":
        tips = [
            "Bugün su alırken tek kullanımlık şişe yerine matarayı doldurmayı dene. 💧",
            "Kahveni termosla al – hem sıcak kalır hem de atık çıkmaz. ☕",
            "Ekmek, sebze gibi ürünleri file/bez çantayla al – poşetsiz dene. 🧺",
            "Kargolardan gelen kutuları sakla, depolama veya iade için kullan. 📦",
        ]
        idx = datetime.now().day % len(tips)
        return {"text": tips[idx], "quick_replies": QUICK_REPLIES}

    if intent == "shopping":
        return {
            "text": (
                "Alışverişte azaltma taktikleri:\n"
                "- Listeyle git, spontane paketli atıştırmalıkları azalt.\n"
                "- Büyük boy ve yeniden doldurulabilir ürünleri tercih et.\n"
                "- Bez çanta + file + matara üçlüsünü hep yanında tut.\n"
                "- Tek kullanımlık yerine uzun ömürlü: tıraş bıçağı, kalem, saklama kabı."
            ),
            "quick_replies": QUICK_REPLIES,
        }

    if intent == "recycle":
        return {
            "text": (
                "Geri dönüşüm 101 (TR genel):\n"
                "- Mavi: Kağıt/karton\n"
                "- Sarı: Plastik\n"
                "- Yeşil: Cam\n"
                "- Gri: Metal\n"
                "Kutulara atarken: içini hızlıca çalkala, sıkıştır, temiz ve kuru olsun."
            ),
            "quick_replies": QUICK_REPLIES,
        }

    if intent == "compost":
        return {
            "text": (
                "Kompost kısa rehber:\n"
                "- UYGUN: meyve-sebze kabukları, kahve posası, çay posası, yumurta kabuğu.\n"
                "- UYGUN DEĞİL: et, süt ürünleri, yağlı yemek artığı.\n"
                "- İPUCU: Kapaklı bir kutu + kahverengi (karton/kuru yaprak) + yeşil (mutfak artığı) denge."
            ),
            "quick_replies": QUICK_REPLIES,
        }

    if intent == "weekly_plan":
        return {
            "text": (
                "Haftalık mini plan:\n"
                "Pzt: En çok çıkan 3 atığı say.\n"
                "Salı: Geri dönüşüm kutusu kur.\n"
                "Çar: Tek kullanımlıkları alternatifle değiştir.\n"
                "Per: Market listesi + bez çanta hazırla.\n"
                "Cum: Kompost kapası planla.\n"
                "Cmt: 30 dk dolap/çekmece düzenle (yeniden kullan).\n"
                "Paz: Haftayı değerlendir, 1 yeni hedef ekle."
            ),
            "quick_replies": QUICK_REPLIES,
        }

    if intent == "goals":
        return {
            "text": (
                "Hedef fikirleri:\n"
                "- Haftada 3 tek kullanımlık ürünü sıfıra indir.\n"
                "- 1 ayda plastik ambalajı %30 azalt.\n"
                "- Her gün matarayla su iç.\n"
                "- Haftada 1 kez kompost kutusunu besle."
            ),
            "quick_replies": QUICK_REPLIES,
        }

    return {
        "text": (
            "Anladım! Daha iyi yardımcı olabilmem için şunu deneyebilirsin: \n"
            "'Nereden başlamalıyım?', 'Günlük ipucu', 'Geri dönüşüm 101', 'Kompost' veya 'Haftalık plan'"
        ),
        "quick_replies": QUICK_REPLIES,
    }


@app.route("/")
def index():
    return render_template("index.html", welcome=WELCOME_MESSAGES, quick_replies=QUICK_REPLIES)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "")
    payload = data.get("payload")

    intent = payload or detect_intent(user_message)
    response = reply_for_intent(intent)
    return jsonify(response)


@app.route("/smart_chat", methods=["POST"])
def smart_chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return jsonify({
            "text": (
                "Akıllı sohbet için API anahtarı gerekli. Lütfen ortam değişkeni olarak OPENAI_API_KEY ayarlayın.\n"
                "Geçici olarak klasik önerilerle devam ediyorum."
            ),
            "quick_replies": QUICK_REPLIES,
        })
    # Not implemented in demo – avoid external call by default
    return jsonify({
        "text": "Akıllı sohbet entegrasyonu bu demoda pasif. (Güvenlik için devre dışı)",
        "quick_replies": QUICK_REPLIES,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


