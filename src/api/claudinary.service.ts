import axios from 'axios';

const CLOUD_NAME = 'dovqtb1c9';
const UPLOAD_PRESET = 'cafeteria_fotos'; 
export const uploadToCloudinary = async (file: string | Blob) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET); 

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url; 
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw new Error('No se pudo subir la imagen');
  }
};