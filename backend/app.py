from flask import Flask, request, jsonify, send_file
from tensorflow import keras
from PIL import Image
import numpy as np
import io
import os
from tensorflow.keras.applications.efficientnet import preprocess_input
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from werkzeug.utils import secure_filename
import random
from urllib.parse import unquote
import mimetypes

app = Flask(__name__)
CORS(app)

# Veritabanı ayarları
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hospital.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Hasta tablosu
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20))
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(30))
    address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    password = db.Column(db.String(100), nullable=False)
    mr_images = db.relationship('MRImage', backref='patient', lazy=True)

# Doktor tablosu
class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(50))
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(30))
    specialty = db.Column(db.String(100))
    password = db.Column(db.String(100), nullable=False)
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)

# MR Görüntü tablosu
class MRImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_path = db.Column(db.String(200), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    prediction = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime)

# Randevu tablosu
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    date = db.Column(db.String(50))
    status = db.Column(db.String(50))

# Bildirim tablosu
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    message = db.Column(db.String(300), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

# Modeli yükle
try:
    MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'brain_tumor_model_fold10_20250601_065654.keras')
    model = keras.models.load_model(MODEL_PATH)
    print(f"Model başarıyla yüklendi: {MODEL_PATH}")
except Exception as e:
    print(f"Model yüklenirken hata oluştu: {e}")
    model = None

# Sınıf isimleri (modeldeki sıraya göre)
CLASS_NAMES = ["glioma_tumor", "meningioma_tumor", "no_tumor", "pituitary_tumor"]

# Görüntü ön işleme fonksiyonu (örnek, modeline göre düzenlenebilir)
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = image.resize((224, 224))  # Modelin beklediği boyut
    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# Veritabanı tabloları sadece bir kez oluşturulsun diye bir bayrak
_db_initialized = False

def seed_data():
    if not Patient.query.first():
        # Hastalar
        p1 = Patient(first_name="Zeynep", last_name="Korkmaz", gender="Kadın", email="zeynep@example.com", phone="5551112233", address="Adres 1", city="İstanbul", password=generate_password_hash("1234"))
        p2 = Patient(first_name="Mehmet", last_name="Demir", gender="Erkek", email="mehmet@example.com", phone="5552223344", address="Adres 2", city="Ankara", password=generate_password_hash("1234"))
        db.session.add_all([p1, p2])
        db.session.commit()
        # MR Görüntüleri (gerçek dosya yolundan rastgele)
        test_dir = os.path.join(os.path.dirname(__file__), '../Dataset/Test')
        def random_image_path(tumor_folder):
            folder = os.path.join(test_dir, tumor_folder)
            files = [f for f in os.listdir(folder) if f.lower().endswith('.jpg')]
            if not files:
                return None
            return os.path.abspath(os.path.join(folder, random.choice(files)))
        glioma_path = random_image_path("glioma")
        pituitary_path = random_image_path("pituitary_tumor")
        m1 = MRImage(file_path=glioma_path, patient_id=p1.id, prediction="glioma_tumor", uploaded_at=datetime.now())
        m2 = MRImage(file_path=pituitary_path, patient_id=p2.id, prediction="pituitary_tumor", uploaded_at=datetime.now())
        db.session.add_all([m1, m2])
        db.session.commit()
    if not Doctor.query.first():
        d1 = Doctor(first_name="Ahmet", last_name="Yılmaz", title="Doç. Dr.", email="ahmet@example.com", phone="5553334455", specialty="Nöroloji", password=generate_password_hash("1234"))
        d2 = Doctor(first_name="Ayşe", last_name="Demir", title="Uzm. Dr.", email="ayse@example.com", phone="5554445566", specialty="Radyoloji", password=generate_password_hash("1234"))
        db.session.add_all([d1, d2])
        db.session.commit()
        # Randevular
        a1 = Appointment(patient_id=1, doctor_id=1, date="2025-06-10", status="Onaylandı")
        a2 = Appointment(patient_id=2, doctor_id=2, date="2025-07-01", status="Bekliyor")
        db.session.add_all([a1, a2])
        db.session.commit()

@app.before_request
def initialize_db_once():
    global _db_initialized
    if not _db_initialized:
        db.create_all()
        seed_data()
        _db_initialized = True

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model yüklenemedi!'}), 500
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        file = request.files['file']
        if not file.mimetype.startswith('image/'):
            return jsonify({'error': 'Lütfen bir resim dosyası yükleyin!'}), 400
        img_bytes = file.read()
        try:
            img = preprocess_image(img_bytes)
        except Exception as e:
            return jsonify({'error': f'Yüklenen dosya bir resim olarak açılamadı: {str(e)}'}), 400
        prediction = model.predict(img)[0]
        result = []
        for idx, prob in enumerate(prediction):
            result.append({
                "class": CLASS_NAMES[idx],
                "probability": f"{prob * 100:.2f}%"
            })
        predicted_class = CLASS_NAMES[np.argmax(prediction)]
        # Hasta id parametresi varsa bildirim oluştur
        patient_id = request.form.get('patient_id') or (request.json.get('patient_id') if request.is_json else None)
        mr_image_id = request.form.get('mr_image_id') or (request.json.get('mr_image_id') if request.is_json else None)
        if patient_id:
            notif = Notification(
                patient_id=patient_id,
                message=f"Yapay zeka tahmini sonucu: {predicted_class}",
                is_read=False
            )
            db.session.add(notif)
        # MR kaydına prediction yaz
        if mr_image_id:
            mr = MRImage.query.get(mr_image_id)
            if mr:
                mr.prediction = predicted_class
        db.session.commit()
        return jsonify({
            "prediction": result,
            "predicted_class": predicted_class
        })
    except Exception as e:
        print(f"Tahmin sırasında hata oluştu: {e}")
        return jsonify({'error': f'Tahmin sırasında hata oluştu: {str(e)}'}), 500

