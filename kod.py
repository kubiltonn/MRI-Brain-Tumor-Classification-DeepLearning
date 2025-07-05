import os
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D, BatchNormalization, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.applications import EfficientNetB4
from tensorflow.keras.applications.efficientnet import preprocess_input
from sklearn.metrics import roc_curve, auc
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
from collections import Counter
from datetime import datetime
from sklearn.model_selection import KFold

# Klasör yolları
train_dir = r"C:\Users\Zeynep\Desktop\Class\Dataset\Train"
test_dir = r"C:\Users\Zeynep\Desktop\Class\Dataset\Test"

# Parametreler
img_size = 224  # EfficientNet için optimize boyut
batch_size = 16  # 8'den 16'ya çıkaralım (daha iyi performans için)
epochs = 20
n_splits = 10

# Data Augmentation
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=45,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    vertical_flip=True,
    fill_mode='nearest',
    brightness_range=[0.6, 1.4],
    channel_shift_range=50.0,
    validation_split=0.1
)

test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

# Train ve test generator'ları
train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

validation_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation',
    shuffle=True
)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)

# Sınıf ağırlıklarını hesapla
class_counts = Counter(train_generator.classes)
total_samples = sum(class_counts.values())
class_weights = {class_id: total_samples / (len(class_counts) * count) 
                for class_id, count in class_counts.items()}

# glioma_tumor için ağırlığı artır
glioma_index = train_generator.class_indices['glioma_tumor']
class_weights[glioma_index] *= 1.5

# Sınıf isimlerini al
class_names = list(train_generator.class_indices.keys())

# K-fold cross validation
kfold = KFold(n_splits=n_splits, shuffle=True, random_state=42)
fold = 1
fold_accuracies = []
fold_losses = []

for train_idx, val_idx in kfold.split(train_generator.classes):
    print(f"\nFold {fold}/{n_splits}")
    print("=" * 50)
    
    # Model oluştur
    base_model = EfficientNetB4(weights='imagenet', include_top=False, input_shape=(img_size, img_size, 3))
    
    # Fine-tuning: Son 120 katmanı aç (performans için önemli)
    for layer in base_model.layers[:-120]:
        layer.trainable = False
    for layer in base_model.layers[-120:]:
        layer.trainable = True
    
    # Model mimarisi (orijinal haliyle)
    inputs = Input(shape=(img_size, img_size, 3))
    x = base_model(inputs)
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(1024, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.3)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(4, activation='softmax')(x)
    
    model = Model(inputs=inputs, outputs=predictions)
    
    # Optimizer
    optimizer = Adam(learning_rate=0.0001)
    model.compile(optimizer=optimizer, 
                 loss='categorical_crossentropy', 
                 metrics=['accuracy'])
    
    # Model kaydetme
    current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_filename = f'brain_tumor_model_fold{fold}_{current_time}.keras'
    
    # Callbacks
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=3,
        restore_best_weights=True,
        verbose=1
    )
    
    checkpoint = ModelCheckpoint(
        model_filename,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=2,
        min_lr=0.00001,
        verbose=1
    )
    
    # Eğitim
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=validation_generator,
        callbacks=[early_stop, checkpoint, reduce_lr],
        class_weight=class_weights,
        verbose=1  # Epoch ilerlemesini göster
    )
    
    # Model değerlendirme
    test_model = load_model(model_filename)
    test_loss, test_acc = test_model.evaluate(test_generator)
    print(f"\nFold {fold} Test Doğruluk: {test_acc:.4f}")
    print(f"Fold {fold} Test Kayıp: {test_loss:.4f}")
    
    fold_accuracies.append(test_acc)
    fold_losses.append(test_loss)
    fold += 1

# En iyi modeli bul
best_fold_idx = np.argmax(fold_accuracies)
best_accuracy = fold_accuracies[best_fold_idx]
best_model_path = f'brain_tumor_model_fold{best_fold_idx + 1}_{current_time}.keras'

print("\nEn İyi Model Bilgileri:")
print("=" * 50)
print(f"Fold: {best_fold_idx + 1}")
print(f"Doğruluk: {best_accuracy:.4f}")
print(f"Model Dosyası: {best_model_path}")

# En iyi modeli yükle
best_model = load_model(best_model_path)

