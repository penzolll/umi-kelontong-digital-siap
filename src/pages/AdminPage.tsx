
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit, Eye, Package, ShoppingCart, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { products, categories } from "@/lib/data";
import { Product, Order } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";

export default function AdminPage() {
  const { toast } = useToast();
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Initialize data
  useEffect(() => {
    setProductsList(products);
    
    // Create mock orders
    const mockOrders: Order[] = [
      {
        id: 'ord-001',
        items: [
          { product: products[0], quantity: 2 },
          { product: products[2], quantity: 1 }
        ],
        totalAmount: products[0].price * 2 + products[2].price,
        customerName: 'Budi Santoso',
        address: 'Jl. Merdeka No. 123, Jakarta',
        phone: '081234567890',
        paymentMethod: 'bank-transfer',
        status: 'processing',
        createdAt: '2023-05-15T08:30:00Z'
      },
      {
        id: 'ord-002',
        items: [
          { product: products[1], quantity: 1 },
        ],
        totalAmount: products[1].price,
        customerName: 'Siti Rahayu',
        address: 'Jl. Pahlawan No. 45, Bandung',
        phone: '087654321098',
        paymentMethod: 'cod',
        status: 'shipped',
        createdAt: '2023-05-14T10:15:00Z'
      }
    ];
    
    setOrders(mockOrders);
  }, []);
  
  // Handle adding new product
  const handleAddProduct = () => {
    setCurrentProduct({
      id: '',
      name: '',
      price: 0,
      image: '/placeholder.svg',
      category: categories[0].id,
      stock: 0,
      description: '',
      isFeatured: false,
      isPromo: false
    });
    
    setIsEditing(true);
    setPreviewImage(null);
  };
  
  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
    setPreviewImage(product.image);
  };
  
  // Handle save product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProduct) return;
    
    if (!currentProduct.name || !currentProduct.description || currentProduct.price <= 0) {
      toast({
        title: "Error",
        description: "Harap lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }
    
    // Use the preview image if available
    const productToSave = {
      ...currentProduct,
      image: previewImage || currentProduct.image
    };
    
    if (currentProduct.id) {
      // Update existing product
      setProductsList(prev => 
        prev.map(p => p.id === currentProduct.id ? productToSave : p)
      );
      
      toast({
        title: "Sukses",
        description: `Produk ${currentProduct.name} berhasil diperbarui`
      });
    } else {
      // Add new product
      const newProduct = {
        ...productToSave,
        id: generateId(),
      };
      
      setProductsList(prev => [...prev, newProduct]);
      
      toast({
        title: "Sukses",
        description: `Produk ${newProduct.name} berhasil ditambahkan`
      });
    }
    
    setIsEditing(false);
    setCurrentProduct(null);
    setPreviewImage(null);
  };
  
  // Handle delete product
  const handleDeleteProduct = (productId: string) => {
    // In a real app, should add a confirmation dialog
    setProductsList(prev => prev.filter(p => p.id !== productId));
    
    toast({
      title: "Sukses",
      description: "Produk berhasil dihapus"
    });
  };
  
  // Handle update order status
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    toast({
      title: "Status Pesanan Diperbarui",
      description: `Pesanan ${orderId} sekarang "${status}"`
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran gambar maksimal 2MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive"
      });
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // In a real app with backend, you would upload the file to a server here
    // and get back the URL to store in the product
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Produk
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pesanan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          {isEditing ? (
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">
                {currentProduct?.id ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Produk</label>
                    <Input 
                      value={currentProduct?.name || ''}
                      onChange={e => setCurrentProduct(prev => 
                        prev ? { ...prev, name: e.target.value } : null
                      )}
                      placeholder="Nama produk"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      value={currentProduct?.category || ''}
                      onChange={e => setCurrentProduct(prev => 
                        prev ? { ...prev, category: e.target.value } : null
                      )}
                      required
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                    <Input 
                      type="number"
                      value={currentProduct?.price || 0}
                      onChange={e => setCurrentProduct(prev => 
                        prev ? { ...prev, price: Number(e.target.value) } : null
                      )}
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga Diskon (Rp)</label>
                    <Input 
                      type="number"
                      value={currentProduct?.discountPrice || ''}
                      onChange={e => setCurrentProduct(prev => 
                        prev ? { ...prev, discountPrice: e.target.value ? Number(e.target.value) : undefined } : null
                      )}
                      min="0"
                      step="100"
                      placeholder="Kosongkan jika tidak ada diskon"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Stok</label>
                    <Input 
                      type="number"
                      value={currentProduct?.stock || 0}
                      onChange={e => setCurrentProduct(prev => 
                        prev ? { ...prev, stock: Number(e.target.value) } : null
                      )}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={currentProduct?.isFeatured || false}
                        onChange={e => setCurrentProduct(prev => 
                          prev ? { ...prev, isFeatured: e.target.checked } : null
                        )}
                      />
                      <label htmlFor="featured" className="ml-2 text-sm">Produk Unggulan</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="promo"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={currentProduct?.isPromo || false}
                        onChange={e => setCurrentProduct(prev => 
                          prev ? { ...prev, isPromo: e.target.checked } : null
                        )}
                      />
                      <label htmlFor="promo" className="ml-2 text-sm">Produk Promo</label>
                    </div>
                  </div>

                  {/* Image upload section */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Gambar Produk</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <div className="w-24 h-24 border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center relative">
                        {previewImage ? (
                          <>
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                              title="Hapus gambar"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: JPG, PNG, GIF. Ukuran max: 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                    value={currentProduct?.description || ''}
                    onChange={e => setCurrentProduct(prev => 
                      prev ? { ...prev, description: e.target.value } : null
                    )}
                    placeholder="Deskripsi produk"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentProduct(null);
                      setPreviewImage(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    Simpan Produk
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mb-6">
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Baru
              </Button>
            </div>
          )}
          
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium">Produk</th>
                    <th className="px-4 py-3 text-sm font-medium">Kategori</th>
                    <th className="px-4 py-3 text-sm font-medium text-right">Harga</th>
                    <th className="px-4 py-3 text-sm font-medium text-right">Stok</th>
                    <th className="px-4 py-3 text-sm font-medium text-center">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {productsList.map(product => (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-muted mr-2 overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="font-medium line-clamp-1">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {product.discountPrice ? (
                          <div>
                            <div className="font-medium">{formatCurrency(product.discountPrice)}</div>
                            <div className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.price)}
                            </div>
                          </div>
                        ) : (
                          formatCurrency(product.price)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{product.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-1 text-xs">
                          {product.isFeatured && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                              Unggulan
                            </span>
                          )}
                          {product.isPromo && (
                            <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">
                              Promo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Lihat detail"
                            asChild
                          >
                            <Link to={`/product/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            title="Edit produk"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Hapus produk"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {productsList.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Belum ada produk. Klik "Tambah Produk Baru" untuk menambahkan produk.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium">ID Pesanan</th>
                    <th className="px-4 py-3 text-sm font-medium">Tanggal</th>
                    <th className="px-4 py-3 text-sm font-medium">Pelanggan</th>
                    <th className="px-4 py-3 text-sm font-medium text-right">Total</th>
                    <th className="px-4 py-3 text-sm font-medium">Pembayaran</th>
                    <th className="px-4 py-3 text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono">{order.id}</td>
                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {order.paymentMethod === 'cod' ? 'COD' : 'Transfer Bank'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="text-xs rounded-full px-2 py-1"
                          style={{
                            backgroundColor: 
                              order.status === 'pending' ? 'rgb(253, 186, 116)' : 
                              order.status === 'processing' ? 'rgb(147, 197, 253)' : 
                              order.status === 'shipped' ? 'rgb(167, 243, 208)' : 
                              order.status === 'delivered' ? 'rgb(134, 239, 172)' : 
                              order.status === 'cancelled' ? 'rgb(252, 165, 165)' : 
                              'transparent',
                            color: 'rgb(75, 85, 99)'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Diproses</option>
                          <option value="shipped">Dikirim</option>
                          <option value="delivered">Diterima</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs h-8"
                          >
                            Detail
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Belum ada pesanan.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
