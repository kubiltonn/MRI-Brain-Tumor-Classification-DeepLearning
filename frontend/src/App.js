import React, { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PatientLogin from "./pages/PatientLogin";
import PatientRegister from "./pages/PatientRegister";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorRegister from "./pages/DoctorRegister";
import { Box, Button, Paper, Typography } from "@mui/material";

function App() {
  const [doctor, setDoctor] = useState(() => {
    const saved = localStorage.getItem("doctor");
    return saved ? JSON.parse(saved) : null;
  });
  const [patient, setPatient] = useState(() => {
    const saved = localStorage.getItem("patient");
    return saved ? JSON.parse(saved) : null;
  });
  const [mode, setMode] = useState(null); // "doctor" | "patient-login" | "patient-register" | "doctor-register"

  useEffect(() => {
    if (doctor) {
      localStorage.setItem("doctor", JSON.stringify(doctor));
    } else {
      localStorage.removeItem("doctor");
    }
  }, [doctor]);

  useEffect(() => {
    if (patient) {
      localStorage.setItem("patient", JSON.stringify(patient));
    } else {
      localStorage.removeItem("patient");
    }
  }, [patient]);

  const handleLogin = (doctorInfo) => {
    setDoctor(doctorInfo);
  };
  const handleLogout = () => {
    setDoctor(null);
    setMode(null);
  };
  const handlePatientLogin = (patientInfo) => {
    setPatient(patientInfo);
  };
  const handlePatientLogout = () => {
    setPatient(null);
    setMode(null);
  };

  if (doctor)
    return <DoctorDashboard doctor={doctor} onLogout={handleLogout} />;
  if (patient)
    return (
      <PatientDashboard patient={patient} onLogout={handlePatientLogout} />
    );

  if (mode === "doctor")
    return <LoginPage onLogin={handleLogin} onGoBack={() => setMode(null)} />;
  if (mode === "patient-login")
    return (
      <PatientLogin
        onLogin={handlePatientLogin}
        onGoRegister={() => setMode("patient-register")}
        onGoBack={() => setMode(null)}
      />
    );
  if (mode === "patient-register")
    return (
      <PatientRegister
        onGoLogin={() => setMode("patient-login")}
        onGoBack={() => setMode(null)}
      />
    );
  if (mode === "doctor-register")
    return (
      <DoctorRegister
        onGoLogin={() => setMode("doctor")}
        onGoBack={() => setMode(null)}
      />
    );

  // Kullanıcı tipi seçimi
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          tumorAI
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Giriş Yap
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => setMode("doctor")}
        >
          Doktor Girişi
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={() => setMode("patient-login")}
        >
          Hasta Girişi
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => setMode("doctor-register")}
        >
          Doktor Kayıt
        </Button>
      </Paper>
    </Box>
  );
}

export default App;
