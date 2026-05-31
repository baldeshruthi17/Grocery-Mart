import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Upload profile avatar or grocery item images to Firebase Storage bucket.
 * 
 * @param filePath The destination directory path in the bucket (e.g. 'products/item-1.jpg')
 * @param fileBlob The File/Blob containing local system image raw data
 * @returns Promise resolving to public storage secure URL
 */
export const uploadFile = async (filePath: string, fileBlob: Blob | File): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, fileBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage: Upload failed on path:", filePath, error);
    throw error;
  }
};

/**
 * Delete an object from the storage.
 * 
 * @param filePath Path of target element to erase (e.g., 'profiles/avatar-42.png')
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Firebase Storage: Deletion failed on path:", filePath, error);
    throw error;
  }
};
