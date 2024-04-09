import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, UIManager, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../shared/ProductCard';
import { fetchCollection } from '../../queries/fetchCollection'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types/navigation';
import { useNavigationContext } from '../../context/NavigationContext';
import { BottomSheetSectionList, TouchableHighlight } from '@gorhom/bottom-sheet';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { DownArrowIcon, RightArrowIcon, ViewAllArrow } from '../shared/Icons';
// const [sbHeight, setsbHeight] = useState<any>(StatusBar.currentHeight)

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const MemoizedProductCard = React.memo(ProductCard)

// creates a pair of product cards, so that they are vertically stacked
const ProductCardPair = ({ item1, item2 }) => (
    <View style={{ flexDirection: 'column', display: 'flex' }}>
        {item1 && <View style={{ height: 20 }} />}
        {item1 && <MemoizedProductCard data={item1} />}
        {item2 && <View style={{ height: 20 }} />}
        {item2 && <MemoizedProductCard data={item2} />}
    </View>
)

// pairs our products up so that they fit nicely intp the productcardPairs
// handles the odd case by pushing null on the 2nd element if not present
const pairProducts = (products) => {
    const paired = [];
    for (let i = 0; i < products.length; i += 2) {
        paired.push([products[i], products[i + 1] ? products[i + 1] : null])
    }
    return paired;
}

