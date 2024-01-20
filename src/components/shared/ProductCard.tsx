import { View, StyleSheet, Image, Dimensions, Text, TouchableWithoutFeedback } from 'react-native'
import { theme } from '../../constants/theme'
import { useNavigationContext } from '../../context/NavigationContext'
import { Product } from '../../types/dataTypes'
import { memo } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the Icon component
import { TouchableOpacity } from 'react-native-gesture-handler';


const ProductCard = memo(({ data }: { data: Product }) => {
  const { rootNavigation } = useNavigationContext();

  const handlePressProduct = () => {
    rootNavigation.push('ProductScreen', { data });
  };

  const handlePressPlusIcon = () => {
    console.log('hi');
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handlePressProduct}>
        <View>
          <Image
            source={{ uri: data.images.nodes[0].url }}
            style={styles.image}
          />
          <View>
            <Text style={styles.text}>{data.title.toUpperCase()}</Text>
            <View style={styles.priceContainer}>
              {data.compareAtPriceRange.minVariantPrice.amount >
                data.priceRange.minVariantPrice.amount && (
                  <Text style={styles.compareAtPrice}>
                    {data.compareAtPriceRange.minVariantPrice.amount}
                  </Text>
                )}
              <Text style={styles.price}>
                ${data.priceRange.minVariantPrice.amount}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableOpacity
        style={styles.cartContainer}
        onPress={handlePressPlusIcon}
      >
        <Icon name="plus" size={20} color="white" style={styles.plusIcon} />
      </TouchableOpacity>
    </View>
  );
});

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
  text: {
    marginTop: 10,
    paddingRight: 14,
    fontSize: 11,
    fontWeight: '300',
    color: theme.colors.text,
    letterSpacing: 1
  },
  price: {
    marginTop: 2,
    fontSize: 16.2,
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
    borderColor: '#D9D9D9',
    borderWidth: 1,
    padding: 5,
    borderRadius: 15,
    margin: 5
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
    padding: 4
  },
  cartContainer: {
    position: 'absolute', // Position the icon absolutely within the container
    bottom: 0, // Distance from the bottom
    right: 0,
    borderWidth: 1,
    borderRadius: 100,
    backgroundColor: '#4B2D83'
  },
})

export default ProductCard