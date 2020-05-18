import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProductsArray = [...products];

      const itemAlreadyAddedIndex = newProductsArray.findIndex(
        item => item.id === id,
      );

      if (itemAlreadyAddedIndex >= 0) {
        newProductsArray[itemAlreadyAddedIndex].quantity += 1;

        setProducts(newProductsArray);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const { id } = product;

      const itemAlreadyAdded = products.find(item => item.id === id);

      let productWithQuantity: Product;

      if (!itemAlreadyAdded) {
        productWithQuantity = {
          ...product,
          quantity: 1,
        };

        setProducts([...products, productWithQuantity]);
      } else {
        increment(id);
      }
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      const newProductsArray = [...products];

      const itemAlreadyAddedIndex = newProductsArray.findIndex(
        item => item.id === id,
      );

      if (itemAlreadyAddedIndex >= 0) {
        if (newProductsArray[itemAlreadyAddedIndex].quantity <= 1) return;

        newProductsArray[itemAlreadyAddedIndex].quantity -= 1;

        setProducts(newProductsArray);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
