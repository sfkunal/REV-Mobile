import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';
import { useNavigationContext } from '../../context/NavigationContext';
import { CartItem, Product } from '../../types/dataTypes';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCartContext } from '../../context/CartContext';
import { storefrontApiClient } from '../../utils/storefrontApiClient';
import debounce from 'lodash/debounce';
import { CartIcon } from './Icons';


// structure planning:


// have cartItem as a useState Variable
// if we dont have cart item, use the query to get it. Store it so that when we need it later, it is quicker
// if we do, then no problem just use that

// then, make the request to the API with that. 



const ProductCard = memo(({ data }: { data: Product }) => {
  const { rootNavigation } = useNavigationContext();
  const { getItemsCount } = useCartContext();
  const { addItemToCart, substractQuantityOfItem, addQuantityOfItem } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCheckmark, setShowCheckmark] = useState(false);

  const [numInCart, setNumInCart] = useState<number>(0);
  const [cartItem, setCartItem] = useState<CartItem | null>(null); // this is where the actual product item is stored
  const [cartItemId, setCartItemId] = useState<string | null>(null)
  const [localChanges, setLocalChanges] = useState(0); // this is the optimistic change of the item

  const [selectedOptions, setSelectedOptions] = useState(
    data && data.options
      ? data.options.map((option) => ({
        name: option.name,
        value: option.values.length === 1 ? option.values[0] : null,
      }))
      : []
  );


  // future code to update the number of items in the cart
  // basically would just add the localChanges to the num in cart, so that it's reponsive

  // at the moment is only displaying the getItemsCount
  useEffect(() => {
    // gid://shopify/Product/8633387843872
    rootNavigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => {
            rootNavigation.goBack()
            rootNavigation.push('Cart')
          }}>
            <CartIcon color="#4a307e" size={24} />
            {getItemsCount() > 0 && (
              <View style={{
                position: 'absolute',
                right: 25,
                bottom: -7,
                backgroundColor: '#4a307e',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'white'
              }}>
                <Text style={{
                  color: 'white',
                  // fontSize: 10,
                  fontWeight: 'bold'
                }}>
                  {getItemsCount() + localChanges}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      ),
    })
  }, [localChanges])

  const handleLocalAdd = () => {
    setLocalChanges((prev) => prev + 1)
    setNumInCart((prev) => prev + 1)
  }

  const handleLocalSubtract = () => {
    // make sure that we have something to subtract
    if (numInCart + localChanges > 0) {
      setLocalChanges((prev) => prev - 1); // what happens if this goes below -numInCart? then we have issues
      setNumInCart((prev) => prev - 1)
    }

    // this should be able to go negative
  }

  // useEffect(() => {
  //   setNumInCart(prev => prev + localChanges)
  //   // setShowCheckmark(numInCart !== 0)
  // }, [localChanges])

  // gotta use useCallback otherwise the timer gets deleted. Some weird React thing.
  const syncCartCount = useCallback(
    debounce(async (quantity) => {


      // try {
      //   console.log('NO CART ITEM')
      //   console.log('cartItem: ', cartItem)
      //   if (!cartItem) {
      //     const newCartItem = await getCartItem(); // if no cart item, wait until we have one. 
      //     console.log(newCartItem.id)
      //     setCartItem(newCartItem)
      //     addItemToCart(newCartItem, quantity)
      //     console.log('HOPEFULLY CART ITEM:', cartItem)
      //   }
      //   console.log('quantity: ' + quantity)

      //   if (quantity > 0) { // 1 or more to add
      //     if (cartItem) { // sanity check to make sure that we have a cart item
      //       console.log('cart ITEM ID', cartItem.id)
      //       addQuantityOfItem(cartItem.id, quantity) // add that many items to the cart
      //     } else { // 1 or more to subtract
      //       // subtraction is weird so here is some extra protection against the negatives
      //       const quantityToSubtract = Math.min(numInCart, Math.abs(quantity))
      //       substractQuantityOfItem(cartItem.id, Math.abs(quantityToSubtract)) // parameter is positive so we keep it like that.
      //       setNumInCart((prev) => Math.max(prev - quantityToSubtract, 0));
      //     }
      //   }
      //   else {
      //     console.log('something weird happening on the first render')
      //   }
      //   // once we update the cart, we can set the local changes to 0. But what if they press again in that split second? We can just subtract the quantity that we modified. 
      //   setLocalChanges(localChanges => localChanges - quantity);
      // }

      try {
        // const quantity = localChanges;
        // console.log('we are inside the try block', quantity)
        if (localChanges !== 0) {

          if (cartItemId) {
            if (localChanges > 0) {
              addQuantityOfItem(cartItemId, localChanges);
            } else if (localChanges < 0) {
              const quantityToSubtract = Math.min(numInCart, Math.abs(localChanges));
              substractQuantityOfItem(cartItemId, quantityToSubtract);
              setNumInCart((prev) => Math.max(prev - quantityToSubtract, 0));
            }
          } else {
            // console.log('we go to the else block')
            const newCartItem = await getCartItem();
            // console.log("NEW CART ITEM", newCartItem)
            setCartItemId(newCartItem.id);
            addItemToCart(newCartItem, Math.abs(localChanges));
          }
          setLocalChanges(0);
        }
      } catch (e) {
        if (typeof e === 'string') {
          setErrorMessage(e)
        }
        console.log(e)
      }

    }), [500] // tims in ms for the debounce to work
  )

  useEffect(() => {
    // console.log("local changes from useEffect: " + localChanges)
    if (localChanges !== 0) {
      // console.log("SYNC CART TRIGGERED FROM USE EFFECT")
      syncCartCount(localChanges);
    }

  }, [localChanges])

  // this will set the cart Item to grab from the parameters. 
  // obviously want to minize the number of calls to this, so it should be wrapped in if statement. 
  const getCartItem = async () => {
    const query = `
                      query getProductById($id: ID!) {
                        product(id: $id) {
                          variantBySelectedOptions(selectedOptions: ${JSON.stringify(selectedOptions)
        .replaceAll(`"name"`, `name`)
        .replaceAll(`"value"`, `value`)}) {
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
                      }
                    `;
    const variables = { id: data.id };
    const response: any = await storefrontApiClient(query, variables);
    if (response.errors && response.errors.length !== 0) {
      throw response.errors[0].message;
    }
    // setCartItem(response.data.product.variantBySelectedOptions);
    return response.data.product.variantBySelectedOptions;
  }

  const selectedItem = useMemo(
    () =>
      data.variants.nodes.find((item) =>
        item.selectedOptions.every((option, index) => option.value === selectedOptions[index].value)
      ) || null,
    [selectedOptions, data.variants.nodes]
  );


  // can we just grab the cartItem with data.id? We have a query for that
  // console.log(data.id) // aka we can get the id really easily

  const noVariants = useMemo(
    () =>
      data.variants.nodes.length <= 1 &&
      data.variants.nodes[0].selectedOptions.length <= 1 &&
      data.variants.nodes[0].selectedOptions[0].value === 'Default Title',
    [data.variants.nodes]
  );

  const handlePressProduct = () => {
    rootNavigation.push('ProductScreen', { data });
  };

  // tracking things locally
  // if we add soemthing, we add one to the count and make sure that the 'checkmark' is shown
  // const handleLocalAdd = () => {
  //   // setLocalChanges((prev) => prev + 1);
  //   setLocalChanges((prev) => prev + 1);
  //   setNumInCart((prev) => prev + 1);
  //   setShowCheckmark(true);
  // };

  // // if we subtract something, then we decrement the count and set the 'checkmark' to false iff we get less than or equal to 1
  // const handleLocalSubtract = () => {
  //   if (numInCart + localChanges <= 1 || numInCart === 1) { // I do this here to prevent weird case at 2
  //     setShowCheckmark(false)
  //   }
  //   setLocalChanges((prev) => prev - 1)
  //   console.log(localChanges)
  //   setNumInCart((prev) => (prev > 0 ? prev - 1 : 0)); // never decrement below 0
  // };

  // useEffect(() => {
  //   const debouncedSync = debounce(async () => {
  //     const currentLocalChanges = localChanges;
  //     if (localChanges === 0) {
  //       return;
  //     }
  //     if (localChanges > 0) {
  //       try {
  //         if (!cartItem) {
  //           // Fetch the cart item if it doesn't exist

  //         }
  //         if (cartItem) {
  //           addItemToCart(cartItem, currentLocalChanges);
  //         }
  //       } catch (e) {
  //         if (typeof e === 'string') {
  //           setErrorMessage(e);
  //         } else {
  //           setErrorMessage('Something went wrong. Try again.');
  //         }
  //       } finally {
  //         setLocalChanges(0);
  //       }
  //     } else if (localChanges < 0) {
  //       if (cartItem) {
  //         const quantityToSubtract = Math.min(numInCart, -1 * currentLocalChanges);
  //         substractQuantityOfItem(cartItem.id, quantityToSubtract);
  //         setNumInCart((prev) => Math.max(prev - quantityToSubtract, 0));
  //         setShowCheckmark(numInCart - quantityToSubtract > 0);
  //       }
  //       setLocalChanges(0);
  //     }
  //   }, 300);

  //   debouncedSync();

  //   return () => {
  //     debouncedSync.cancel();
  //   };
  // }, [localChanges, cartItem, data.id, addItemToCart, substractQuantityOfItem]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePressProduct} disabled={!selectedItem?.availableForSale}>
        <View>
          <Image source={{ uri: data.images.nodes[0].url }} style={styles.image} />
          <View>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
              {data.title}
            </Text>
            <View style={styles.priceContainer}>
              {data.compareAtPriceRange.minVariantPrice.amount > data.priceRange.minVariantPrice.amount && (
                <Text style={styles.compareAtPrice}>{data.compareAtPriceRange.minVariantPrice.amount}</Text>
              )}
              {selectedItem?.availableForSale ? (
                // <Text style={styles.price}>${data.priceRange.minVariantPrice.amount}</Text>
                <Text style={styles.price}>

                  ${data.priceRange.minVariantPrice.amount.toString().split('.')[0]}.
                  <Text style={styles.smallPrice}>
                    {data.priceRange.minVariantPrice.amount.toString().split('.')[1]}
                  </Text>
                </Text>
              ) : (
                <Text style={styles.outOfStock}>Out of Stock</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.cartContainer} >

        {isLoading ? (
          <ActivityIndicator style={styles.activityIndicator} color="#4B2D83" />
        ) : numInCart + localChanges !== 0 ? (
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkContent}>
              {numInCart === 1 ? (
                <TouchableOpacity onPress={handleLocalSubtract} style={styles.trashCanIcon}>
                  <Image
                    source={require('../../../assets/TrashCan.png')}
                    style={styles.trashCanImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleLocalSubtract} style={{ width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 0, borderRadius: 40, marginRight: -6 }}>
                  <Text style={styles.minusIcon}>-</Text>
                </TouchableOpacity>
              )}
              <View style={{}}>
                <Text style={styles.numInCartText}>{numInCart}</Text>
              </View>


              {/* <TouchableOpacity onPress={handleLocalAdd}>
                <Icon name="plus" size={25} color="#4B2D83" style={styles.plusIcon} />
              </TouchableOpacity> */}
              <TouchableOpacity onPress={handleLocalAdd} style={{ borderRadius: 40, width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={25} color="#4B2D83" />
              </TouchableOpacity>

            </View>
          </View>
        ) : selectedItem?.availableForSale ? (
          <TouchableOpacity onPress={handleLocalAdd}>
            <Icon name="plus" size={25} color="#4B2D83" style={styles.plusIcon} />
          </TouchableOpacity>
        ) : null}

      </View>
    </View>
  );
});

