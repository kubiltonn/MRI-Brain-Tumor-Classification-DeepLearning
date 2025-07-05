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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import PersonIcon from "@mui/icons-material/Person";
import MRZekaPanel from "./MRZekaPanel";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const drawerWidth = 220;
const BACKEND_URL = "http://localhost:5000";

const menu = [
  { key: "dashboard", label: "Gösterge Paneli", icon: <HomeIcon /> },
  { key: "appointments", label: "Randevularım", icon: <EventIcon /> },
  { key: "patients", label: "Hastalarım", icon: <PeopleIcon /> },
  { key: "mrzeka", label: "MR & Yapay Zeka", icon: <ScienceIcon /> },
];

const APPOINTMENT_STATUSES = ["Bekliyor", "Onaylandı", "Tamamlandı"];

function formatDateTR(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

const DoctorDashboard = ({ doctor, onLogout }) => {
  const [selected, setSelected] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileEdit, setProfileEdit] = useState(null);
  const [profileEditMsg, setProfileEditMsg] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientMRs, setSelectedPatientMRs] = useState([]);
  const [mrModalOpen, setMrModalOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, appRes, patRes] = await Promise.all([
          fetch(`${BACKEND_URL}/profile/doctor/${doctor.id}`),
          fetch(`${BACKEND_URL}/appointments/doctor/${doctor.id}`),
          fetch(`${BACKEND_URL}/patients/doctor/${doctor.id}`),
        ]);
        setProfile(await profileRes.json());
        setAppointments(await appRes.json());
        setPatients(await patRes.json());
      } catch (e) {
        // Hata yönetimi
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [doctor.id]);

  // Profil güncelleme
  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setProfileEditMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/profile/doctor/${doctor.id}`, {
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

  const handleShowMRs = async (patientId) => {
    setSelectedPatientMRs([]);
    setMrModalOpen(true);
    try {
      const res = await fetch(`${BACKEND_URL}/mrimages/patient/${patientId}`);
      const data = await res.json();
      setSelectedPatientMRs(data);
    } catch (e) {
      setSelectedPatientMRs([]);
    }
  };

  const renderContent = () => {
    if (loading) return <Typography>Yükleniyor...</Typography>;
    switch (selected) {
      case "dashboard":
        return (
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
                <EventIcon />
              </Avatar>
              <Typography variant="h6">Randevularım</Typography>
              <Typography
                sx={{ color: "#00bcd4", mt: 1, cursor: "pointer" }}
                onClick={() => setSelected("appointments")}
              >
                Randevuları Gör
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
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6">Hastalarım</Typography>
              <Typography
                sx={{ color: "#00bcd4", mt: 1, cursor: "pointer" }}
                onClick={() => setSelected("patients")}
              >
                Hastaları Gör
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
                <ScienceIcon />
              </Avatar>
              <Typography variant="h6">MR & Yapay Zeka</Typography>
              <Typography
                sx={{ color: "#00bcd4", mt: 1, cursor: "pointer" }}
                onClick={() => setSelected("mrzeka")}
              >
                MR Tahmin Paneli
              </Typography>
            </Paper>
          </Box>
        );
      case "appointments":
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#e0e0e0" }}>
              Randevularım
            </Typography>
            {appointments.length === 0 && (
              <Typography sx={{ color: "#b0b0b0" }}>
                Randevu bulunamadı.
              </Typography>
            )}
            {appointments.map((a, idx) => (
              <Paper
                key={a.id}
                sx={{ p: 2, mb: 2, background: "#282c34", color: "#e0e0e0" }}
              >
                <Typography>
                  <b style={{ color: "#b0b0b0" }}>Tarih:</b>{" "}
                  <span style={{ color: "#e0e0e0" }}>
                    {formatDateTR(a.date)}
                  </span>
                </Typography>
                <Typography>
                  <b style={{ color: "#b0b0b0" }}>Hasta:</b>{" "}
                  <span style={{ color: "#e0e0e0" }}>{a.patient}</span>
                </Typography>
                <Typography>
                  <b style={{ color: "#b0b0b0" }}>Durum:</b>
                  <Select
                    size="small"
                    value={a.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      // Backend'e güncelleme isteği gönder
                      await fetch(
                        `${BACKEND_URL}/appointments/${a.id}/status`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: newStatus }),
                        }
                      );
                      // Frontend'de state'i güncelle
                      setAppointments((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, status: newStatus } : item
                        )
                      );
                    }}
                    sx={{
                      ml: 1,
                      minWidth: 120,
                      color: "#e0e0e0",
                      background: "#232b39",
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { background: "#232b39", color: "#e0e0e0" },
                      },
                    }}
                  >
                    {APPOINTMENT_STATUSES.map((s) => (
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ color: "#e0e0e0", background: "#232b39" }}
                      >
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </Typography>
              </Paper>
            ))}
          </Box>
        );
      case "patients":
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#e0e0e0" }}>
              Hastalarım
            </Typography>
            {patients.length === 0 && (
              <Typography sx={{ color: "#b0b0b0" }}>
                Hasta bulunamadı.
              </Typography>
            )}
            {patients.map((p) => (
              <Paper
                key={p.id}
                sx={{
                  p: 2,
                  mb: 2,
                  background: "#282c34",
                  color: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography>
                    <b>Ad Soyad:</b> {p.first_name} {p.last_name}
                  </Typography>
                  <Typography>
                    <b>Email:</b> {p.email}
                  </Typography>
                  <Typography>
                    <b>Cinsiyet:</b> {p.gender}
                  </Typography>
                  <Typography>
                    <b>Şehir:</b> {p.city}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 1,
                    borderColor: "#00bcd4",
                    color: "#00bcd4",
                    mr: 1,
                  }}
                  onClick={() => {
                    setSelectedPatient(p);
                    handleShowMRs(p.id);
                  }}
                >
                  MR Görüntüleri
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  sx={{
                    mt: 1,
                    ml: 1,
                    borderColor: "#f44336",
                    color: "#f44336",
                  }}
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Bu hastayı silmek istediğinize emin misiniz?"
                      )
                    ) {
                      await fetch(`${BACKEND_URL}/patients/${p.id}`, {
                        method: "DELETE",
                      });
                      setPatients((prev) =>
                        prev.filter((pat) => pat.id !== p.id)
                      );
                    }
                  }}
                >
                  Sil
                </Button>
              </Paper>
            ))}
            <Dialog
              open={mrModalOpen}
              onClose={() => setMrModalOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                {selectedPatient
                  ? `${selectedPatient.first_name} ${selectedPatient.last_name} - MR Görüntüleri`
                  : "MR Görüntüleri"}
              </DialogTitle>
              <DialogContent>
                {selectedPatientMRs.length === 0 && (
                  <Typography>MR görüntüsü bulunamadı.</Typography>
                )}
                {selectedPatientMRs.map((img) => (
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
                    <Typography sx={{ ml: 2 }}>{img.prediction}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        ml: "auto",
                        borderColor: "#00bcd4",
                        color: "#00bcd4",
                      }}
                      component="a"
                      href={img.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      İndir
                    </Button>
                  </Paper>
                ))}
              </DialogContent>
            </Dialog>
          </Box>
        );
      case "mrzeka":
        return (
          <Box sx={{ mt: 4 }}>
            <MRZekaPanel doctor={doctor} patients={patients} />
          </Box>
        );
      case "profile":
        return profile ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Profil Bilgilerim
            </Typography>
            <form onSubmit={handleProfileEdit} style={{ maxWidth: 400 }}>
              <TextField
                label="Ad"
                name="first_name"
                fullWidth
                sx={{ mb: 2, background: "#282c34", color: "#e0e0e0" }}
                value={profileEdit?.first_name ?? profile.first_name}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, first_name: e.target.value })
                }
              />
              <TextField
                label="Soyad"
                name="last_name"
                fullWidth
                sx={{ mb: 2, background: "#282c34", color: "#e0e0e0" }}
                value={profileEdit?.last_name ?? profile.last_name}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, last_name: e.target.value })
                }
              />
              <TextField
                label="Email"
                name="email"
                fullWidth
                sx={{ mb: 2, background: "#282c34", color: "#e0e0e0" }}
                value={profileEdit?.email ?? profile.email}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, email: e.target.value })
                }
              />
              <TextField
                label="Telefon"
                name="phone"
                fullWidth
                sx={{ mb: 2, background: "#282c34", color: "#e0e0e0" }}
                value={profileEdit?.phone ?? profile.phone}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, phone: e.target.value })
                }
              />
              <TextField
                label="Branş"
                name="specialty"
                fullWidth
                sx={{ mb: 2, background: "#282c34", color: "#e0e0e0" }}
                value={profileEdit?.specialty ?? profile.specialty}
                onChange={(e) =>
                  setProfileEdit({ ...profileEdit, specialty: e.target.value })
                }
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1, background: "#00bcd4", color: "#232b39" }}
              >
                Profili Güncelle
              </Button>
              {profileEditMsg && (
                <Typography sx={{ mt: 2, color: "#00bcd4" }}>
                  {profileEditMsg}
                </Typography>
              )}
            </form>
          </Box>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "#181c24",
        overflowX: "hidden",
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#232b39",
            borderRight: "1px solid #232b39",
            color: "#e0e0e0",
            overflowX: "hidden",
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
        <Box sx={{ overflow: "auto", overflowX: "hidden" }}>
          <List>
            {menu.map((item) => (
              <ListItem
                button
                key={item.key}
                selected={selected === item.key}
                onClick={() => setSelected(item.key)}
                sx={{
                  background: selected === item.key ? "#282c34" : "inherit",
                  color: selected === item.key ? "#00bcd4" : "#e0e0e0",
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{ color: selected === item.key ? "#00bcd4" : "#b0b0b0" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    color: selected === item.key ? "#00bcd4" : "#e0e0e0",
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Button
            variant="outlined"
            color="primary"
            sx={{ m: 2, borderColor: "#00bcd4", color: "#00bcd4" }}
            onClick={onLogout}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: "hidden" }}>
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ background: "#232b39", borderBottom: "1px solid #232b39" }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "#00bcd4" }}>
              tumorAI
            </Typography>
            <Avatar sx={{ bgcolor: "#00bcd4", mr: 1 }}>
              <PersonIcon />
            </Avatar>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{ color: "#e0e0e0", fontWeight: 500, fontSize: 16 }}
              >
                {profile ? `${profile.first_name} ${profile.last_name}` : ""}
              </Typography>
              <Typography
                sx={{ color: "#b0b0b0", fontSize: 13, lineHeight: 1 }}
              >
                {profile && profile.title ? profile.title : ""}
                {profile && profile.specialty ? ` - ${profile.specialty}` : ""}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ mt: 2 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
};

export default DoctorDashboard;
