import { View, Text, StyleSheet, TextInput, Dimensions, FlatList, ActivityIndicator, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchStackParamList } from '../types/navigation';
import { storefrontApiClient } from '../utils/storefrontApiClient';
import { Product } from '../types/dataTypes';
import ProductCard from '../components/shared/ProductCard';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchIcon } from '../components/shared/Icons';

// importing all of the thumbnails
import AllProducts from '../../assets/searchThumbnails/AllProducts.png'
import Beer from '../../assets/searchThumbnails/Beer.png'
import Booze from '../../assets/searchThumbnails/Booze.png'
import Candy from '../../assets/searchThumbnails/Candy.png'
import Chips from '../../assets/searchThumbnails/Chips.png'
import Drinks from '../../assets/searchThumbnails/Drinks.png'
import Energy from '../../assets/searchThumbnails/Energy.png'
import Healthy from '../../assets/searchThumbnails/Healthy.png'
import Ice_Cream from '../../assets/searchThumbnails/Ice_Cream.png'
import International from '../../assets/searchThumbnails/International.png'
import Personal from '../../assets/searchThumbnails/Personal.png'
import Popular from '../../assets/searchThumbnails/Popular.png'
import Ready from '../../assets/searchThumbnails/Ready.png'
import Snacks from '../../assets/searchThumbnails/Snacks.png'
import Student from '../../assets/searchThumbnails/Student.png'
import Sweet from '../../assets/searchThumbnails/Sweet.png'
import Nicotine from '../../assets/searchThumbnails/Nicotine.png'

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>

