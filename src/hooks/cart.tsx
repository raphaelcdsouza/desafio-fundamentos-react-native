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
      const storedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      ).then();

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProductsArray = [...products];

      const itemAlreadyAddedIndex = newProductsArray.findIndex(
        item => item.id === product.id,
      );

      if (itemAlreadyAddedIndex === -1) {
        newProductsArray.push({ ...product, quantity: 1 });
      } else {
        newProductsArray[itemAlreadyAddedIndex].quantity += 1;
      }

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProductsArray),
      );
      setProducts(newProductsArray);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProductsArray = [...products];

      const itemAlreadyAddedIndex = newProductsArray.findIndex(
        item => item.id === id,
      );

      if (itemAlreadyAddedIndex === -1) return;

      newProductsArray[itemAlreadyAddedIndex].quantity += 1;

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProductsArray),
      );
      setProducts(newProductsArray);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProductsArray = [...products];

      const itemAlreadyAddedIndex = newProductsArray.findIndex(
        item => item.id === id,
      );

      if (
        itemAlreadyAddedIndex === -1 ||
        newProductsArray[itemAlreadyAddedIndex].quantity === 1
      )
        return;

      newProductsArray[itemAlreadyAddedIndex].quantity -= 1;

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProductsArray),
      );
      setProducts(newProductsArray);
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
