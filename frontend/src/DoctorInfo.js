import React from "react";
import { Paper, Typography, Divider } from "@mui/material";

const DoctorInfo = ({ doctor }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Doktor Bilgileri
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Typography variant="body1">{doctor.name}</Typography>
    <Typography variant="body2">{doctor.specialty}</Typography>
    <Typography variant="body2">{doctor.email}</Typography>
  </Paper>
);

export default DoctorInfo;
