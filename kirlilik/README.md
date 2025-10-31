# Kira ♻️ – Evde Atık Azaltma Asistanı

Gençler için tasarlanmış, Flask tabanlı mini sohbet asistanı. Bot; günlük ipuçları, alışveriş tüyoları, geri dönüşüm ve kompost rehberi ile haftalık mini plan sunar.

## Özellikler
- Bot mantığı: basit niyet tespiti ve hazır yanıtlar
- Hızlı yanıt butonları (quick replies)
- Modern, estetik ve mobil uyumlu arayüz
- Flask ile tek dosyalık backend + statik varlıklar

## Kurulum (Windows / PowerShell)
```powershell
cd C:\Users\TR-HALOMAN06\Desktop\kirlilik
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
python app.py
```

Tarayıcı: `http://127.0.0.1:5000`

## Yapı
```
app.py
static/
  style.css
  script.js
templates/
  index.html
requirements.txt
README.md
```
