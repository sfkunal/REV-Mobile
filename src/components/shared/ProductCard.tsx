import { View, StyleSheet, Image, Dimensions, Text, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator } from 'react-native'
import { theme } from '../../constants/theme'
import { useNavigationContext } from '../../context/NavigationContext'
import { CartItem, Product } from '../../types/dataTypes'
import { memo, useMemo, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the Icon component
import { useCartContext } from '../../context/CartContext';
import { storefrontApiClient } from '../../utils/storefrontApiClient';


const ProductCard = memo(({ data }: { data: Product }) => {
  const { rootNavigation } = useNavigationContext();
  const { addItemToCart, substractQuantityOfItem } = useCartContext();
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);
  const [numInCart, setNumInCart] = useState(0);


  const [selectedOptions, setSelectedOptions] = useState<{ name: string; value: string | null }[]>(
    data && data.options ? data.options.map((option) => (
      {
        name: option.name,
        value: option.values.length == 1 ? option.values[0] : null
      }
    )) : []
  );

  const selectedItem = useMemo(() => data.variants.nodes.find((item) => {
    return item.selectedOptions.every((option, index) => {
      if (option.value != selectedOptions[index].value) {
        return false
      }
      return true
    })
  }) || null, [selectedOptions])
  const noVariants = useMemo(() => data.variants.nodes.length <= 1 && data.variants.nodes[0].selectedOptions.length <= 1 && data.variants.nodes[0].selectedOptions[0].value == 'Default Title', [data])

  const handlePressProduct = () => {
    rootNavigation.push('ProductScreen', { data });
  };

  const addToCart = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      // do we need this query?
      const query = `query getProductById($id: ID!) {
        product(id: $id) {
          variantBySelectedOptions(selectedOptions: ${JSON.stringify(selectedOptions).replaceAll(`"name"`, `name`).replaceAll(`"value"`, `value`)}) {
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

      const variables = { id: data.id }

      const response: any = await storefrontApiClient(query, variables)

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }

      addItemToCart(response.data.product.variantBySelectedOptions as CartItem, 1)
      setShowCheckmark(true);
      setNumInCart(numInCart + 1);
      // setTimeout(() => setShowCheckmark(false), 2000);

    } catch (e) {
      if (typeof e == 'string') {
        setErrorMessage(e)
      } else {
        setErrorMessage('Something went wrong. Try again.')
      }
    }
    setIsLoading(false)
  }

  const subtractFromCart = async () => {
    setIsLoading(true)
    try {
      const query = `query getProductById($id: ID!) {
        product(id: $id) {
          variantBySelectedOptions(selectedOptions: ${JSON.stringify(selectedOptions).replaceAll(`"name"`, `name`).replaceAll(`"value"`, `value`)}) {
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

      const variables = { id: data.id }

      const response: any = await storefrontApiClient(query, variables)

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }
      // console.log(response)
      const id = response.data.product.variantBySelectedOptions.id
      substractQuantityOfItem(id)
      setNumInCart(numInCart - 1);
      if (numInCart <= 1) {
        setShowCheckmark(false)
      }
      console.log(showCheckmark)
      console.log(numInCart)
    } catch (e) {
      console.log(e)
    }

    setIsLoading(false)


    // gid://shopify/ProductVariant/46573933658400

    // setIsLoading(true);
    // substractQuantityOfItem(data.id)
    // setIsLoading(false);
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePressProduct}
        disabled={selectedItem?.availableForSale ? false : true}
        style={{}}
      >
        <View>
          <Image
            source={{ uri: data.images.nodes[0].url }}
            style={styles.image}
          />
          <View>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode='tail'>{data.title}</Text>
            <View style={styles.priceContainer}>
              {data.compareAtPriceRange.minVariantPrice.amount >
                data.priceRange.minVariantPrice.amount && (
                  <Text style={styles.compareAtPrice}>
                    {data.compareAtPriceRange.minVariantPrice.amount}
                  </Text>
                )}
              {selectedItem?.availableForSale ? (
                <Text style={styles.price}>
                  ${data.priceRange.minVariantPrice.amount.toString().split('.')[0]}.
                  <Text style={styles.smallPrice}>
                    {data.priceRange.minVariantPrice.amount.toString().split('.')[1]}
                  </Text>
                </Text>

              ) : (
                <Text style={{
                  marginTop: 3,
                  fontSize: 16.2,
                  fontWeight: '500',
                  color: '#ccc',
                }}>
                  Out of Stock
                </Text>
              )}

            </View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cartContainer}
        onPress={addToCart}
      >
        {isLoading ? (
          <ActivityIndicator style={{ alignSelf: 'center' }} color='#4B2D83' />
        ) :
          // showCheckmark
          showCheckmark ? ( // Show checkmark if showCheckmark is true
            <View style={{
              width: 100,
              // backgroundColor: 'gray',
              height: 36, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 26
            }}>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%', width: '85%' }}>
                {numInCart === 1 ? (<TouchableOpacity onPress={subtractFromCart} style={{}}>
                  <Image source={require('../../..//assets/TrashCan.png')} style={{ height: 32, width: 32, marginLeft: 2 }} resizeMode='contain' />
                </TouchableOpacity>) :
                  (<TouchableOpacity onPress={subtractFromCart}><Text style={{
                    color: '#4B2D83', fontWeight: '800', fontSize: 30, marginTop: -4
                    //  fontSize: Platform.OS == 'ios' ? 22 : 17, 
                  }}>-</Text></TouchableOpacity>)}
                <Text style={{
                  color: '#4B2D83',
                  fontSize: 25,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  minWidth: 38,
                  // backgroundColor: 'green', 
                  marginLeft: 2
                }}>{numInCart}</Text>
                <TouchableOpacity onPress={addToCart}>
                  <Icon name="plus" size={25} color="#4B2D83" style={styles.plusIcon} />
                </TouchableOpacity>
              </View>
            </View>
            // <Icon name="check" size={23} color="green" style={styles.checkIcon} />
          ) : selectedItem?.availableForSale ? ( // Check if the selected item is available for sale
            <Icon name="plus" size={25} color="#4B2D83" style={styles.plusIcon} />
            // <Text style={{ fontSize: 30, color: "#4B2D83" }}>+</Text>
          ) : null
        }
      </TouchableOpacity>
    </View>
  );
});

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
  text: {
    marginTop: 10,
    paddingRight: 14,
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    letterSpacing: 1,
    paddingBottom: 8
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
  image: {
    alignSelf: 'center',
    width: (screenWidth - 28 - 14) / 2 * 0.8,
    height: ((screenWidth - 28 - 14) / 2) * 1.5 * 0.5
  },
  container: {
    flex: 1,
    paddingBottom: 16,
    justifyContent: 'space-between',
    maxHeight: (((screenWidth - 28 - 14) / 2) * 1.5 + 130) * 0.8,
    // borderColor: '#D9D9D9',
    // borderWidth: 1,
    padding: 5,
    borderRadius: 15,
    margin: 5,
  },
  priceContainer: {
    flexDirection: 'row'
  },
  compareAtPrice: {
    marginTop: 2,
    marginRight: 4,
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.text,
    textDecorationLine: 'line-through'
  },
  plusIcon: {
    padding: 4,
    marginRight: -4,
    marginTop: 2,
  },
  checkIcon: {
    padding: 2
  },
  cartContainer: {
    position: 'absolute', // Position the icon absolutely within the container
    bottom: 10, // Distance from the bottom
    right: 10,
    // borderWidth: 1,
    // borderRadius: 100,
    // backgroundColor: '#4B2D83'
  },
})

export default ProductCard