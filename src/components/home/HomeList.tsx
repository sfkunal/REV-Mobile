import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, UIManager, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../shared/ProductCard';
import { fetchCollection } from '../../queries/fetchCollection'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types/navigation';
import { useNavigationContext } from '../../context/NavigationContext';
// const [sbHeight, setsbHeight] = useState<any>(StatusBar.currentHeight)

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const MemoizedProductCard = React.memo(ProductCard)

const HomeList = ({ navigation }) => {
    const { rootNavigation } = useNavigationContext()
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const updatedData = await Promise.all(
                    sections.map(async (section) => {
                        const { products, hasNextPage, endCursor } = await fetchCollection(section.nav, null, 8);
                        return { ...section, data: products, hasNextPage, endCursor };
                    })
                );
                setSectionData(updatedData);
                // setEndCursors(updatedData.map((section) => section.endCursor));
                // setHasNextPages(updatedData.map((section) => section.hasNextPage));
            } catch (error) {
                setErrorMessage('Error loading data');
                console.log('Error loading data: ', error)
            }
        }
        fetchInitialData();
    }, []);

    const sections = [
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
        { title: 'Personal Care', data: [], nav: 'gid://shopify/Collection/456011972896', hasNextPage: true, endCursor: null },
    ];

    const [sectionData, setSectionData] = useState(sections);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [endCursors, setEndCursors] = useState(Array(sections.length).fill(null))
    const [hasNextPages, setHasNextPages] = useState(Array(sections.length).fill(true))

    const [loadingStates, setLoadingStates] = useState(Array(sections.length).fill(false));
    const [errorStates, setErrorStates] = useState(Array(sections.length).fill(''));


    // handleLoadMore fr tho
    const handleLoadMore = useCallback(async (sectionIndex) => {
        const section = sectionData[sectionIndex];
        const cursor = section.endCursor;
        const hasNextPage = section.hasNextPage;

        if (hasNextPage && !loadingStates[sectionIndex]) {
            setLoadingStates(prevStates => {
                const updatedStates = [...prevStates];
                updatedStates[sectionIndex] = true;
                return updatedStates;
            });
            setErrorStates(prevStates => {
                const updatedStates = [...prevStates];
                updatedStates[sectionIndex] = '';
                return updatedStates;
            });

            try {
                const { products, hasNextPage, endCursor } = await fetchCollection(section.nav, cursor, 8);
                setSectionData(prevData => {
                    const updatedData = [...prevData];
                    updatedData[sectionIndex] = {
                        ...section,
                        data: [...section.data, ...products],
                        hasNextPage,
                        endCursor,
                    };
                    return updatedData;
                });
            } catch (error) {
                setErrorStates(prevStates => {
                    const updatedStates = [...prevStates];
                    updatedStates[sectionIndex] = 'Error loading more products';
                    return updatedStates;
                });
                console.error('Error loading more products:', error);
            }
            setLoadingStates(prevStates => {
                const updatedStates = [...prevStates];
                updatedStates[sectionIndex] = false;
                return updatedStates;
            });
        }
    }, [sectionData, loadingStates]);

    const handleCollectionPress = useCallback((collectionId: string) => {
        navigation.navigate('Collection', { collectionId });
    }, [navigation]);

    const MemoizedFullList = React.memo(FullList);


    return (
        <View style={styles.container}>
            <FullList
                sections={sectionData}
                onLoadMore={handleLoadMore}
                onCollectionPress={handleCollectionPress}
                loadingStates={loadingStates}
                errorStates={errorStates}
                // extraData={sectionData}
                // maintainVisibleContentPosition={true}
                extraData={{ sectionData, loadingStates, errorStates }}
            />
        </View>
    );
};

const FullList = ({ sections, onLoadMore, onCollectionPress, loadingStates, errorStates, extraData }) => {
    // this renders a section (horizontal row)
    const renderSectionItem = ({ item, index }) => (
        <View style={{ flex: 1, borderWidth: 2, borderColor: '#4B2D83', marginLeft: 15, borderRadius: 30, width: '105%', paddingRight: 30, marginBottom: 28, }} >
            <TouchableOpacity
                style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, paddingHorizontal: 20, position: 'absolute', top: -16, left: 4, zIndex: 11, backgroundColor: 'white' }}
                onPress={() => onCollectionPress(item.nav)}
            >
                <Text style={{ fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>{item.title}</Text>
            </TouchableOpacity>
            {loadingStates[index] ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color='#4B2D83' />
                </View>
            ) : errorStates[index] ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorStates[index]}</Text>
                </View>
            ) : item.data.length > 0 ? (
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
                    data={item.data}
                    renderItem={renderProductItem}
                    keyExtractor={(product) => product.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onEndReached={() => onLoadMore(index)}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{}}
                    ListHeaderComponent={<View style={{ height: '100%', width: 10, }}></View>}
                    ListFooterComponent={
                        item.hasNextPage ? (
                            <View style={styles.footerContainer}>
                                <ActivityIndicator color="#4B2D83" />
                            </View>
                        ) : null
                    }
                // maintainVisibleContentPosition={{
                //     minIndexForVisible: 0,
                //     autoscrollToTopThreshold: 0,
                // }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator color='#4B2D83' />
                </View>
            )}
        </View >
    );

    const renderProductItem = useCallback(({ item }) => (
        <View style={{ width: 180, marginRight: 25, }}><ProductCard data={item} /></View>
    ), []);

    return (
        <FlatList
            ListHeaderComponent={<View style={{ width: '100%', height: 20 }}></View>}
            data={sections}
            renderItem={renderSectionItem}
            keyExtractor={(item) => item.title}
            initialNumToRender={4}
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
        height: 200,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        paddingHorizontal: 16,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
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