const Search = ({ navigation }: Props) => {
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [initialProducts, setInitialProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<any[]>([]);
  const { rootNavigation } = useNavigationContext()


  const fetchInitialProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const query = `{
      products(first: 64) {
        nodes {
          id
          title
          description
          vendor
          availableForSale
          options {
            id
            name 
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first:200) {
            nodes {
              availableForSale
              selectedOptions {
                value
              }
            }
          }
          images(first: 10) {
            nodes {
              url
              width
              height
            }
          }
        }
      }
    }`

    const response: any = await storefrontApiClient(query)

    if (response.errors && response.errors.length != 0) {
      setIsLoading(false)
      throw response.errors[0].message
    }

    setInitialProducts(response.data.products.nodes as Product[])
    setProducts(response.data.products.nodes as Product[]) //

    setIsLoading(false)
  }

  const fetchCollections = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const query = `query {
      collections(first: 20) {
        edges {
          node {
            id
            title
            description
            image {
              url
              height
              width
            }
          }
        }
      }
    }`;

    const response: any = await storefrontApiClient(query);

    if (response.errors && response.errors.length != 0) {
      setIsLoading(false);
      throw response.errors[0].message;
    }

    setCollections(response.data.collections.edges.map((edge: any) => edge.node));

    setIsLoading(false);
  };



  // this is to render it as the title
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: () => (
  //       <TextInput
  //         placeholder='Search our store'
  //         placeholderTextColor={theme.colors.disabledText}
  //         style={styles.input}
  //         onChangeText={(text) => setSearchInput(text)}
  //         autoCapitalize='none'
  //       />
  //     )
  //   })

  //   if (searchInput.length > 0) {
  //     try {
  //       fetchInitialProducts()
  //     } catch (e) {
  //       if (typeof e == 'string') {
  //         setErrorMessage(e)
  //       } else {
  //         setErrorMessage('Something went wrong. Try again.')
  //       }
  //     }
  //   }
  // }, [])

  useEffect(() => {
    fetchCollections();
    // console.log('popular:');
    // console.log(Popular);
  }, []);

  const search = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const query = `{
      products(first: 64, query: "title:${searchInput}*") {
        nodes {
          id
          title
          description
          vendor
          availableForSale
          options {
            id
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first:200) {
            nodes {
              availableForSale
              selectedOptions {
                value
              }
            }
          }
          images(first: 10) {
            nodes {
              url
              width
              height
            }
          }
        }
      }
    }`

    const response: any = await storefrontApiClient(query)

    if (response.errors && response.errors.length != 0) {
      setIsLoading(false)
      throw response.errors[0].message
    }

    setProducts(response.data.products.nodes as Product[])

    setIsLoading(false)
  }

  useEffect(() => {
    if (searchInput.length > 0) {
      try {
        search();
      } catch (e) {
        if (typeof e === 'string') {
          setErrorMessage(e);
        } else {
          setErrorMessage('Something went wrong. Try again.');
        }
      }
    } else {
      setProducts([]);
    }
  }, [searchInput]);


  const renderCollectionItem = ({ item }) => {
    let thumbnail = <></>;
    const w = windowWidth * 0.5 // this should be 0.427, but there is x-margin in the png
    // is this the best way to do it? 
    // can't change the photos in the field so I am storing them locally and then setting it based on the title.
    // in a perfect world, the image field on the shopify would be the correct photo
    if (item.title === 'All Products') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={AllProducts} />
    } else if (item.title === 'Beer & Wine') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Beer} />
    } else if (item.title === 'Booze etc.') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Booze} />
    } else if (item.title === 'Candy') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Candy} />
    } else if (item.title === 'Drinks') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Drinks} />
    } else if (item.title === 'Energy') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Energy} />
    } else if (item.title === 'Chips') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Chips} />
    } else if (item.title === 'Healthy') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Healthy} />
    } else if (item.title === 'Ice Cream') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Ice_Cream} />
    } else if (item.title === 'International') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={International} />
    } else if (item.title === 'Personal Care') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Personal} />
    } else if (item.title === 'Popular') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Popular} />
    } else if (item.title === 'Ready To Eat') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Ready} />
    } else if (item.title === 'Snacks') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Snacks} />
    } else if (item.title === 'Student Essentials') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Student} />
    } else if (item.title === 'Sweet Treats') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Sweet} />
    } else if (item.title === 'Nicotine') {
      thumbnail = <Image style={{
        width: w, height: 0.65 * w,
        // backgroundColor: 'black' 
      }} resizeMode="cover"
        source={Nicotine} />
    } else {
      return;
    }
    // console.log(item)
    return (
      <TouchableOpacity style={styles.collectionContainer} onPress={() => navigation.navigate('Collection', { collectionId: item.id })}>
        {/* <Text style={styles.text}>{item.title}</Text> */}
        {thumbnail}
      </TouchableOpacity>
    )
  }

  // old code to render a collection item
  // const renderCollectionItem = ({ item }) => (
  //   <>
  //     <TouchableOpacity>

  //     </TouchableOpacity>
  //     <LinearGradient
  //       colors={['#8671ae', '#d9d9d9']} // Replace with your desired gradient colors
  //       style={styles.collectionContainer}
  //     >
  //       <TouchableOpacity
  //         key={item.id}
  //         // style={styles.collectionContainer}
  //         onPress={() => navigation.navigate('Collection', { collectionId: item.id })}
  //       >
  //         <Text style={styles.text}>{item.title}</Text>

  //         {/* Optional: Add more details or images here */}
  //       </TouchableOpacity>
  //     </LinearGradient>
  //   </>
  // );

  return (
    <View style={{ marginTop: 10, flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ width: '95%', height: 45, backgroundColor: '#D9D9D9', display: 'flex', flexDirection: 'row', alignItems: 'center', borderTopRightRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={{ marginLeft: 20 }}>
          <SearchIcon color='black' size={20} />
        </View>

        <TextInput
          placeholder='Search'
          placeholderTextColor={theme.colors.disabledText}
          style={{ backgroundColor: '#D9D9D9', width: windowWidth - 100, marginLeft: 6, fontSize: 18, fontWeight: '500', padding: 10 }}
          onChangeText={(text) => setSearchInput(text)}
          autoCapitalize='none'
        />
      </View>

      {isLoading ? (
        <View style={styles.activityContainer}>
          <ActivityIndicator size={"small"} />
        </View>
      ) : (
        <>
          {errorMessage !== "" ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : (
            <>
              {searchInput.length > 0 ? (
                products.length !== 0 ? (
                  <FlatList
                    data={products}
                    renderItem={({ item }) => <ProductCard data={item} />}
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    contentContainerStyle={styles.container}
                  />
                ) : (
                  // TODO I dont think this actually shows up
                  <ScrollView
                    contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                    scrollEnabled={false}
                    keyboardDismissMode="on-drag"
                  >

                    <Text style={styles.text}>No results matching your search.</Text>
                  </ScrollView>
                )
              ) : (

                <View style={{ paddingTop: 10, }}>
                  {/* <PopularThumbNail color='black' size={24} /> */}

                  <FlatList
                    data={collections}
                    renderItem={renderCollectionItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 14, justifyContent: 'center', flexGrow: 1, paddingBottom: 50 }}
                  />
                </View>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}

const windowWidth = Dimensions.get('window').width
const screenWidth = Dimensions.get('screen').width


const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingLeft: 14,
    // marginBottom: 100,
    // paddingBottom: 120,
  },
  text: {
    color: '#FFFFFF',
    alignSelf: 'center',
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    marginTop: 16,
    width: windowWidth - 28,
    fontSize: 16,
    zIndex: 10,
    padding: 8,
    paddingHorizontal: 4,
    color: theme.colors.text,
  },
  activityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    color: 'red',
    alignSelf: 'center',
    marginTop: 12
  },
  collectionContainer: {
    flex: 1,
    // paddingBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // maxHeight: (((screenWidth - 28 - 14) / 2) * 1.5 + 130) * 0.2,
    // borderColor: '#4B2D83',
    // borderWidth: 2,
    // padding: 5,
    borderRadius: 15,
    // height: '95%'
    // margin: 5,
    // marginTop: 12,
    // backgroundColor: 'purple'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1.8,
    fontWeight: '500'
  },
  gradient: {
    // flex: 1,
    // width: '100%',
    // borderRadius: 15, // Match your TouchableOpacity's borderRadius
    // justifyContent: 'center', // Center the children vertically
    // alignItems: 'center', // Center the children horizontally
  },
})

export default Search