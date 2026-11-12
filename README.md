# LinguaPath – Sunucu + Oyun

Oyun ve çok oyunculu (QR/kod) sistem tek pakette. Ek kurulum yok, sadece **Node.js** (v16 veya üstü) gerekir: https://nodejs.org

## Çalıştırma
- **Windows:** `start.bat` dosyasına çift tıkla.
- **Linux/Pardus/Mac:** `./start.sh` veya `node server.js`

Konsolda iki adres çıkar:
- `http://localhost:3000` → bu bilgisayarda oyunu aç
- `http://192.168.x.x:3000` → telefonlar bu adresten bağlanır (aynı Wi-Fi/ağ)

Oyunu **bu sunucu adresinden** aç (HTML dosyasına çift tıklayarak değil). QR kod otomatik olarak telefonun erişebileceği ağ adresini kodlar.

## Nasıl oynanır (ONLINE QR)
1. Menüde **ONLINE QR** → START MATCH. Lobide QR ve 4 haneli kod görünür.
2. Arkadaşın QR'ı telefonuyla okutur, oyun açılır, kendi kodunu görür.
3. Biri diğerinin kodunu alttaki kutuya yazıp JOIN'e basar. Katılan arkadaş misafir olur, diğeri kurucu kalır.
4. Kurucu seviyeyi seçer ve START MATCH der.

## Sunucu ne yapar
- Odaları ve oyuncuları yönetir (oda başına 2 kişi, kurucu yetkisi: seviye/başlat sadece kurucuda).
- Atış ve cevap olaylarını iki oyuncuya canlı iletir (SSE + POST). Kısa kopmalarda kaçırılan olaylar yeniden gönderilir.
- Ortak sıralama tablosunu `data.json` dosyasında tutar (herkes aynı tabloyu görür).

## Güvenlik duvarı / internet
- Windows ilk çalıştırmada izin sorarsa **Özel ağlara izin ver**'i seç.
- İnternetten herkese açmak istersen klasörü Render/Railway/VPS gibi bir yere koyup `node server.js` çalıştır (`PORT` ortam değişkenini destekler). HTTPS adresinde QR doğrudan o adresi kodlar.
- İnternet yoksa QR kütüphanesi için `qrcode.min.js` dosyasını `public/` klasörüne koy (cdnjs'deki qrcodejs 1.0.0).

## Dosyalar
`server.js` (backend) · `public/index.html` (oyun) · `start.bat` / `start.sh` · `data.json` (otomatik oluşur)