# En iyi fold'un eğitim grafikleri
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Eğitim Doğruluğu')
plt.plot(history.history['val_accuracy'], label='Doğrulama Doğruluğu')
plt.title(f'En İyi Fold ({best_fold_idx + 1}) Model Doğruluk')
plt.xlabel('Epoch')
plt.ylabel('Doğruluk')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Eğitim Kayıp')
plt.plot(history.history['val_loss'], label='Doğrulama Kayıp')
plt.title(f'En İyi Fold ({best_fold_idx + 1}) Model Kayıp')
plt.xlabel('Epoch')
plt.ylabel('Kayıp')
plt.legend()

plt.tight_layout()
plt.savefig('best_training_curves.png')
plt.show()
plt.close()

# En iyi fold'un Confusion Matrix'i
y_pred = best_model.predict(test_generator)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = test_generator.classes
cm = confusion_matrix(y_true, y_pred_classes)

plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names,
            yticklabels=class_names)
plt.title(f'En İyi Fold ({best_fold_idx + 1}) Confusion Matrix')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.savefig('best_confusion_matrix.png')
plt.show()
plt.close()

# En iyi fold'un ROC eğrileri
plt.figure(figsize=(10, 8))
print("\nEn İyi Fold AUC Değerleri:")
print("=" * 50)
for i in range(len(class_names)):
    fpr, tpr, _ = roc_curve(y_true == i, y_pred[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'{class_names[i]} (AUC = {roc_auc:.2f})')
    print(f"{class_names[i]}: {roc_auc:.4f}")

plt.plot([0, 1], [0, 1], 'k--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title(f'En İyi Fold ({best_fold_idx + 1}) ROC Curves')
plt.legend(loc="lower right")
plt.savefig('best_roc_curves.png')
plt.show()
plt.close()

# En iyi modeli kaydet
best_model.save('best_brain_tumor_model.keras')
print("\nEn iyi model 'best_brain_tumor_model.keras' olarak kaydedildi.")

# Sınıf sıralamalarını en sonda yazdır
print("\nTrain class indices:", train_generator.class_indices)
print("Test class indices:", test_generator.class_indices)

def predict_tumor_type(image_path, model_path):
    """
    Verilen MR görüntüsünün tümör türünü sınıflandırır ve olasılıkları gösterir.
    
    Args:
        image_path (str): MR görüntüsünün dosya yolu
        model_path (str): Eğitilmiş model dosyasının yolu
    """
    # Görüntüyü yükle ve ön işle
    img = load_img(image_path, target_size=(img_size, img_size))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    # Modeli yükle
    model = load_model(model_path)
    
    # Tahmin yap
    predictions = model.predict(img_array)
    
    # Sınıf isimlerini al
    class_names = list(train_generator.class_indices.keys())
    
    # Sonuçları göster
    print("\nTümör Sınıflandırma Sonuçları:")
    print("=" * 50)
    for i, class_name in enumerate(class_names):
        probability = predictions[0][i] * 100
        print(f"{class_name}: %{probability:.2f}")
    
    # En yüksek olasılıklı sınıfı bul
    predicted_class = class_names[np.argmax(predictions[0])]
    max_probability = np.max(predictions[0]) * 100
    
    print("\nTahmin:")
    print(f"Tümör Türü: {predicted_class}")
    print(f"Güven: %{max_probability:.2f}")
    
    # Görüntüyü ve sonuçları görselleştir
    plt.figure(figsize=(10, 5))
    
    # Görüntüyü göster
    plt.subplot(1, 2, 1)
    plt.imshow(img)
    plt.title('MR Görüntüsü')
    plt.axis('off')
    
    # Olasılık çubuğunu göster
    plt.subplot(1, 2, 2)
    y_pos = np.arange(len(class_names))
    plt.barh(y_pos, predictions[0] * 100)
    plt.yticks(y_pos, class_names)
    plt.xlabel('Olasılık (%)')
    plt.title('Sınıf Olasılıkları')
    
    plt.tight_layout()
    plt.savefig('prediction_result.png')
    plt.show()
    plt.close()

# Örnek kullanım:
# predict_tumor_type('path/to/mr_image.jpg', 'brain_tumor_model_fold1_20240321_123456.keras') 