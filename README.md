# LinguaTrail – Telefonla sınıf oyunu

Hoca sadece **telefonunu** kullanır. Öğrenciler kendi telefonlarından (mobil veri/Wi-Fi fark etmez) QR ile girer. Bilgisayar sadece **bir kere**, oyunu internete koyarken lazım.

## 1) Bir kereliğine internete koy (bilgisayarda, ~10 dk)
Telefonların farklı ağlardan girebilmesi için oyunun sabit bir internet adresi olmalı.
1. https://github.com adresinde ücretsiz hesap aç → **New repository** → adı `linguapath`.
2. Bu klasörün içindekileri (public klasörü dahil) repoya sürükle-bırak yükle (**Add file → Upload files**).
3. https://render.com → GitHub ile giriş → **New → Web Service** → `linguapath` reposunu seç. Ayarlar otomatik gelir (`render.yaml`). Plan: **Free** → Deploy.
4. 2-3 dakika sonra `https://linguapath-xxxx.onrender.com` gibi sabit bir adres verir. Bu adresi telefonuna kaydet.

Not: Ücretsiz planda site 15 dk kullanılmazsa uyur; ilk açılış ~30 sn sürer. **Derse girmeden 1-2 dk önce** adresi bir kere aç. Sıralama (`data.json`) sunucu yeniden başlayınca sıfırlanabilir.

## 2) Derste (sadece telefon)
**Hoca:** adresi aç → ekrana dokun → alttaki **CLASS** → **START MATCH**. Ekranda QR ve 4 haneli sınıf kodu çıkar. Seviyeyi (A1–C1+) seç. Telefonu açık tut (ekran kapanmaz).
**Öğrenciler:** kameradan QR'ı okutur → oyun açılır → ekrana dokun → otomatik sınıfa girer. İsmini yazabilir.
**Hoca:** öğrenciler listede görününce **PAIR & START ROUND**. Öğrenciler rastgele ikişerli eşleşir ve kendi maçları otomatik başlar (tek kalan öğrenci yapay zekâya karşı oynar). Maç bitince öğrenci MENU'ye basar, sınıf ekranına döner; hoca tekrar basarak yeni tur başlatır.
Hoca ekranında her öğrencinin **kazanma/maç · puan** değeri canlı görünür.

Tek tek arkadaşla oynamak için menüde **ONLINE QR** (2 kişilik oda) de var.

## Bilgisayarda deneme (isteğe bağlı)
`start.bat` (Windows) veya `./start.sh` → `http://localhost:3000`. Telefonların bilgisayara bağlanması okul ağında genelde engelli olduğu için gerçek kullanımda yukarıdaki yayınlama yolunu kullan.

## Notlar
- QR kodu oyunun içinde üretilir, harici bir siteye ihtiyaç duymaz.
- Telefonda: yön için ekranda parmağını sürükle, güç için basılı tut, bırakınca atış yapılır.
- Sunucu dosyaları (server.js, data.json vb.) dışarıdan açılamaz; olmayan adresler oyunu açar.

## Dosyalar
`server.js` (sunucu) · `public/index.html` (oyun) · `render.yaml` (yayın ayarı) · `start.bat`/`start.sh` (yerel deneme)