const HomeList = ({ navigation }) => {
    const { rootNavigation } = useNavigationContext()
    // const [sectionData, setSectionData] = useState(sections);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [lastLoadedSectionIndex, setLastLoadedSectionIndex] = useState<number>(3)
    const [isVerticalLoading, setIsVerticalLoading] = useState<boolean>(false);
    // const [endCursors, setEndCursors] = useState(Array(sections.length).fill(null))
    // const [hasNextPages, setHasNextPages] = useState(Array(sections.length).fill(true))

    // const [loadingStates, setLoadingStates] = useState(Array(sections.length).fill(false));
    // const [errorStates, setErrorStates] = useState(Array(sections.length).fill(''));

    const [sections, setSectionData] = useState([
        // all of the sections have a next page by default, and the endCursor object is null by default
        { title: 'Popular', data: [], nav: 'gid://shopify/Collection/456011481376', hasNextPage: true, endCursor: null },
        { title: 'Sweets', data: [], nav: 'gid://shopify/Collection/456011710752', hasNextPage: true, endCursor: null },
        { title: 'Energy', data: [], nav: 'gid://shopify/Collection/456011776288', hasNextPage: true, endCursor: null },
        { title: 'Drinks', data: [], nav: 'gid://shopify/Collection/456011514144', hasNextPage: true, endCursor: null },
        { title: 'Nicotine', data: [], nav: 'gid://shopify/Collection/459750572320', hasNextPage: true, endCursor: null },
        { title: 'International', data: [], nav: 'gid://shopify/Collection/458202546464', hasNextPage: true, endCursor: null },
        { title: 'Ready To Eat', data: [], nav: 'gid://shopify/Collection/456011940128', hasNextPage: true, endCursor: null },
        { title: 'Sweet Treats', data: [], nav: 'gid://shopify/Collection/456011710752', hasNextPage: true, endCursor: null },
        { title: 'Snacks', data: [], nav: 'gid://shopify/Collection/456011546912', hasNextPage: true, endCursor: null },
        { title: 'Chips', data: [], nav: 'gid://shopify/Collection/456011612448', hasNextPage: true, endCursor: null },
        { title: 'Healthy', data: [], nav: 'gid://shopify/Collection/458202448160', hasNextPage: true, endCursor: null },
        { title: 'Candy', data: [], nav: 'gid://shopify/Collection/456011677984', hasNextPage: true, endCursor: null },
        { title: 'Ice Cream', data: [], nav: 'gid://shopify/Collection/456011841824', hasNextPage: true, endCursor: null },
        { title: 'Beer & Wine', data: [], nav: 'gid://shopify/Collection/463924003104', hasNextPage: true, endCursor: null },
        { title: 'Booze', data: [], nav: 'gid://shopify/Collection/463924134176', hasNextPage: true, endCursor: null },
        { title: 'Student Essentials', data: [], nav: 'gid://shopify/Collection/456012038432', hasNextPage: true, endCursor: null },
        { title: 'Personal Care', data: [], nav: 'gid://shopify/Collection/456011972896', hasNextPage: true, endCursor: null },]);


    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // can change 4 to a larger number to render more sections. Cap at 17, though
                const updatedData = await Promise.all(
                    sections.slice(0, 4).map(async (section) => {
                        const { products, hasNextPage, endCursor } = await fetchCollection(section.nav, null, 8);
                        return { ...section, data: products, hasNextPage, endCursor };
                    })
                );
                setSectionData([...updatedData, ...sections.slice(4)]);
                setLastLoadedSectionIndex(3);
                // setEndCursors(updatedData.map((section) => section.endCursor));
                // setHasNextPages(updatedData.map((section) => section.hasNextPage));
            } catch (error) {
                setErrorMessage('Error fetching data');
                console.log('Error loading data: ', error)
            }
            setIsLoading(false);
        }
        fetchInitialData();
    }, []);

    const handleLoadMore = useCallback(async () => {
        if (isVerticalLoading || lastLoadedSectionIndex > 16) { // currently have the hard coded length. Since we are only loading like 2 of the sections because of the way that useState works?
            // console.log(sections.length)
            // console.log('handle load more returned early')
            return;
        } // if loading no need to call

        setIsVerticalLoading(true);
        // const sectionsToLoad = 2; 
        const start = lastLoadedSectionIndex + 1;
        const end = Math.min(start + 2, sections.length); // edit to load more sections at once
        const sectionsToLoad = sections.slice(start, end) // could be an edge case where we load too many and go out of bounds
        try {
            // console.log('we are in the try block')

            const fetchedSections = await Promise.all(
                sectionsToLoad.map(async (section) => {
                    const { products, hasNextPage, endCursor } = await fetchCollection(section.nav, null, 8);
                    return { ...section, data: [...section.data, ...products], hasNextPage, endCursor };
                })
            )
            // console.log('fetchedSections: ', fetchedSections)
            setSectionData(currentSections => {
                const updatedSections = [...currentSections];
                fetchedSections.forEach((newSection, index) => {
                    const sectionIndex = start + index; // correct index to add
                    updatedSections[sectionIndex] = newSection
                })
                return updatedSections;
            })

            setLastLoadedSectionIndex(end - 1);
        } catch (e) {
            setErrorMessage('Error fetching data')
            console.log(e)
        }
        setIsVerticalLoading(false);
    }, [sections, isVerticalLoading, lastLoadedSectionIndex]);



    const handleCollectionPress = useCallback((collectionId: string) => {
        navigation.navigate('Collection', { collectionId });
    }, [navigation]);

    const MemoizedFullList = React.memo(FullList);


    return (
        <View style={styles.container}>
            <FullList
                sections={sections}
                onLoadMore={handleLoadMore}
                onCollectionPress={handleCollectionPress}
                isVerticalLoading={isVerticalLoading}
                setSectionData={setSectionData}
            // ListFooterComponent={isLoading ? <ActivityIndicator /> : null}
            // loadingStates={loadingStates}
            // errorStates={errorStates}
            // extraData={sectionData}
            // maintainVisibleContentPosition={true}
            // extraData={{ sections, loadingStates, errorStates }}
            />
        </View>
    );
};

interface FullListProps {
    sections: {
        title: string;
        data: any[];
        nav: string;
        hasNextPage: boolean;
        endCursor: string | null;
    }[];
    onLoadMore: () => void;
    onCollectionPress: (collectionId: string) => void;
    isVerticalLoading: boolean;
    setSectionData: (data: any) => void;
}

