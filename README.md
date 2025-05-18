
# UMI Store E-Commerce Platform

UMI Store adalah aplikasi e-commerce yang memudahkan pelanggan untuk berbelanja online dengan pengalaman yang menyenangkan dan aman.

## Fitur Utama

- **Katalog Produk**: Browser produk berdasarkan kategori
- **Keranjang Belanja**: Mengelola item belanja dengan mudah
- **Sistem Autentikasi**: Login, register, dan login dengan media sosial
- **Panel Admin**: Manajemen produk dan pesanan
- **Responsive Design**: Kompatibel dengan berbagai ukuran layar

## Teknologi yang Digunakan

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Zustand, TanStack Query
- **Routing**: React Router
- **Form Handling**: React Hook Form dengan validasi Zod
- **UI Components**: Dibangun dengan shadcn/ui dan Radix UI
- **Icons**: Menggunakan Lucide React

## Struktur Folder

```
src/
├── components/     # Reusable UI components
│   ├── auth/       # Authentication related components
│   └── ui/         # UI components from shadcn
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── lib/            # Utilities, API helpers, types
├── pages/          # Page components
├── tests/          # Test files
└── ...
```

## Cara Menjalankan Aplikasi

1. Clone repository
2. Install dependencies:
   ```
   npm install
   ```
3. Jalankan development server:
   ```
   npm run dev
   ```

## Setup untuk Production

### Deployment Checklist

- [ ] Konfigurasi HTTPS
- [ ] Implementasi backend dan database
- [ ] Siapkan sistem pembayaran
- [ ] Implementasi pengelolaan stok
- [ ] Setup monitoring dan logging
- [ ] Optimalisasi performa

## Best Practices Pengembangan

- **Keamanan**: Sanitasi semua input user, gunakan HTTPS, ikuti praktik keamanan terbaik
- **Performa**: Optimalkan bundle size, lazy loading, dan meminimalkan re-render
- **Aksesibilitas**: Ikuti standar WCAG untuk memastikan aplikasi dapat diakses oleh semua pengguna
- **Testing**: Implementasi unit test untuk memastikan kualitas kode

## Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur X'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

## License

[MIT License](LICENSE)
