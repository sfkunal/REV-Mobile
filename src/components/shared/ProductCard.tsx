import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';
import { useNavigationContext } from '../../context/NavigationContext';
import { CartItem, Product } from '../../types/dataTypes';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCartContext } from '../../context/CartContext';
import { storefrontApiClient } from '../../utils/storefrontApiClient';
import debounce from 'lodash/debounce';


// structure planning:


// have cartItem as a useState Variable
// if we dont have cart item, use the query to get it. Store it so that when we need it later, it is quicker
// if we do, then no problem just use that

// then, make the request to the API with that. 







const ProductCard = memo(({ data }: { data: Product }) => {
  const { rootNavigation } = useNavigationContext();
  const { addItemToCart, substractQuantityOfItem, addQuantityOfItem } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [numInCart, setNumInCart] = useState(0);

  const [cartItem, setCartItem] = useState<CartItem | null>(null); // this is where the actual product item is stored
  const [localChanges, setLocalChanges] = useState(0);

  const [selectedOptions, setSelectedOptions] = useState(
    data && data.options
      ? data.options.map((option) => ({
        name: option.name,
        value: option.values.length === 1 ? option.values[0] : null,
      }))
      : []
  );

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
  const handleLocalAdd = () => {
    // setLocalChanges((prev) => prev + 1);
    setLocalChanges((prev) => prev + 1);
    setNumInCart((prev) => prev + 1);
    setShowCheckmark(true);
  };

  // if we subtract something, then we decrement the count and set the 'checkmark' to false iff we get less than or equal to 1
  const handleLocalSubtract = () => {
    if (numInCart + localChanges <= 1 || numInCart === 1) { // I do this here to prevent weird case at 2
      setShowCheckmark(false)
    }
    setLocalChanges((prev) => prev - 1)
    console.log(localChanges)
    setNumInCart((prev) => (prev > 0 ? prev - 1 : 0)); // never decrement below 0
  };

  const debouncedSync =
    debounce(async () => {
      const currentLocalChanges = localChanges;
      if (localChanges === 0) {
        console.log('no changes')
        return;
      }
      // console.log(currentLocalChanges)
      // console.log(localChanges)
      if (localChanges > 0) {
        // addQuantityOfItem(data.id, localChanges)
        try {


          // if we dont have the cart item, then we should get it
          if (!cartItem) {
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
            setCartItem(response.data.product.variantBySelectedOptions)
          }
          // from this point on, cartItem is always defined, but we put the if statement because useState doesnt always immediately update

          if (cartItem) {
            console.log('there is cart item')
            addItemToCart(cartItem, localChanges);
          } else {
            console.log('there is not cart item')
          }

        } catch (e) {
          // display an error message if something goes wrong
          if (typeof e === 'string') {
            setErrorMessage(e);
          } else {
            setErrorMessage('Something went wrong. Try again.');
          }
        } finally {
          setLocalChanges(0) // just kind of a catch all
        }

      } else if (localChanges < 0) {
        if (data?.id) { // just double checking so we dont hit any NaN errors or anything
          substractQuantityOfItem(data.id, -1 * localChanges)
        }
        setLocalChanges(0);
      }
    }
      // }, 500), [selectedItem, addQuantityOfItem, substractQuantityOfItem]
    );


  useEffect(() => {
    if (localChanges !== 0) {
      debouncedSync()
    }
    return () => {
      debouncedSync.cancel()
    }
  }, [localChanges, debouncedSync])




  // const debouncedSync = useMemo(() => debounce(async () => {
  //   if (localChanges > 0) {
  //     addQuantityOfItem(data.id, localChanges)
  //   } else if (localChanges < 0) {
  //     substractQuantityOfItem(data.id, -localChanges)
  //   }
  //   setLocalChanges(0); // once we update, we reset to 0
  // }, 500), []) // 0.5ms buffer, can play with this


  // useEffect to trigger the debounced sync when we have local changes
  // useEffect(() => {
  //   if (localChanges !== 0) {
  //     debouncedSync()
  //     setLocalChanges(0)
  //   }
  //   return () => {
  //     debouncedSync.cancel()
  //   }
  // }, [localChanges, debouncedSync])

  const debouncedAddItemToCart = useMemo(
    () =>

      debounce(async (quantity: number) => {
        // console.log(quantity) // likely an issue with the useState variables
        // console.log('new working')
        try {
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

          addItemToCart(response.data.product.variantBySelectedOptions as CartItem, quantity);
        } catch (e) {
          setNumInCart((prevNumInCart) => (prevNumInCart > 0 ? prevNumInCart - quantity : 0));
          // setShowCheckmark((prevShowCheckmark) => (prevShowCheckmark && numInCart > 0 ? true : false));
          setErrorMessage(typeof e === 'string' ? e : 'Something went wrong. Try again.');
          setLocalChanges(0);
        }
      }, 300),
    [addItemToCart, data.id, numInCart, selectedOptions]
  );



  const debouncedSubtractItemFromCart = useMemo(
    () =>

      debounce(async (quantity: number) => {
        // console.log('working')
        try {
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

          const id = response.data.product.variantBySelectedOptions.id;
          substractQuantityOfItem(id, quantity);

          if (numInCart <= 1) {
            setShowCheckmark(false);
          }
        } catch (e) {
          console.log(e);
          setNumInCart((prevNumInCart) => prevNumInCart + quantity);
        }
      }, 300),
    [data.id, numInCart, selectedOptions, substractQuantityOfItem]
  );

  const addToCart = useCallback(() => {
    // console.log('worki ng')
    setShowCheckmark(true);
    setNumInCart((prevNumInCart) => {
      const newNumInCart = prevNumInCart + 1;
      debouncedAddItemToCart(1);
      return newNumInCart;
    });
  }, []);

  const subtractFromCart = useCallback(() => {
    setNumInCart((prevNumInCart) => {
      const newNumInCart = prevNumInCart > 0 ? prevNumInCart - 1 : 0;
      debouncedSubtractItemFromCart(1);
      return newNumInCart;
    });
  }, [debouncedSubtractItemFromCart]);

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
        ) : showCheckmark ? (
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
                <TouchableOpacity onPress={handleLocalSubtract} style={{ backgroundColor: 'green', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.minusIcon}>-</Text>
                </TouchableOpacity>
              )}
              <View style={{ backgroundColor: 'yellow' }}>
                <Text style={styles.numInCartText}>{numInCart}</Text>
              </View>


              {/* <TouchableOpacity onPress={handleLocalAdd}>
                <Icon name="plus" size={25} color="#4B2D83" style={styles.plusIcon} />
              </TouchableOpacity> */}
              <TouchableOpacity onPress={handleLocalAdd} style={{ backgroundColor: 'orange', borderRadius: 40, width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={25} color="#4B2D83" style={styles.plusIcon} />
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
    letterSpacing: 1,
    paddingBottom: 8,
  },
  price: {
    marginTop: 2,
    fontSize: 16.2,
    fontWeight: '800',
    color: '#4B2D83',
  },
  smallPrice: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: '#4B2D83',
  },
  outOfStock: {
    marginTop: 3,
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
    // padding: 4,
    // marginRight: -4,
    // marginTop: 2,
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
    borderWidth: 1,
    borderColor: 'black',
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
    marginRight: -4,
    marginTop: 2,
  },
  minusIcon: {
    color: '#4B2D83',
    fontWeight: '800',
    fontSize: 40,
    marginTop: -8,
  },
  numInCartText: {
    color: '#4B2D83',
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    minWidth: 38,
    marginLeft: 2,
  },
});

export default ProductCard;