const screenWidth = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
    justifyContent: 'space-between',
    maxHeight: ((screenWidth - 28 - 14) / 2) * 1.5 + 130,
    padding: 5,
    borderRadius: 15,
  },
  text: {
    marginTop: 10,
    paddingRight: 14,
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    // letterSpacing: 1,
    paddingBottom: 8,
  },
  price: {
    marginTop: 2,
    // fontSize: 16.2, v1 fontSizing
    fontSize: 18,
    fontWeight: '800',
    color: '#4B2D83',
  },
  smallPrice: {
    marginTop: 2,
    // fontSize: 13, v1 fontSizing
    fontSize: 15,
    fontWeight: '800',
    color: '#4B2D83',
  },
  outOfStock: {
    marginTop: 0,
    fontSize: 16.2,
    fontWeight: '500',
    color: '#ccc',
  },
  image: {
    alignSelf: 'center',
    width: ((screenWidth - 28 - 14) / 2) * 0.8,
    height: ((screenWidth - 28 - 14) / 2) * 1.5 * 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
  },
  compareAtPrice: {
    marginTop: 2,
    marginRight: 4,
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.text,
    textDecorationLine: 'line-through',
  },
  plusIcon: {
    padding: 4,
    // marginRight: -4,
    // marginTop: 2,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // this is to move it up so that it is in the same place as other one, aka doesnt move onPress
    // marginTop: -2,
    marginRight: 6,
    marginBottom: 1

  },
  cartContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  activityIndicator: {
    alignSelf: 'center',
  },
  checkmarkContainer: {
    width: 100,
    height: 36,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    // borderWidth: 1,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  checkmarkContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '85%',
  },
  trashCanIcon: {},
  trashCanImage: {
    height: 30,
    width: 30,
    marginRight: -5,
    marginTop: 2,
  },
  minusIcon: {
    color: '#4B2D83',
    fontWeight: '800',
    fontSize: 40,
    marginTop: -8,
    marginLeft: 2
  },
  numInCartText: {
    color: 'black',
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    minWidth: 38,
    marginRight: -4
  },
});

export default ProductCard;