# Hasta kayıt
@app.route('/register/patient', methods=['POST'])
def register_patient():
    data = request.json
    if Patient.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Bu email ile hasta zaten kayıtlı!'}), 400
    hashed_pw = generate_password_hash(data['password'])
    patient = Patient(
        first_name=data['first_name'],
        last_name=data['last_name'],
        gender=data.get('gender'),
        email=data['email'],
        phone=data.get('phone'),
        address=data.get('address'),
        city=data.get('city'),
        password=hashed_pw
    )
    db.session.add(patient)
    db.session.commit()
    return jsonify({'message': 'Hasta kaydı başarılı!', 'id': patient.id})

# Hasta giriş
@app.route('/login/patient', methods=['POST'])
def login_patient():
    data = request.json
    patient = Patient.query.filter_by(email=data['email']).first()
    if not patient or not check_password_hash(patient.password, data['password']):
        return jsonify({'error': 'Geçersiz email veya şifre!'}), 401
    return jsonify({'message': 'Giriş başarılı!', 'id': patient.id, 'first_name': patient.first_name, 'last_name': patient.last_name, 'email': patient.email})

# Doktor kayıt
@app.route('/register/doctor', methods=['POST'])
def register_doctor():
    data = request.json
    if Doctor.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Bu email ile doktor zaten kayıtlı!'}), 400
    hashed_pw = generate_password_hash(data['password'])
    doctor = Doctor(
        first_name=data['first_name'],
        last_name=data['last_name'],
        title=data.get('title'),
        email=data['email'],
        phone=data.get('phone'),
        specialty=data.get('specialty'),
        password=hashed_pw
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({'message': 'Doktor kaydı başarılı!', 'id': doctor.id})

# Doktor giriş
@app.route('/login/doctor', methods=['POST'])
def login_doctor():
    data = request.json
    doctor = Doctor.query.filter_by(email=data['email']).first()
    if not doctor or not check_password_hash(doctor.password, data['password']):
        return jsonify({'error': 'Geçersiz email veya şifre!'}), 401
    return jsonify({'message': 'Giriş başarılı!', 'id': doctor.id, 'first_name': doctor.first_name, 'last_name': doctor.last_name, 'email': doctor.email})

# Hasta profilini getir
@app.route('/profile/patient/<int:patient_id>', methods=['GET'])
def get_patient_profile(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Hasta bulunamadı!'}), 404
    return jsonify({
        'id': patient.id,
        'first_name': patient.first_name,
        'last_name': patient.last_name,
        'gender': patient.gender,
        'email': patient.email,
        'phone': patient.phone,
        'address': patient.address,
        'city': patient.city
    })

# Hastanın randevularını getir
@app.route('/appointments/patient/<int:patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()
    result = []
    for a in appointments:
        doctor = Doctor.query.get(a.doctor_id)
        result.append({
            'id': a.id,
            'date': a.date,
            'status': a.status,
            'doctor': f"{doctor.first_name} {doctor.last_name}" if doctor else None
        })
    return jsonify(result)

# Hastanın MR görüntülerini getir
@app.route('/mrimages/patient/<int:patient_id>', methods=['GET'])
def get_patient_mrimages(patient_id):
    images = MRImage.query.filter_by(patient_id=patient_id).all()
    def image_url(img):
        return request.host_url.rstrip('/') + '/mrimages/file?path=' + img.file_path.replace('\\', '/').replace(' ', '%20')
    return jsonify([
        {'id': img.id, 'file_url': image_url(img), 'prediction': img.prediction, 'uploaded_at': img.uploaded_at} for img in images
    ])

# Doktor profilini getir
@app.route('/profile/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_profile(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doktor bulunamadı!'}), 404
    return jsonify({
        'id': doctor.id,
        'first_name': doctor.first_name,
        'last_name': doctor.last_name,
        'title': doctor.title,
        'email': doctor.email,
        'phone': doctor.phone,
        'specialty': doctor.specialty
    })

# Doktorun randevularını getir
@app.route('/appointments/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    result = []
    for a in appointments:
        patient = Patient.query.get(a.patient_id)
        result.append({
            'id': a.id,
            'date': a.date,
            'status': a.status,
            'patient': f"{patient.first_name} {patient.last_name}" if patient else None
        })
    return jsonify(result)

# Doktorun hastalarını getir
@app.route('/patients/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_patients(doctor_id):
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    patient_ids = set(a.patient_id for a in appointments)
    patients = Patient.query.filter(Patient.id.in_(patient_ids)).all()
    return jsonify([
        {'id': p.id, 'first_name': p.first_name, 'last_name': p.last_name, 'email': p.email, 'gender': p.gender, 'city': p.city} for p in patients
    ])

# Randevu ekle
@app.route('/appointments', methods=['POST'])
def add_appointment():
    data = request.json
    appointment = Appointment(
        patient_id=data['patient_id'],
        doctor_id=data['doctor_id'],
        date=data['date'],
        status=data.get('status', 'Bekliyor')
    )
    db.session.add(appointment)
    db.session.commit()
    return jsonify({'message': 'Randevu eklendi!', 'id': appointment.id})

# MR görüntüsü yükle
@app.route('/mrimages/upload', methods=['POST'])
def upload_mrimage():
    patient_id = request.form.get('patient_id')
    prediction = request.form.get('prediction')
    file = request.files.get('file')
    if not file or not patient_id:
        return jsonify({'error': 'Dosya ve hasta ID gerekli!'}), 400
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)
    mr = MRImage(
        file_path=save_path,
        patient_id=patient_id,
        prediction=prediction,
        uploaded_at=datetime.now()
    )
    db.session.add(mr)
    db.session.commit()
    return jsonify({'message': 'MR görüntüsü yüklendi!', 'id': mr.id})

# Hasta profil güncelle
@app.route('/profile/patient/<int:patient_id>', methods=['PUT'])
@cross_origin()
def update_patient_profile(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Hasta bulunamadı!'}), 404
    data = request.json
    if not data:
        return jsonify({'error': 'Eksik veya hatalı JSON!'}), 400
    for field in ['first_name', 'last_name', 'gender', 'email', 'phone', 'address', 'city']:
        if field in data:
            setattr(patient, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Profil güncellendi!'})

# Doktor profil güncelle
@app.route('/profile/doctor/<int:doctor_id>', methods=['PUT'])
def update_doctor_profile(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doktor bulunamadı!'}), 404
    data = request.json
    for field in ['first_name', 'last_name', 'email', 'phone', 'specialty']:
        if field in data:
            setattr(doctor, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Profil güncellendi!'})

@app.route('/mrimages/file')
@cross_origin()
def get_mrimage_file():
    path = request.args.get('path')
    if not path:
        return jsonify({'error': 'Dosya bulunamadı!'}), 404
    path = unquote(path)
    if not os.path.exists(path):
        return jsonify({'error': 'Dosya bulunamadı!'}), 404
    mime_type, _ = mimetypes.guess_type(path)
    return send_file(path, mimetype=mime_type or 'application/octet-stream')

# Randevu durumunu güncelle
@app.route('/appointments/<int:appointment_id>/status', methods=['PUT'])
def update_appointment_status(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'error': 'Randevu bulunamadı!'}), 404
    data = request.json
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Durum belirtilmedi!'}), 400
    appointment.status = new_status
    db.session.commit()
    return jsonify({'message': 'Randevu durumu güncellendi!', 'status': new_status})

# Doktorun hastasını silmesi için endpoint
@app.route('/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Hasta bulunamadı!'}), 404
    # İlgili MRImage ve Appointment kayıtlarını da sil
    MRImage.query.filter_by(patient_id=patient_id).delete()
    Appointment.query.filter_by(patient_id=patient_id).delete()
    db.session.delete(patient)
    db.session.commit()
    return jsonify({'message': 'Hasta ve ilişkili veriler silindi.'})

# Tüm doktorları döndüren endpoint
@app.route('/doctors', methods=['GET'])
def get_all_doctors():
    doctors = Doctor.query.all()
    return jsonify([
        {
            'id': d.id,
            'first_name': d.first_name,
            'last_name': d.last_name,
            'title': d.title,
            'specialty': d.specialty
        } for d in doctors
    ])

# Hastanın bildirimlerini dönen endpoint
@app.route('/notifications/patient/<int:patient_id>', methods=['GET'])
def get_patient_notifications(patient_id):
    notifs = Notification.query.filter_by(patient_id=patient_id).order_by(Notification.created_at.desc()).all()
    return jsonify([
        {
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at
        } for n in notifs
    ])

@app.route('/mrimages/<int:mr_id>', methods=['DELETE'])
def delete_mrimage(mr_id):
    mr = MRImage.query.get(mr_id)
    if not mr:
        return jsonify({'error': 'MR görüntüsü bulunamadı!'}), 404
    # Dosyayı sil
    try:
        if os.path.exists(mr.file_path):
            os.remove(mr.file_path)
    except Exception as e:
        pass  # Dosya silinemese de devam et
    db.session.delete(mr)
    db.session.commit()
    return jsonify({'message': 'MR görüntüsü silindi.'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 