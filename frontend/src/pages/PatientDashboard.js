import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  Avatar,
  Divider,
  TextField,
  Dialog,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";

const drawerWidth = 220;
const BACKEND_URL = "http://localhost:5000";

const menu = [
  { key: "dashboard", label: "Gösterge Paneli", icon: <HomeIcon /> },
  { key: "profile", label: "Profilim", icon: <PersonIcon /> },
  { key: "appointment", label: "Randevu Al", icon: <EventIcon /> },
  { key: "history", label: "Randevu Geçmişi", icon: <HistoryIcon /> },
  { key: "mrimages", label: "MR Görüntülerim", icon: <ImageIcon /> },
];

const PatientDashboard = ({ patient, onLogout }) => {
  const [selected, setSelected] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [mrImages, setMrImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [randevuForm, setRandevuForm] = useState({ doctor_id: "", date: "" });
  const [randevuError, setRandevuError] = useState("");
  const [randevuSuccess, setRandevuSuccess] = useState("");
  const [mrFile, setMrFile] = useState(null);
  const [mrUploadError, setMrUploadError] = useState("");
  const [mrUploadSuccess, setMrUploadSuccess] = useState("");
  const [profileEdit, setProfileEdit] = useState(null);
  const [profileEditMsg, setProfileEditMsg] = useState("");
  const [openImage, setOpenImage] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, appRes, mrRes, docRes] = await Promise.all([
          fetch(`${BACKEND_URL}/profile/patient/${patient.id}`),
          fetch(`${BACKEND_URL}/appointments/patient/${patient.id}`),
          fetch(`${BACKEND_URL}/mrimages/patient/${patient.id}`),
          fetch(`${BACKEND_URL}/doctors`).then((r) => (r.ok ? r.json() : [])),
        ]);
        setProfile(await profileRes.json());
        setAppointments(await appRes.json());
        setMrImages(await mrRes.json());
        setDoctors(docRes);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [patient.id]);

  useEffect(() => {
    if (profile) {
      setProfileEdit(profile);
    }
  }, [profile]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/notifications/patient/${patient.id}`
        );
        if (res.ok) {
          setNotifications(await res.json());
        }
      } catch (e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [patient.id]);

  const handleRandevuSubmit = async (e) => {
    e.preventDefault();
    setRandevuError("");
    setRandevuSuccess("");
    if (!randevuForm.doctor_id || !randevuForm.date) {
      setRandevuError("Tüm alanları doldurun.");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          doctor_id: randevuForm.doctor_id,
          date: randevuForm.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Randevu eklenemedi!");
      setRandevuSuccess("Randevu başarıyla eklendi!");
      setRandevuForm({ doctor_id: "", date: "" });
    } catch (err) {
      setRandevuError(err.message);
    }
  };

  const handleMrUpload = async (e) => {
    e.preventDefault();
    setMrUploadError("");
    setMrUploadSuccess("");
    if (!mrFile) {
      setMrUploadError("Dosya seçin.");
      return;
    }
    const formData = new FormData();
    formData.append("file", mrFile);
    formData.append("patient_id", patient.id);
    try {
      const res = await fetch(`${BACKEND_URL}/mrimages/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız!");
      setMrUploadSuccess("MR görüntüsü yüklendi!");
      setMrFile(null);
    } catch (err) {
      setMrUploadError(err.message);
    }
  };

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setProfileEditMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/profile/patient/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileEdit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız!");
      setProfileEditMsg("Profil güncellendi!");
    } catch (err) {
      setProfileEditMsg(err.message);
    }
  };

  useEffect(() => {
    if (selected === "appointment") {
      fetch(`${BACKEND_URL}/doctors`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setDoctors(data));
    }
  }, [selected]);

  const renderContent = () => {
    if (loading) return <Typography>Yükleniyor...</Typography>;
    switch (selected) {
      case "dashboard":
        return (
          <Box>
            {notifications.length > 0 && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  background: "#232b39",
                  color: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <NotificationsIcon sx={{ color: "#00bcd4" }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#00bcd4", mb: 1 }}>
                    Bildirimler
                  </Typography>
                  {notifications.slice(0, 3).map((n) => (
                    <Typography
                      key={n.id}
                      sx={{ color: "#e0e0e0", fontSize: 15 }}
                    >
                      {n.message}{" "}
                      <span style={{ color: "#b0b0b0", fontSize: 12 }}>
                        ({new Date(n.created_at).toLocaleString("tr-TR")})
                      </span>
                    </Typography>
                  ))}
                  {notifications.length > 3 && (
                    <Typography sx={{ color: "#b0b0b0", fontSize: 13, mt: 1 }}>
                      +{notifications.length - 3} daha fazla bildirim
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}
            <Box sx={{ display: "flex", gap: 3, mt: 4, flexWrap: "wrap" }}>
              <Paper
                sx={{
                  p: 3,
                  flex: 1,
                  minWidth: 220,
                  textAlign: "center",
                  background: "#282c34",
                  color: "#e0e0e0",
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6">Profilim</Typography>
                <Typography
                  sx={{ color: "#00bcd4", mt: 1, cursor: "pointer" }}
                  onClick={() => setSelected("profile")}
                >
                  Profili Görüntüle
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 3,
                  flex: 1,
                  minWidth: 220,
                  textAlign: "center",
                  background: "#282c34",
                  color: "#e0e0e0",
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="h6">Randevularım</Typography>
                <Typography
                  sx={{ color: "#00bcd4", mt: 1, cursor: "pointer" }}
                  onClick={() => setSelected("history")}
                >
                  Randevu Geçmişini Görüntüle
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 3,
                  flex: 1,
                  minWidth: 220,
                  textAlign: "center",
                  background: "#282c34",
                  color: "#e0e0e0",
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
                  <ImageIcon />
                </Avatar>
                <Typography variant="h6">MR Görüntülerim</Typography>
                <Typography
                  sx={{ color: "#00bcd4", mt: 1, cursor: "pointer" }}
                  onClick={() => setSelected("mrimages")}
                >
                  MR Görüntülerini Gör
                </Typography>
              </Paper>
            </Box>
          </Box>
        );
      case "profile":
        return profile ? (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "#e0e0e0", fontWeight: 400 }}
            >
              Profil Bilgilerim
            </Typography>
            <form onSubmit={handleProfileEdit} style={{ maxWidth: 400 }}>
              <TextField
                label="Ad"
                name="first_name"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.first_name || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, first_name: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <TextField
                label="Soyad"
                name="last_name"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.last_name || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, last_name: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.email || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, email: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <TextField
                label="Telefon"
                name="phone"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.phone || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, phone: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <TextField
                label="Cinsiyet"
                name="gender"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.gender || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, gender: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <TextField
                label="Adres"
                name="address"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.address || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, address: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <TextField
                label="Şehir"
                name="city"
                fullWidth
                sx={{ mb: 2 }}
                value={profileEdit?.city || ""}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, city: e.target.value })
                }
                InputLabelProps={{
                  style: { fontWeight: "normal", color: "#b0b0b0" },
                }}
                inputProps={{
                  style: { fontWeight: "normal", color: "#e0e0e0" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1 }}
              >
                Profili Güncelle
              </Button>
              {profileEditMsg && (
                <Typography sx={{ mt: 2, color: "#00bcd4", fontWeight: 400 }}>
                  {profileEditMsg}
                </Typography>
              )}
            </form>
          </Box>
        ) : null;
      case "appointment":
        return (
          <Box sx={{ mt: 4, maxWidth: 400 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#e0e0e0" }}>
              Randevu Al
            </Typography>
            <form onSubmit={handleRandevuSubmit}>
              <TextField
                select
                label="Doktor"
                name="doctor_id"
                fullWidth
                sx={{ mb: 2 }}
                value={randevuForm.doctor_id}
                onChange={(e) =>
                  setRandevuForm({ ...randevuForm, doctor_id: e.target.value })
                }
                SelectProps={{ native: true }}
                InputProps={{ style: { color: "#e0e0e0" } }}
                InputLabelProps={{ style: { color: "#b0b0b0" } }}
              >
                <option value="">Doktor Seçiniz</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {`${d.title ? d.title + " " : ""}${d.first_name} ${
                      d.last_name
                    }${d.specialty ? " | " + d.specialty : ""}`}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Tarih"
                name="date"
                type="date"
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true, style: { color: "#b0b0b0" } }}
                value={randevuForm.date}
                onChange={(e) =>
                  setRandevuForm({ ...randevuForm, date: e.target.value })
                }
                InputProps={{ style: { color: "#e0e0e0" } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Randevu Al
              </Button>
              {randevuError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {randevuError}
                </Typography>
              )}
              {randevuSuccess && (
                <Typography sx={{ mt: 1, color: "#00bcd4" }}>
                  {randevuSuccess}
                </Typography>
              )}
            </form>
          </Box>
        );
      case "history":
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#e0e0e0" }}>
              Randevu Geçmişi
            </Typography>
            {appointments.length === 0 && (
              <Typography sx={{ color: "#b0b0b0" }}>
                Randevu bulunamadı.
              </Typography>
            )}
            {appointments.map((a) => (
              <Paper
                key={a.id}
                sx={{ p: 2, mb: 2, background: "#282c34", color: "#e0e0e0" }}
              >
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Tarih:</b>{" "}
                  <span style={{ color: "#e0e0e0" }}>{a.date}</span>
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Doktor:</b>{" "}
                  <span style={{ color: "#e0e0e0" }}>{a.doctor}</span>
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Durum:</b>{" "}
                  <span style={{ color: "#e0e0e0" }}>{a.status}</span>
                </Typography>
              </Paper>
            ))}
          </Box>
        );
      case "mrimages":
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#e0e0e0" }}>
              MR Görüntülerim
            </Typography>
            <form
              onSubmit={handleMrUpload}
              style={{ maxWidth: 400, marginBottom: 24 }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ color: "#e0e0e0" }}
                onChange={(e) => setMrFile(e.target.files[0])}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
              >
                Yükle
              </Button>
              {mrUploadError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {mrUploadError}
                </Typography>
              )}
              {mrUploadSuccess && (
                <Typography sx={{ mt: 1, color: "#00bcd4" }}>
                  {mrUploadSuccess}
                </Typography>
              )}
            </form>
            {mrImages.length === 0 && (
              <Typography sx={{ color: "#b0b0b0" }}>
                MR görüntüsü bulunamadı.
              </Typography>
            )}
            {mrImages.map((img) => (
              <Paper
                key={img.id}
                sx={{
                  p: 2,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  background: "#282c34",
                  color: "#e0e0e0",
                }}
              >
                <img
                  src={img.file_url}
                  alt="MR"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #232b39",
                  }}
                />
                <Box sx={{ ml: 2 }}>
                  <Typography sx={{ color: "#e0e0e0", fontWeight: 500 }}>
                    {img.prediction
                      ? `Tahmin: ${img.prediction}`
                      : "Tahmin yok"}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ color: "#00bcd4", borderColor: "#00bcd4" }}
                  onClick={() => setOpenImage(img.file_url)}
                >
                  Görüntüle
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1, color: "#00bcd4", borderColor: "#00bcd4" }}
                  component="a"
                  href={img.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  İndir
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  sx={{ ml: 1, borderColor: "#f44336", color: "#f44336" }}
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Bu MR görüntüsünü silmek istediğinize emin misiniz?"
                      )
                    ) {
                      await fetch(`${BACKEND_URL}/mrimages/${img.id}`, {
                        method: "DELETE",
                      });
                      setMrImages((prev) =>
                        prev.filter((m) => m.id !== img.id)
                      );
                    }
                  }}
                >
                  Sil
                </Button>
              </Paper>
            ))}
            <Dialog
              open={!!openImage}
              onClose={() => setOpenImage(null)}
              maxWidth="md"
            >
              <Box sx={{ position: "relative", bgcolor: "#181c24" }}>
                <IconButton
                  onClick={() => setOpenImage(null)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#fff",
                    zIndex: 2,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {openImage && (
                  <img
                    src={openImage}
                    alt="MR Büyük Görsel"
                    style={{
                      maxWidth: "80vw",
                      maxHeight: "80vh",
                      display: "block",
                      margin: "40px auto 16px auto",
                      borderRadius: 12,
                    }}
                  />
                )}
              </Box>
            </Dialog>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#181c24" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          overflowX: "hidden",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#232b39",
            borderRight: "1px solid #232b39",
            color: "#e0e0e0",
            overflowX: "hidden",
            position: "relative",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#00bcd4", letterSpacing: 1 }}
          >
            tumorAI
          </Typography>
        </Box>
        <List>
          {menu.map((item) => (
            <ListItem
              button
              key={item.key}
              onClick={() => setSelected(item.key)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  color: selected === item.key ? "#00bcd4" : "#e0e0e0",
                }}
              />
            </ListItem>
          ))}
        </List>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            p: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ borderColor: "#00bcd4", color: "#00bcd4", minWidth: 140 }}
            onClick={onLogout}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ background: "#181c24", borderBottom: "1px solid #232b39" }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "#e0e0e0" }}>
              tumorAI
            </Typography>
            <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
              <PersonIcon />
            </Avatar>
            <Typography sx={{ color: "#e0e0e0" }}>
              {profile ? profile.first_name : ""}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ mt: 2 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
};

export default PatientDashboard;
