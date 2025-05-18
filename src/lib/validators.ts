
/**
 * Utility untuk validasi input
 */

/**
 * Validasi email
 * @param email - Email yang akan divalidasi
 * @returns Boolean yang menunjukkan apakah email valid
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
}

/**
 * Validasi kata sandi
 * @param password - Kata sandi yang akan divalidasi
 * @returns Object dengan status validasi dan pesan error
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return { isValid: false, message: "Password minimal 6 karakter" };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password harus mengandung setidaknya 1 angka" };
  }
  
  return { isValid: true, message: "" };
}

/**
 * Sanitasi input teks untuk mencegah XSS
 * @param input - Teks input yang akan disanitasi
 * @returns Teks yang telah disanitasi
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

/**
 * Validasi image file
 * @param file - File yang akan divalidasi
 * @returns Object dengan status validasi dan pesan error
 */
export function validateImageFile(file: File): { isValid: boolean; message: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: "Format file harus JPG, PNG, atau WEBP" 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: "Ukuran file maksimal 5MB" 
    };
  }
  
  return { isValid: true, message: "" };
}
