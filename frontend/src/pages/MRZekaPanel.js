import React, { useState } from "react";
import MRImage from "../MRImage";
import { Box, Typography, Select, MenuItem, Button } from "@mui/material";

const BACKEND_URL = "http://localhost:5000";

const MRZekaPanel = ({ doctor, patients }) => {
  const [mrImage, setMrImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  const handleImageUpload = async (imageDataUrl) => {
    if (!selectedPatient) {
      setError("Lütfen önce bir hasta seçin.");
      return;
    }
    setMrImage(imageDataUrl);
    setPrediction(null);
    setLoading(true);
    setError("");
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const uploadForm = new FormData();
      uploadForm.append("file", blob, "mr_image.png");
      uploadForm.append("patient_id", selectedPatient);
      const uploadRes = await fetch(`${BACKEND_URL}/mrimages/upload`, {
        method: "POST",
        body: uploadForm,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "MR yüklenemedi");
      const mr_image_id = uploadData.id;
      const predictForm = new FormData();
      predictForm.append("file", blob, "mr_image.png");
      predictForm.append("patient_id", selectedPatient);
      predictForm.append("mr_image_id", mr_image_id);
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: predictForm,
      });
      if (!response.ok) throw new Error("Tahmin alınamadı");
      const data = await response.json();
      const pred = {
        type: data.predicted_class,
        score:
          data.prediction
            .find((p) => p.class === data.predicted_class)
            ?.probability.replace("%", "") || "",
        all: data.prediction.map((p) => ({
          class: p.class,
          probability: p.probability.replace("%", ""),
        })),
      };
      setPrediction(pred);
    } catch (err) {
      setError("Tahmin alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ color: "#00bcd4", fontWeight: 700, mb: 2 }}
      >
        MR Görüntüsü & Yapay Zeka Tahmini
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ background: "#232b39", color: "#e0e0e0" }}
        >
          <MenuItem value="" disabled>
            Lütfen bir hasta seçin
          </MenuItem>
          {patients &&
            patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.email})
              </MenuItem>
            ))}
        </Select>
      </Box>
      <MRImage
        imageUrl={mrImage}
        onImageUpload={handleImageUpload}
        prediction={prediction}
      />
      {loading && (
        <Typography sx={{ color: "#00bcd4", mt: 2 }}>
          Tahmin yapılıyor...
        </Typography>
      )}
      {error && <Typography sx={{ color: "red", mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default MRZekaPanel;
