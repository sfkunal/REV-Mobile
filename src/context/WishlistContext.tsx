import { useContext, createContext, useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'

type WishlistContextType = {
  wishlist: Set<string>
  addItemToWishlist: (itemId: string) => Promise<void>
  removeItemFromWishlist: (selectedItemId: string) => Promise<void>
  isInWishList: (itemId: string) => boolean
}

const Context = createContext<WishlistContextType | null>(null)

type Props = { children: React.ReactNode }

export const WishlistContext = ({ children }: Props) => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const getWishlist = async () => {
    try {
      const wishlistStringified = await AsyncStorage.getItem('wishlist')
      if (wishlistStringified !== null) {
        setWishlist(new Set(JSON.parse(wishlistStringified)))
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getWishlist()
  }, [])

  const isInWishList = (itemId: string) => {
    return wishlist.has(itemId);
    // if (wishlist) {
    //   return wishlist.has(itemId);
    // } else {
    //   getWishlist()
    //   isInWishList(itemId); // if we don't have wishlist, grab it then try again
    //   console.log('insanity check')
    // }
  }

  // adds item to wish list based on itemID
  const addItemToWishlist = async (itemId: string) => {
    const updatedWishlist = new Set(wishlist).add(itemId)
    // const updatedWishlist = [...wishlist, itemId]
    setWishlist(updatedWishlist)
    try {
      const wishlistArray = [...updatedWishlist]
      await AsyncStorage.setItem('wishlist', JSON.stringify(wishlistArray))
    } catch (e) {
      console.log(e)
    }
  }

  const removeItemFromWishlist = async (selectedItemId: string) => {
    const updatedWishlist = new Set(wishlist);
    updatedWishlist.delete(selectedItemId);
    setWishlist(updatedWishlist);
    try {
      await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Context.Provider value={{ wishlist, addItemToWishlist, removeItemFromWishlist, isInWishList }}>
      {children}
    </Context.Provider>
  )
}

export const useWishlistContext = () => {
  const wishlistContext = useContext(Context)

  if (!wishlistContext) throw new Error('You need to use this hook inside a context provider')

  return wishlistContext;
}