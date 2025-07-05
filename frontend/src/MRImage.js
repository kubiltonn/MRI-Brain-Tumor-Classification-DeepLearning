import React, { useState } from "react";
import {
  Paper,
  Typography,
  Divider,
  Box,
  Button,
  Modal,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const MRImage = ({ imageUrl, onImageUpload, prediction }) => {
  const [open, setOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom>
        MR Görüntüsü ve Tahmin
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt="MR Görüntüsü"
          sx={{
            width: "100%",
            height: 180,
            objectFit: "contain",
            borderRadius: 2,
            background: "#222",
            mb: 2,
            cursor: "zoom-in",
            transition: "box-shadow 0.2s",
            boxShadow: 2,
            "&:hover": { boxShadow: 6 },
          }}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 180,
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            borderRadius: 2,
            mb: 2,
          }}
        >
          MR Görüntüsü Yüklenecek
        </Box>
      )}
      <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
        MR Görüntüsü Yükle
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {/* Tahmin Sonucu */}
      {prediction && prediction.all ? (
        <Box
          sx={{
            mt: 1,
            p: 2,
            background: "#232b39",
            borderRadius: 2,
            textAlign: "left",
          }}
        >
          <Typography
            variant="subtitle1"
            color="primary.light"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            Tümör Sınıflandırma Sonuçları:
          </Typography>
          <List dense>
            {prediction.all.map((item) => (
              <ListItem key={item.class} disablePadding>
                <ListItemText
                  primary={`${item.class.replace("_", " ")}: %${
                    item.probability
                  }`}
                  primaryTypographyProps={{ fontSize: 15, color: "#e0e0e0" }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="subtitle1"
            color="secondary.main"
            sx={{ fontWeight: 600, mt: 1 }}
          >
            Tahmin:
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: "#e0e0e0" }}
          >
            Tümör Türü: {prediction.type}
          </Typography>
          <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
            Güven: %{prediction.score}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Henüz tahmin yapılmadı.
        </Typography>
      )}
      {/* Modal ile büyütülmüş önizleme */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            outline: "none",
            borderRadius: 2,
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt="MR Görüntüsü Büyük"
            sx={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 2,
            }}
          />
        </Box>
      </Modal>
    </Paper>
  );
};

export default MRImage;
