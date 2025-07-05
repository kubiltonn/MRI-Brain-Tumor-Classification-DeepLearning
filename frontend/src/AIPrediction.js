import React from "react";
import { Paper, Typography, Divider } from "@mui/material";

const AIPrediction = ({ prediction }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Yapay Zeka Tahmini
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {prediction ? (
      <>
        <Typography variant="body1">Tümör Tipi: {prediction.type}</Typography>
        <Typography variant="body2">
          Tahmin Skoru: %{prediction.score}
        </Typography>
      </>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Henüz tahmin yapılmadı.
      </Typography>
    )}
  </Paper>
);

export default AIPrediction;
