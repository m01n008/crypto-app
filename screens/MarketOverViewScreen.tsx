import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';
import { Coin, RootStackParamList } from '../types';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset'

const StarIcon = require('../assets/images/Star.png');
const RocketIcon = require('../assets/images/Rocket.png');
const TriangularFlagIcon = require('../assets/images/TriangularFlag.png');

const screenWidth = Dimensions.get('window').width;

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const MarketOverviewScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'featured' | 'top Gainers' | 'top Losers'>('featured');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  // Set navigation header background to black
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#000',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload assets
        await Asset.loadAsync([StarIcon, RocketIcon, TriangularFlagIcon]);
        // Fetch initial data
        await fetchCoins(true);
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        // Tell the app to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
    const interval = setInterval(() => fetchCoins(true), 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchCoins = useCallback(async (reset = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.get(
        `https://coingeko.burjx.com/coin-prices-all?currency=usd&page=${reset ? 1 : page}&pageSize=10`
      );

      let data = response.data.data;

      if (activeTab === 'top Gainers') {
        data = data.sort((a: Coin, b: Coin) => b.priceChangePercentage24h - a.priceChangePercentage24h);
      } else if (activeTab === 'top Losers') {
        data = data.sort((a: Coin, b: Coin) => a.priceChangePercentage24h - b.priceChangePercentage24h);
      }

      setCoins(prev => (reset ? data : [...prev, ...data]));
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching coins:', error);
      // Ensure loading state resets even on error
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, isLoading]);

  const getSampledSparkline = (sparkline: number[]) => {
    const sampleRate = Math.floor(sparkline.length / 16);
    const sampledData: number[] = [];
    for (let i = 0; i < sparkline.length; i += sampleRate) {
      sampledData.push(sparkline[i]);
    }
    return sampledData.slice(0, 16);
  };

  const renderCoin = ({ item }: { item: Coin }) => {
    const sampledSparkline = getSampledSparkline(item.sparkline);

    return (
      <TouchableOpacity
        style={styles.coinItem}
        onPress={() => navigation.navigate('CoinDetails', { selectedCoin: item })}
      >
        <View style={styles.coinContainer}>
          <Image style={styles.coinImage} source={{ uri: item.image }} />
          <View>
            <Text style={styles.coinName}>{item.name}</Text>
            <Text style={styles.coinSymbol}>{item.symbol.toUpperCase()}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.coinPrice}>${item.currentPrice}</Text>
          <Text
            style={[
              styles.coinChange,
              { color: item.priceChangePercentage24h >= 0 ? 'green' : 'red' },
            ]}
          >
            {item.priceChangePercentage24h.toFixed(2)}%
          </Text>
        </View>
        <LineChart
          data={{
            labels: [],
            datasets: [{ data: sampledSparkline.length > 0 ? sampledSparkline : [0] }],
          }}
          width={100}
          height={60}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => (item.priceChangePercentage24h >= 0 ? 'green' : 'red'),
            decimalPlaces: 0,
            propsForBackgroundLines: { strokeDasharray: '' },
          }}
          withDots={false}
          withShadow={false}
          style={styles.chart}
        />
      </TouchableOpacity>
    );
  };

  const tabIcons: Record<string, any> = {
    featured: StarIcon,
    'top Gainers': RocketIcon,
    'top Losers': TriangularFlagIcon,
  };

  if (!appIsReady) {
    // Render a minimal loading screen while assets and data are loading
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          {['featured', 'top Gainers', 'top Losers'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => {
                setActiveTab(tab as any);
                setIsLoading(true);
              }}
            >
              <View style={styles.tabContent}>
                <Image source={tabIcons[tab]} style={styles.tabIcon} />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={coins}
          renderItem={renderCoin}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={() => fetchCoins()}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: { flex: 1, backgroundColor: '#000' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: { padding: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabContent: { flexDirection: 'row', alignItems: 'center' },
  tabIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#fff',
  },
  tabText: { fontSize: 16, color: '#fff' },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#151414',
  },
  coinContainer: { flexDirection: 'row', alignItems: 'center' },
  coinImage: { width: 50, height: 50, marginRight: 10 },
  coinName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  coinSymbol: { fontSize: 14, color: '#ccc' },
  coinPrice: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  coinChange: { fontSize: 14, color: '#ccc' },
  chart: { marginVertical: 8 },
  flatList: {
    flex: 1,
    backgroundColor: '#000',
  },
  flatListContent: {
    backgroundColor: '#000',
    flexGrow: 1,
  },
  footer: {
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MarketOverviewScreen;