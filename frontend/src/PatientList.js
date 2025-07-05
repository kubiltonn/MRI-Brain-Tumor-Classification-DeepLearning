import React from "react";
import { Paper, Typography, Divider, Box } from "@mui/material";

const PatientList = ({ patients, onSelectPatient, selectedPatientId }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Hasta Listesi
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {patients.map((patient, idx) => (
      <Box
        key={patient.id}
        sx={{
          cursor: "pointer",
          backgroundColor:
            patient.id === selectedPatientId ? "primary.dark" : "inherit",
          color: patient.id === selectedPatientId ? "#fff" : "inherit",
          borderRadius: 1,
          p: 1,
          mb: 1,
          transition: "background 0.2s",
        }}
        onClick={() => onSelectPatient(patient)}
      >
        <Typography variant="body1">{patient.name}</Typography>
        <Typography variant="body2">Yaş: {patient.age}</Typography>
        <Typography variant="body2">Cinsiyet: {patient.gender}</Typography>
        {idx !== patients.length - 1 && <Divider sx={{ my: 1 }} />}
      </Box>
    ))}
  </Paper>
);

export default PatientList;