const FullList = ({ sections, onLoadMore, onCollectionPress, isVerticalLoading, setSectionData }: FullListProps) => {
    const handleLoadMoreHorizontal = useCallback(async (sectionIndex) => {
        const section = sections[sectionIndex];
        if (section.hasNextPage) {
            try {
                const { products, hasNextPage, endCursor } = await fetchCollection(section.nav, section.endCursor, 8);
                setSectionData((currentSections) => {
                    const updatedSections = [...currentSections];
                    updatedSections[sectionIndex] = {
                        ...section,
                        data: [...section.data, ...products],
                        hasNextPage,
                        endCursor,
                    };
                    return updatedSections;
                })

            } catch (e) {
                console.log('Error fetching more data')
            }

        }

    }, [sections])

    // this renders a section (horizontal row)
    const renderSectionItem = ({ item, index }) => {
        const pairedData = pairProducts(item.data);
        return (
            <View style={{ flex: 1, borderWidth: 2, borderColor: '#4B2D83', marginLeft: 15, borderRadius: 30, width: '105%', paddingRight: 30, marginBottom: 28, }} >
                <View
                    style={{ borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, paddingHorizontal: 20, position: 'absolute', top: -20, left: 4, zIndex: 11, backgroundColor: 'white' }}
                // onPress={() => onCollectionPress(item.nav)}
                >
                    <Text style={{ fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>{item.title}</Text>
                </View>

                {/* see more section */}
                <TouchableOpacity onPress={() => onCollectionPress(item.nav)}
                    style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', top: -12, position: 'absolute', right: 40, zIndex: 1, backgroundColor: 'white', width: 100, height: 23, }}
                // onPress={() => onCollectionPress(item.nav)}
                >
                    <Text style={{ fontSize: 12, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>View all</Text>
                    {/* <ViewAllArrow size={6} color={'#4B2D83'} /> */}

                </TouchableOpacity>
                {/* loadingStates[index] ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color='#4B2D83' />
                </View>
            ) : errorStates[index] ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorStates[index]}</Text>
                </View>
            )
             :  */}
                {item.data.length > 0 ? (
                    // <FlatList
                    //     data={item.data}
                    //     renderItem={renderProductItem}
                    //     keyExtractor={(product) => product.id.toString()}
                    //     horizontal
                    //     showsHorizontalScrollIndicator={false}
                    //     onEndReached={() => onLoadMore(index)}
                    //     onEndReachedThreshold={0.5}
                    //     contentContainerStyle={{}}
                    // />
                    <FlatList
                        data={pairedData}
                        renderItem={renderProductItem}
                        keyExtractor={(product, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        // onEndReached={onLoadMore}
                        onEndReached={() => handleLoadMoreHorizontal(index)}
                        onEndReachedThreshold={0.8}
                        contentContainerStyle={{}}
                        ListHeaderComponent={<View style={{ height: '100%', width: 10, }}></View>}
                        ListFooterComponent={
                            item.hasNextPage && item.data.length > 0 ? (
                                <View style={styles.footerContainer}>
                                    <ActivityIndicator color="#4B2D83" />
                                </View>
                            ) : null
                        }

                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                            autoscrollToTopThreshold: 0,
                        }}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator color='#4B2D83' />
                    </View>
                )}
            </View >
        )
    };

    const renderProductItem = useCallback(({ item }) => (
        <View style={{ width: 180, marginRight: 25, }}>
            {/* <MemoizedProductCard data={item} /> */}
            <ProductCardPair item1={item[0]} item2={item[1]} />
        </View>
    ), []);

    return (
        <FlatList
            ListHeaderComponent={<View style={{ width: '100%', height: 20 }}></View>}
            data={sections}
            renderItem={renderSectionItem}
            keyExtractor={(item) => item.title}
            // initialNumToRender={4}
            onEndReached={() => {
                // console.log('onEndReached triggered')
                onLoadMore()
            }
            }
            showsVerticalScrollIndicator={false}
            // how many screen lengths from the bottom until you fecth new data
            // for reference, 1 section is about 0.75 screen lengths. 
            onEndReachedThreshold={30}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingBottom: 320
        // Add any other styles for the container
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 440,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 440,
        paddingHorizontal: 16,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 420,
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
    },
    footerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        height: '100%'
    },
});

export default HomeList;