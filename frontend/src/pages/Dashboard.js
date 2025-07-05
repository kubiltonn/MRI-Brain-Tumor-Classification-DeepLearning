import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ScienceIcon from "@mui/icons-material/Science";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import MRZekaPanel from "./MRZekaPanel";
import CloseIcon from "@mui/icons-material/Close";

const drawerWidth = 260;

const flatBoxStyle = {
  background: "#181e2a",
  borderRadius: 2,
  boxShadow: "none",
  border: "1px solid #232b39",
};

const menuItems = [
  { key: "randevular", label: "Randevular", icon: <EventIcon /> },
  { key: "hastalar", label: "Hastalar", icon: <PeopleIcon /> },
  { key: "ameliyatlar", label: "Ameliyatlar", icon: <LocalHospitalIcon /> },
  { key: "mrzeka", label: "MR & Yapay Zeka", icon: <ScienceIcon /> },
];

const Dashboard = ({ doctor, onLogout }) => {
  const [selectedMenu, setSelectedMenu] = useState("randevular");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [randevular, setRandevular] = useState([
    {
      id: 1,
      hasta: "Zeynep Korkmaz",
      tarih: "2025-06-01",
      saat: "10:00",
      durum: "Bekliyor",
    },
    {
      id: 2,
      hasta: "Mehmet Demir",
      tarih: "2025-06-02",
      saat: "14:30",
      durum: "Tamamlandı",
    },
  ]);
  const [hastalar, setHastalar] = useState([
    { id: 1, ad: "Zeynep Korkmaz", yas: 45, cinsiyet: "Kadın", tanı: "Glioma" },
    {
      id: 2,
      ad: "Mehmet Demir",
      yas: 52,
      cinsiyet: "Erkek",
      tanı: "Pituitary",
    },
  ]);
  const [ameliyatlar, setAmeliyatlar] = useState([
    {
      id: 1,
      hasta: "Zeynep Korkmaz",
      tarih: "2025-06-10",
      tip: "Tümör Rezeksiyonu",
    },
  ]);

  const [openModal, setOpenModal] = useState(null); // 'randevu' | 'hasta' | 'ameliyat' | null
  const [form, setForm] = useState({});

  const handleOpenModal = (type) => {
    setForm({});
    setOpenModal(type);
  };
  const handleCloseModal = () => {
    setOpenModal(null);
    setForm({});
  };

  // Form input değişimi
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ekleme işlemleri
  const handleAdd = () => {
    if (openModal === "randevu") {
      setRandevular([
        ...randevular,
        {
          id: Date.now(),
          hasta: form.hasta || "",
          tarih: form.tarih || "",
          saat: form.saat || "",
          durum: form.durum || "Bekliyor",
        },
      ]);
    } else if (openModal === "hasta") {
      setHastalar([
        ...hastalar,
        {
          id: Date.now(),
          ad: form.ad || "",
          yas: form.yas || "",
          cinsiyet: form.cinsiyet || "",
          tanı: form.tanı || "",
        },
      ]);
    } else if (openModal === "ameliyat") {
      setAmeliyatlar([
        ...ameliyatlar,
        {
          id: Date.now(),
          hasta: form.hasta || "",
          tarih: form.tarih || "",
          tip: form.tip || "",
        },
      ]);
    }
    handleCloseModal();
  };

  const renderModalContent = () => {
    if (openModal === "randevu") {
      return (
        <Box
          sx={{
            position: "relative",
            p: 3,
            bgcolor: "#232b39",
            borderRadius: 2,
            minWidth: 340,
            boxShadow: 6,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8, color: "#b0b0b0" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#00bcd4", fontWeight: 700 }}
          >
            Yeni Randevu Ekle
          </Typography>
          <TextField
            label="Hasta Adı"
            name="hasta"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <TextField
            label="Tarih"
            name="tarih"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true, style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
            onChange={handleFormChange}
          />
          <TextField
            label="Saat"
            name="saat"
            type="time"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true, style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
            onChange={handleFormChange}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
          >
            Ekle
          </Button>
        </Box>
      );
    } else if (openModal === "hasta") {
      return (
        <Box
          sx={{
            position: "relative",
            p: 3,
            bgcolor: "#232b39",
            borderRadius: 2,
            minWidth: 340,
            boxShadow: 6,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8, color: "#b0b0b0" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#00bcd4", fontWeight: 700 }}
          >
            Yeni Hasta Ekle
          </Typography>
          <TextField
            label="Ad Soyad"
            name="ad"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <TextField
            label="Yaş"
            name="yas"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <TextField
            label="Cinsiyet"
            name="cinsiyet"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <TextField
            label="Tanı"
            name="tanı"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
          >
            Ekle
          </Button>
        </Box>
      );
    } else if (openModal === "ameliyat") {
      return (
        <Box
          sx={{
            position: "relative",
            p: 3,
            bgcolor: "#232b39",
            borderRadius: 2,
            minWidth: 340,
            boxShadow: 6,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8, color: "#b0b0b0" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#00bcd4", fontWeight: 700 }}
          >
            Yeni Ameliyat Ekle
          </Typography>
          <TextField
            label="Hasta Adı"
            name="hasta"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <TextField
            label="Tarih"
            name="tarih"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true, style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
            onChange={handleFormChange}
          />
          <TextField
            label="Tip"
            name="tip"
            fullWidth
            sx={{ mb: 2 }}
            onChange={handleFormChange}
            InputLabelProps={{ style: { color: "#b0b0b0" } }}
            inputProps={{ style: { color: "#fff" } }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
          >
            Ekle
          </Button>
        </Box>
      );
    }
    return null;
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "randevular":
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: 600, color: "#fff" }}
            >
              Randevular
            </Typography>
            {randevular.map((r) => (
              <Box key={r.id} sx={{ mb: 2, p: 2, ...flatBoxStyle }}>
                <Typography sx={{ color: "#e0e0e0" }}>
                  <b>Hasta:</b> {r.hasta}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Tarih:</b> {r.tarih} <b>Saat:</b> {r.saat}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Durum:</b> {r.durum}
                </Typography>
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal("randevu")}
            >
              Yeni Randevu Ekle
            </Button>
          </Box>
        );
      case "hastalar":
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: 600, color: "#fff" }}
            >
              Hastalar
            </Typography>
            {hastalar.map((h) => (
              <Box key={h.id} sx={{ mb: 2, p: 2, ...flatBoxStyle }}>
                <Typography sx={{ color: "#e0e0e0" }}>
                  <b>Ad:</b> {h.ad}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Yaş:</b> {h.yas}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Cinsiyet:</b> {h.cinsiyet}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Tanı:</b> {h.tanı}
                </Typography>
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal("hasta")}
            >
              Yeni Hasta Ekle
            </Button>
          </Box>
        );
      case "ameliyatlar":
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: 600, color: "#fff" }}
            >
              Ameliyatlar
            </Typography>
            {ameliyatlar.map((a) => (
              <Box key={a.id} sx={{ mb: 2, p: 2, ...flatBoxStyle }}>
                <Typography sx={{ color: "#e0e0e0" }}>
                  <b>Hasta:</b> {a.hasta}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Tarih:</b> {a.tarih}
                </Typography>
                <Typography sx={{ color: "#b0b0b0" }}>
                  <b>Tip:</b> {a.tip}
                </Typography>
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal("ameliyat")}
            >
              Yeni Ameliyat Ekle
            </Button>
          </Box>
        );
      case "mrzeka":
        return <MRZekaPanel doctor={doctor} />;
      case "profil":
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: 600, color: "#fff" }}
            >
              Profilim
            </Typography>
            <Box sx={{ p: 2, ...flatBoxStyle }}>
              <Typography sx={{ color: "#e0e0e0" }}>
                <b>Ad:</b> {doctor.name}
              </Typography>
              <Typography sx={{ color: "#b0b0b0" }}>
                <b>Uzmanlık:</b> {doctor.specialty}
              </Typography>
              <Typography sx={{ color: "#b0b0b0" }}>
                <b>Email:</b> {doctor.email}
              </Typography>
            </Box>
          </Box>
        );
      case "cikis":
        onLogout();
        return null;
      default:
        return null;
    }
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#181e2a",
        borderRight: "1px solid #232b39",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid #232b39",
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
          <PersonIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
            {doctor.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
            {doctor.specialty}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={selectedMenu === item.key}
              onClick={() => setSelectedMenu(item.key)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ color: "#b0b0b0" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ color: "#e0e0e0", fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "#151a23",
      }}
    >
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "#181e2a",
              borderRight: "1px solid #232b39",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "#181e2a",
              borderRight: "1px solid #232b39",
              position: "fixed",
              top: 72,
              height: "calc(100% - 72px)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          ml: { md: `${drawerWidth}px` },
          mt: { xs: 0, md: "72px" },
        }}
      >
        <AppBar
          position="fixed"
          color="primary"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "#181e2a",
            minHeight: 72,
            borderBottom: "1px solid #232b39",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <ScienceIcon sx={{ fontSize: 36, mr: 1, color: "#00bcd4" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: 1, color: "#fff" }}
              >
                tumorAI
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant={selectedMenu === "profil" ? "contained" : "outlined"}
                color="info"
                sx={{
                  color: "#fff",
                  borderColor: "#00bcd4",
                  background:
                    selectedMenu === "profil" ? "#00bcd4" : "transparent",
                  fontWeight: 600,
                }}
                onClick={() => setSelectedMenu("profil")}
              >
                Profilim
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ color: "#fff", borderColor: "#f44336", fontWeight: 600 }}
                onClick={onLogout}
              >
                Çıkış
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            maxWidth: 900,
            mx: "auto",
            width: "100%",
          }}
        >
          {renderContent()}
        </Box>
        <Modal open={!!openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
            }}
          >
            {renderModalContent()}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default Dashboard;
