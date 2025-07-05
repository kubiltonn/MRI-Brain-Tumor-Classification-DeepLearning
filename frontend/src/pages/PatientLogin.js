import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Link,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const BACKEND_URL = "http://localhost:5000";

const PatientLogin = ({ onLogin, onGoRegister, onGoBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/login/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız!");
      onLogin && onLogin(data);
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
          <PersonIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Hasta Girişi
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <TextField
            label="Şifre"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
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
          Hesabınız yok mu?{" "}
          <Link
            href="#"
            underline="hover"
            onClick={onGoRegister}
            sx={{ color: "#00bcd4", fontWeight: 600 }}
          >
            Kayıt Ol
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default PatientLogin;
