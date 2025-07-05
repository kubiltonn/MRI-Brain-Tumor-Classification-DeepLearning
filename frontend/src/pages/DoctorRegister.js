import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const BACKEND_URL = "http://localhost:5000";

const DoctorRegister = ({ onGoLogin, onGoBack }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    title: "",
    email: "",
    phone: "",
    specialty: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/register/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız!");
      setSuccess("Kayıt başarılı! Giriş ekranına yönlendiriliyorsunuz...");
      setTimeout(onGoLogin, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #101624 0%, #232b39 100%)",
      }}
    >
      <Paper
        sx={{
          p: 5,
          borderRadius: 4,
          minWidth: 350,
          boxShadow: 6,
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
          }}
        >
          <PersonAddIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Doktor Kayıt
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Ad"
            name="first_name"
            fullWidth
            sx={{ mb: 2 }}
            value={form.first_name}
            onChange={handleChange}
          />
          <TextField
            label="Soyad"
            name="last_name"
            fullWidth
            sx={{ mb: 2 }}
            value={form.last_name}
            onChange={handleChange}
          />
          <TextField
            label="Ünvan"
            name="title"
            fullWidth
            sx={{ mb: 2 }}
            value={form.title}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Telefon"
            name="phone"
            fullWidth
            sx={{ mb: 2 }}
            value={form.phone}
            onChange={handleChange}
          />
          <TextField
            label="Branş"
            name="specialty"
            fullWidth
            sx={{ mb: 2 }}
            value={form.specialty}
            onChange={handleChange}
          />
          <TextField
            label="Şifre"
            name="password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography sx={{ mt: 2, color: "#00bcd4" }}>{success}</Typography>
        )}
        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onGoBack}
        >
          Geri Dön
        </Button>
        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={onGoLogin}
        >
          Giriş Yap
        </Button>
      </Paper>
    </Box>
  );
};

export default DoctorRegister;
