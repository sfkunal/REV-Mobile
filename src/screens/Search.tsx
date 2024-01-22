import { View, Text, StyleSheet, TextInput, Dimensions, FlatList, ActivityIndicator, ScrollView } from 'react-native'
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

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>

const Search = ({navigation}: Props) => {
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

    if (response.errors && response.errors.length != 0 ) {
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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TextInput 
          placeholder='Search our store'
          placeholderTextColor={theme.colors.disabledText}
          style={styles.input}
          onChangeText={(text) => setSearchInput(text)}
          autoCapitalize='none'
        />
      )
    })

    if (searchInput.length > 0) {
      try {
        fetchInitialProducts()
      } catch (e) {
        if (typeof e == 'string') {
          setErrorMessage(e)
        } else {
          setErrorMessage('Something went wrong. Try again.')
        }
      } 
    }
  }, [])

  useEffect(() => {
    fetchCollections();
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

    if (response.errors && response.errors.length != 0 ) {
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

  const renderCollectionItem = ({ item }) => (
    
      <LinearGradient
        colors={['#8671ae', '#d9d9d9']} // Replace with your desired gradient colors
        style={styles.collectionContainer}
      >
        <TouchableOpacity
      key={item.id}
      // style={styles.collectionContainer}
      onPress={() => navigation.navigate('Collection', { collectionId: item.id })}
    >
        <Text style={styles.text}>{item.title}</Text>
        {/* Optional: Add more details or images here */}
        </TouchableOpacity>
      </LinearGradient>
    
  );
  
  return (
    <View style={{ marginTop: 8, flex: 1 }}>
      <View style={{ height: 0.5, backgroundColor: theme.colors.text, marginHorizontal: 14 }}></View>
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
                  <ScrollView
                   contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                   scrollEnabled={false}
                   keyboardDismissMode="on-drag"
                  >
                   <Text style={styles.text}>No results matching your search.</Text>
                  </ScrollView>
                )
              ) : (
                <View style={{paddingTop: 10}}>
                  <FlatList
                    data={collections}
                    renderItem={renderCollectionItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 14, justifyContent: 'center', flexGrow: 1 }}
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
    paddingLeft:14,
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
    marginTop:16,
    width: windowWidth-28,
    fontSize:16,
    zIndex: 10,
    padding:8,
    paddingHorizontal:4,
    color: theme.colors.text,
  },
  activityContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    color: 'red', 
    alignSelf: 'center', 
    marginTop:12
  },
  collectionContainer: {
    flex:1,
    paddingBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // maxHeight: (((screenWidth-28-14)/2)*1.5+130) * 0.2,
    borderColor: '#4B2D83',
    // borderWidth: 2,
    padding: 5,
    borderRadius: 15,
    margin: 5
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