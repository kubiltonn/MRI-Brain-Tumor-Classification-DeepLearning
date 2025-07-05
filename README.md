# Beyin Tümörü Segmentasyon Paneli

## Proje Tanımı ve Amacı

Bu proje, MR görüntülerinden beyin tümörü segmentasyonu ve sınıflandırması yapan bir yapay zeka modelini, doktorlar için kullanıcı dostu ve şık bir web paneliyle birleştirir. Doktorlar, hasta ve MR bilgilerini kolayca yönetebilir, yüklenen MR görüntüsünden otomatik olarak tümör tahmini alabilirler.

## Kullanılan Teknolojiler

- **Frontend:** React.js, Material UI (MUI)
- **Backend:** Python, Flask, TensorFlow/Keras
- **Model:** Beyin tümörü sınıflandırma modeli (glioma, meningioma, pituitary, no tumor)
  **Diğer Araçlar:** NumPy, scikit-learn, OpenCV, Matplotlib, Seaborn
  **Geliştirme Ortamı**:Google Colab, Visual Studio Code

## Kurulum ve Çalıştırma

### 1. Backend (API)

1. `backend` klasörüne girin.
2. Gerekli paketleri yükleyin:
   ```bash
   pip install -r requirements.txt
   ```
3. Sunucuyu başlatın:

   ```bash
   python app.py
   ```

   Sunucu varsayılan olarak `http://localhost:5000` adresinde çalışır.

4. POST /predict
   Açıklama: Frontend’den yüklenen MRI görüntüsünü alır, model üzerinde tahmin yapar ve olasılıkları JSON formatında döner.

İstek:

Content-Type: multipart/form-data

Parametre:

file: MRI görüntüsü (örn. .jpg veya .png)

Yanıt:

Content-Type: application/json

### 2. Frontend (Arayüz)

1. `frontend` klasörüne girin.
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı başlatın:
   ```bash
   npm start
   ```
   Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

## Kullanım Senaryosu

1. Doktor panelinden hasta seçin.
2. Seçili hastanın MR görüntüsünü yükleyin.
3. Görüntü yüklendiğinde yapay zeka otomatik olarak tahmin yapar ve sonucu gösterir.
4. MR görseline tıklayarak büyütülmüş önizleme yapabilirsiniz.



## İletişim

Herhangi bir soru veya öneri için: mehmetkubilaygulf1@gmail.com
