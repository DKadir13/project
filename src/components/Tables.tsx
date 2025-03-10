import React, { useState } from 'react';
import { Product, OrderItem, Order } from '../types';
import { ShoppingCart, Printer, Plus, Minus, Coffee } from 'lucide-react';

interface TablesProps {
  products: Product[];
  tableCount: number;
  addOrder: (order: Order) => void;
}

const Tables: React.FC<TablesProps> = ({ products, tableCount, addOrder }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize categories when products change
  React.useEffect(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    setCategories(uniqueCategories);
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleSelectTable = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setCart([]);
    setOrderComplete(false);
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prevCart.filter(item => item.product.id !== productId);
      }
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCompleteOrder = () => {
    if (selectedTable === null || cart.length === 0) return;
    
    const order: Order = {
      id: Date.now(),
      tableNumber: selectedTable,
      items: [...cart],
      total: calculateTotal(),
      timestamp: new Date()
    };
    
    addOrder(order);
    setOrderComplete(true);
    
    // In a real application, you would send the order to a printer here
    console.log('Sipariş yazdırılıyor:', order);
    
    // Clear the cart after a short delay
    setTimeout(() => {
      setCart([]);
    }, 2000);
  };

  const handleConfirmOrder = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmCompleteOrder = () => {
    setShowConfirmation(false);
    handleCompleteOrder();
  };

  return (
    <div className="space-y-6">
      {selectedTable === null ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Bir Masa Seçin</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map(tableNumber => (
              <button
                key={tableNumber}
                onClick={() => handleSelectTable(tableNumber)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 p-4 rounded-lg flex flex-col items-center justify-center h-24 transition-colors"
              >
                <Coffee size={24} />
                <span className="mt-2 font-medium">Masa {tableNumber}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Masa {selectedTable}</h2>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Masalara Dön
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === null
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Hepsi
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full ${
                      selectedCategory === category
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{product.name}</h3>
                      <span className="font-bold text-amber-700">₺{product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={20} />
              <h3 className="text-xl font-bold">Sipariş</h3>
            </div>
            
            {orderComplete && (
              <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
                Sipariş tamamlandı ve yazıcıya gönderildi!
              </div>
            )}
            
            {cart.length === 0 ? (
              <p className="text-gray-500 py-4">Siparişte ürün yok. Ürün eklemek için ürünlere tıklayın.</p>
            ) : (
              <div className="space-y-4">
                <ul className="divide-y">
                  {cart.map((item, index) => (
                    <li key={index} className="py-2">
                      <div className="flex justify-between">
                        <span>{item.product.name}</span>
                        <span>₺{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.product.id);
                          }}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item.product);
                          }}
                          className="text-gray-600 hover:text-green-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Toplam:</span>
                    <span>₺{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleConfirmOrder}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Tamamla ve Yazdır
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Siparişi tamamlamak istediğinize emin misiniz?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelConfirmation}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmCompleteOrder}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;