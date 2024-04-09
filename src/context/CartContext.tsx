import { useContext, createContext, useState, useEffect } from "react"
import { CartItem } from "../types/dataTypes"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { storefrontApiClient } from "../utils/storefrontApiClient"

type CartContextType = {
  resetCart: () => void
  getItemsCount: () => number
  getTotalPrice: () => number
  cartItems: CartItem[]
  addItemToCart: (item: CartItem, quantity: number) => void
  removeItemFromCart: (itemId: string) => void
  addQuantityOfItem: (itemId: string, quantity: number) => void
  substractQuantityOfItem: (itemId: string, quantity: number) => void
  getProductQuantityInCart: (title: string) => number
}

const Context = createContext<CartContextType | null>(null)

type Props = { children: React.ReactNode }

export const CartContext = ({ children }: Props) => {
  const [cartItems, setcartItems] = useState<CartItem[]>([])

  const restoreCartItems = async () => {
    try {
      const restoredCartItems: { id: string, quantity: number }[] = JSON.parse(await AsyncStorage.getItem('cart'))
      var cartItems: CartItem[] = []

      for await (const restoredCartItem of restoredCartItems) {
        try {
          const query = `query {
            node(id: "${restoredCartItem.id}") {
              ... on ProductVariant {
                id
                title
                image {
                  url
                  width
                  height
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                product {
                  title
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  value
                }
              }
            }
          }`

          const variables = { id: restoredCartItem.id }

          const response: any = await storefrontApiClient(query, variables)

          if (response.errors && response.errors.length != 0) {
            throw response.errors[0].message
          }

          const cartItem = response.data.node as CartItem

          const notTrackingStock = cartItem.quantityAvailable <= 0 && cartItem.availableForSale

          if (!cartItem.availableForSale) {
            throw 'Variant out of stock.'
          }

          if (notTrackingStock) {
            cartItem.quantity = restoredCartItem.quantity
          } else {
            if (restoredCartItem.quantity <= cartItem.quantityAvailable) {
              cartItem.quantity = restoredCartItem.quantity
            } else {
              cartItem.quantity = cartItem.quantityAvailable
            }
          }

          cartItems.push(cartItem)

        } catch (e) {
          console.log(e)
        }
      }

      setcartItems(cartItems)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    restoreCartItems()
  }, [])

  useEffect(() => {
    const cartItemsToBeStored = cartItems.map((cartItem) => ({ id: cartItem.id, quantity: cartItem.quantity }))
    AsyncStorage.setItem('cart', JSON.stringify(cartItemsToBeStored))
  }, [cartItems])

  const resetCart = () => {
    setcartItems([])
  }

  const getItemsCount = () => {
    var count = 0
    cartItems.forEach(item => count = count + item.quantity)

    return count
  }

  const getTotalPrice = () => {
    var totalPrice = 0
    cartItems.forEach(item => totalPrice = totalPrice + item.price.amount * item.quantity)

    return totalPrice
  }

  // should probably check vs ID here. Something to re-evaluate.
  // however, the issue is having productID vs variantID not matching (a pain)
  // so checking against title suffices
  const getProductQuantityInCart = (title: string) => {
    let quantity = 0;
    // console.log('CART ITEMS IN CONTEXT', cartItems.product.title)

    cartItems.forEach(item => {
      if (item.product.title === title) {
        quantity += item.quantity
      }
    })
    return quantity
  }

  // condition on quantity being greater than 0 to avoid negative edge cases. 
  const addItemToCart = (item: CartItem, quantity: number) => {
    // console.log("ADD ITEM TO CART CALLED")
    if (quantity > 0) {
      const index = cartItems.findIndex((arrayItem) => arrayItem.id == item.id);

      if (index == -1) {
        item.quantity = quantity;
        setcartItems(cartItems => [item, ...cartItems]);
      }
      else {
        // If the item is already in the cart, increase its quantity by the specified amount
        setcartItems(cartItems => (
          cartItems.map((cartItem) => {
            if (cartItem.id === item.id) {
              const notTrackingStock = cartItem.quantityAvailable <= 0 && cartItem.availableForSale;
              var newQuantity: number;

              if (notTrackingStock) {
                newQuantity = cartItem.quantity + quantity;
              } else {
                newQuantity = cartItem.quantityAvailable < cartItem.quantity + quantity ? cartItem.quantityAvailable : cartItem.quantity + quantity;
              }

              return { ...cartItem, quantity: newQuantity };
            }
            return cartItem;
          })
        ));
      }
    }
  }

  const removeItemFromCart = (itemId: string) => {
    setcartItems(cartItems => (
      cartItems.filter((item) => item.id != itemId)
    ))
  }


  // same as above, need a check on quantity to avoid weird edges
  const addQuantityOfItem = (itemId: string, quantity: number) => {
    // have a check for if the item is already in cart? It would be cleaner if it was in here tbh
    // console.log("ADD QUANTITY OF ITEM", quantity)
    if (quantity > 0) {
      setcartItems(cartItems => (
        cartItems.map((item) => {
          const notTrackingStock = item.quantityAvailable <= 0 && item.availableForSale
          var newQuantity: number

          if (notTrackingStock) {
            newQuantity = item.quantity + quantity
          } else {
            newQuantity = item.quantityAvailable <= item.quantity ? item.quantityAvailable : item.quantity + quantity
          }

          return (
            item.id == itemId ? { ...item, quantity: newQuantity } as CartItem : item
          )
        })
      ))
    }
  }

  const substractQuantityOfItem = (itemId: string, quantity: number) => {
    const item = cartItems.find((item) => item.id == itemId)

    // console.log(itemId, quantity)
    // console.log(item?.quantity)

    if (item?.quantity - quantity <= 0) {
      removeItemFromCart(itemId);
      return
    }
    // if (item?.quantity <= quantity) {
    //   removeItemFromCart(itemId)
    //   return
    // }
    setcartItems(cartItems => (
      cartItems.map((item) => {
        const newQuantity: number = item.quantity - quantity
        return (
          item.id == itemId ? { ...item, quantity: newQuantity } as CartItem : item
        )
      })
    ))
  }



  return (
    <Context.Provider value={{ resetCart, getItemsCount, getTotalPrice, cartItems, addItemToCart, addQuantityOfItem, removeItemFromCart, substractQuantityOfItem, getProductQuantityInCart }}>
      {children}
    </Context.Provider>
  )
}

export const useCartContext = () => {
  const cartContext = useContext(Context)

  if (!cartContext) throw new Error('You need to use this hook inside a context provider')

  return cartContext;
}

// export a function to get the quantity of that item in the cart
