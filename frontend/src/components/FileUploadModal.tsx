import React, { useState } from 'react';
import { Modal, Box, Typography, Paper, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  title?: string;
  acceptedFileTypes?: string;
  dropzoneText?: string;
  acceptedFileTypesText?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  open,
  onClose,
  onUpload,
  title = 'Upload File',
  acceptedFileTypes = '.csv',
  dropzoneText = 'Drag and drop a file here, or click to browse',
  acceptedFileTypesText = 'Only CSV files are accepted'
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const isValidFileType = (file: File): boolean => {
    // Simple validation based on file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = acceptedFileTypes.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    );
    return !!fileExtension && acceptedTypes.includes(fileExtension);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="upload-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 1,
      }}>
        <Typography id="upload-modal-title" variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        
        <Paper
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 1,
            p: 3,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            bgcolor: file ? '#f0f8ff' : 'inherit',
            '&:hover': {
              bgcolor: '#f0f9ff'
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            id="fileInput"
            accept={acceptedFileTypes}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="body1" align="center" gutterBottom>
            {file ? file.name : dropzoneText}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {!file && acceptedFileTypesText}
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={!file}
          >
            Upload
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default FileUploadModal; 