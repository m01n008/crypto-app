import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/lib/typescript/native-stack/types';
import { LineChart } from 'react-native-chart-kit';
import { Coin, RootStackParamList } from '../types';

const StarIcon = require('../assets/images/Star.png');
const RocketIcon = require('../assets/images/Rocket.png');
const TriangularFlagIcon = require('../assets/images/Triangular Flag.png');


const screenWidth = Dimensions.get('window').width;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MarketOverviewScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'featured' | 'top Gainers' | 'top Losers'>('featured');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

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
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, isLoading]);

  useEffect(() => {
    fetchCoins(true);
    const interval = setInterval(() => fetchCoins(true), 30000); // Update every 5s
    return () => clearInterval(interval);
  }, [activeTab]);

  const renderCoin = ({ item }: { item: Coin }) => (
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
          {item.priceChangePercentage24h}%
        </Text>
      </View>
      <LineChart
        data={{
          labels: [],
          datasets: [
            {
              data: [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
              ],
            },
          ],
        }}
        width={100}
        height={60}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: () =>
            item.priceChangePercentage24h >= 0 ? 'green' : 'red',
        }}
        withDots={false}
        withShadow={false}
        style={styles.chart}
      />
    </TouchableOpacity>
  );

  const tabIcons: Record<string, any> = {
    featured: StarIcon,
    "top Gainers": RocketIcon,
    "top Losers": TriangularFlagIcon,
  };

  return (
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
        ListFooterComponent={isLoading ? <ActivityIndicator /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: { padding: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  tabText: { fontSize: 16 },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  coinName: { fontSize: 16, fontWeight: 'bold' },
  coinSymbol: { fontSize: 14, color: '#666' },
  coinPrice: { fontSize: 16, fontWeight: 'bold' },
  coinChange: { fontSize: 14 },
  chart: { marginVertical: 8 },
});

export default MarketOverviewScreen;
