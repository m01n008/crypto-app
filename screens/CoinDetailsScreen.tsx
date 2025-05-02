import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  StatusBar,
  Image,
} from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import ModalSelector from 'react-native-modal-selector';
import CustomWagmiChart from '../components/CustomWagmiChart';
import * as Haptics from 'expo-haptics';
import { Coin, RootStackParamList, OHLCData } from '../types';
const bgImage = require('../assets/images/BG.png');

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type CoinDetailsRouteProp = RouteProp<RootStackParamList, 'CoinDetails'>;

const CoinDetailsScreen: React.FC = () => {
  const route = useRoute<CoinDetailsRouteProp>();
  const navigation = useNavigation();
  const { selectedCoin } = route.params;
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [timeFrame, setTimeFrame] = useState<'1' | '7' | '30' | '365' | 'max'>('30');
  const [currencyType, setCurrencyType] = useState<'usd' | 'aed'>('usd');
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [coinData, setCoinData] = useState<Coin | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set navigation header with coin image and name, remove default title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#000', // Black header background
      },
      headerTintColor: '#fff', // White back button
      headerTitle: () => (
        <View style={styles.headerContainer}>
          {selectedCoin.image && (
            <Image
              source={{ uri: selectedCoin.image }}
              style={styles.headerCoinImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.headerCoinName}>{selectedCoin.name}</Text>
        </View>
      ),
      headerBackTitleVisible: false, // Remove the screen name next to the back button
    });
  }, [navigation, selectedCoin]);

  const timeFrameOptions = [
    { key: '1', label: '1D' },
    { key: '7', label: '7D' },
    { key: '30', label: '30D' },
    { key: '365', label: '1Y' },
    { key: 'max', label: 'All' },
  ];

  const currencyTypeOptions = [
    { key: 'usd', label: 'USD' },
    { key: 'aed', label: 'AED' },
  ];

  useEffect(() => {
    const fetchCoinData = async () => {
      setIsLoadingData(true);
      try {
        const ohlcResponse = await axios.get(
          `https://coingeko.burjx.com/coin-ohlc?productId=${selectedCoin?.productId}&days=${timeFrame}`
        );

        if (!ohlcResponse.data || !Array.isArray(ohlcResponse.data)) {
          console.error('Invalid API response:', ohlcResponse.data);
          setOhlcData((prev) => prev); // Preserve previous data
          return;
        }

        const newOhlcData = ohlcResponse.data
          .filter((item: any) => item[currencyType] || item.usd) // Ensure valid currency data
          .map((item: any) => ({
            timestamp: item.date,
            open: item[currencyType]?.open ?? item.usd.open, // Fallback to usd
            high: item[currencyType]?.high ?? item.usd.high,
            low: item[currencyType]?.low ?? item.usd.low,
            close: item[currencyType]?.close ?? item.usd.close,
          }));

        setCoinData(selectedCoin);
        setOhlcData(newOhlcData.length > 0 ? newOhlcData : ohlcData); // Preserve previous data if empty
      } catch (error) {
        console.error('Error fetching coin details:', error);
        setOhlcData((prev) => prev); // Preserve previous data
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCoinData();

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(fetchCoinData, 30000); // Increased to 30s

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedCoin, timeFrame, currencyType]);

  const maxDataPoints = 50;
  const visibleOhlcData = ohlcData.slice(-Math.floor(maxDataPoints / zoomLevel));

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleChartType = () => {
    setChartType((prev) => (prev === 'line' ? 'candlestick' : 'line'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Map currencyType to symbol
  const currencySymbol = currencyType === 'usd' ? '$' : 'AED ';

  return (
    <View style={styles.outerContainer}>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content" // White status bar icons for visibility on black
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <ImageBackground
            source={bgImage}
            style={[styles.backgroundImage, { height: screenHeight * 0.8 }]}
            resizeMode="cover"
          >
            <View style={styles.container}>
              {coinData ? (
                <>
                  <Text style={styles.coinPrice}>
                    {currencySymbol}
                    <Text style={styles.priceAmount}>{coinData.currentPrice.toFixed(2)}</Text>
                  </Text>
                  <Text style={styles.priceChange}>
                    {coinData.priceChangePercentage24h?.toFixed(2)}%
                  </Text>
                  <View style={styles.chartControls}>
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleChartType}>
                      <View
                        style={[
                          styles.toggleOption,
                          chartType === 'line' && styles.activeToggleOption,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            chartType === 'line' && styles.activeToggleText,
                          ]}
                        >
                          Line
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.toggleOption,
                          chartType === 'candlestick' && styles.activeToggleOption,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            chartType === 'candlestick' && styles.activeToggleText,
                          ]}
                        >
                          Candle
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <ModalSelector
                      style={{}}
                      selectStyle={styles.timePicker}
                      selectTextStyle={styles.selectText}
                      data={currencyTypeOptions}
                      selectedKey={currencyType}
                      onChange={(currencyOption) => {
                        if (currencyOption.key) {
                          console.log('Currency selected:', currencyOption.key);
                          setCurrencyType(currencyOption.key as 'usd' | 'aed');
                        }
                      }}
                      onModalClose={() => console.log('Currency modal closed')}
                      initValue="Currency"
                      cancelText="Cancel"
                    />
                    <ModalSelector
                      style={styles.timePickerContainer}
                      selectStyle={styles.timePicker}
                      selectTextStyle={styles.selectText}
                      data={timeFrameOptions}
                      selectedKey={timeFrame}
                      onChange={(option) => {
                        if (option.key) {
                          console.log('Time frame selected:', option.key);
                          setTimeFrame(option.key as '1' | '7' | '30' | '365' | 'max');
                        }
                      }}
                      onModalClose={() => console.log('Time frame modal closed')}
                      initValue="Time Frame"
                      cancelText="Cancel"
                    />
                  </View>
                  <View style={styles.zoomControls}>
                    <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
                      <Text style={styles.zoomButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
                      <Text style={styles.zoomButtonText}>−</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chartContainer}>
                    <View style={styles.chartPlaceholder}>
                      {isLoadingData ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                      ) : ohlcData.length === 0 ? (
                        <Text style={styles.noDataText}>No data available for this time frame</Text>
                      ) : (
                        <CustomWagmiChart
                          currencyType={currencyType}
                          chartType={chartType}
                          data={visibleOhlcData}
                          width={screenWidth - 40}
                          height={220}
                          labels={visibleOhlcData.map((d) =>
                            new Date(d.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          )}
                          labelRotation="-70deg"
                          yValues={visibleOhlcData.map((d) => d.close)}
                          bullishColor="#FFFF00"
                          bearishColor="#FF0000"
                        />
                      )}
                    </View>
                  </View>
                  <View style={styles.coinInfo}>
                    <Text style={styles.coinInfoText}>
                      Market Cap: {currencySymbol} {coinData.marketCap.toLocaleString()}
                    </Text>
                    <Text style={styles.coinInfoText}>
                      24h Volume: {currencySymbol} {coinData.tradingVolume.toLocaleString()}
                    </Text>
                    <Text style={styles.coinInfoText}>
                      Circulating Supply: {(coinData.marketCap / coinData.currentPrice).toLocaleString()}
                    </Text>
                  </View>
                </>
              ) : (
                <ActivityIndicator size="large" color="#007AFF" />
              )}
            </View>
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000', // Ensures entire screen background is black
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Make SafeAreaView transparent to show outerContainer's black background
  },
  scrollView: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    backgroundColor: '#000', // Fallback to black if image fails to load
  },
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  // Header styles for coin image and name
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCoinImage: {
    width: 32, // Increased from 24
    height: 32, // Increased from 24
    marginRight: 10, // Slightly increased spacing
  },
  headerCoinName: {
    fontSize: 22, // Increased from 18
    color: '#fff',
    fontWeight: 'bold',
  },
  coinPrice: {
    fontSize: 20,
    color: '#fff', // White text for visibility
  },
  priceAmount: {
    fontSize: 24, // Slightly larger
    fontWeight: 'bold', // Bold
  },
  priceChange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFF00', // Bright yellow
    marginBottom: 10,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  toggleButton: {
    flexDirection: 'row',
    width: 120,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  toggleOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeToggleOption: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
  },
  timePickerContainer: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    zIndex: 1000,
    marginHorizontal: 5,
  },
  timePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#fff', // Ensure picker background is visible
  },
  selectText: {
    color: '#000', // Black text for visibility on white picker background
    fontSize: 14,
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  zoomButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  chartContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 250,
  },
  chartPlaceholder: {
    width: screenWidth - 40,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#fff', // White text for visibility on dark background
  },
  coinInfo: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 20,
    position: 'relative',
    top: 0, // Reset top to avoid shifting
  },
  coinInfoText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'left',
    flexWrap: 'wrap',
    color: '#000', // Keep black text as coinInfo is on a light background
  },
});

export default CoinDetailsScreen;