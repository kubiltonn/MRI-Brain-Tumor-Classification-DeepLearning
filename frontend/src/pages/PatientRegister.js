import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Link,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const BACKEND_URL = "http://localhost:5000";

const PatientRegister = ({ onGoLogin, onGoBack }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
    accept: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !form.first_name ||
      !form.last_name ||
      !form.email ||
      !form.password ||
      !form.password2 ||
      !form.accept
    ) {
      setError("Tüm alanları doldurun ve sözleşmeyi kabul edin.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/register/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          gender: form.gender,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız!");
      onGoLogin && onGoLogin();
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
          Hasta Kayıt
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Ad"
            name="first_name"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.first_name}
            onChange={handleChange}
          />
          <TextField
            label="Soyad"
            name="last_name"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.last_name}
            onChange={handleChange}
          />
          <TextField
            label="Telefon"
            name="phone"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.phone}
            onChange={handleChange}
          />
          <TextField
            label="Adres"
            name="address"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.address}
            onChange={handleChange}
          />
          <TextField
            label="Şehir"
            name="city"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.city}
            onChange={handleChange}
          />
          <FormLabel
            component="legend"
            sx={{ textAlign: "left", color: "#b0b0b0", mb: 1 }}
          >
            Cinsiyet
          </FormLabel>
          <RadioGroup
            row
            name="gender"
            value={form.gender}
            onChange={handleChange}
            sx={{ mb: 2, justifyContent: "center" }}
          >
            <FormControlLabel
              value="Kadın"
              control={<Radio color="primary" />}
              label="Kadın"
            />
            <FormControlLabel
              value="Erkek"
              control={<Radio color="primary" />}
              label="Erkek"
            />
          </RadioGroup>
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Şifre"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            label="Şifre Tekrarı"
            name="password2"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.password2}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="accept"
                checked={form.accept}
                onChange={handleChange}
                color="primary"
              />
            }
            label={<span style={{ color: "#b0b0b0" }}>Kabul ediyorum</span>}
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>
        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onGoBack}
        >
          Geri Dön
        </Button>
        <Typography sx={{ mt: 2, color: "#b0b0b0" }}>
          Zaten hesabınız var mı?{" "}
          <Link
            href="#"
            underline="hover"
            onClick={onGoLogin}
            sx={{ color: "#00bcd4", fontWeight: 600 }}
          >
            Giriş Yap
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default PatientRegister;
