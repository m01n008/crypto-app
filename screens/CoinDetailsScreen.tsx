import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
import ModalSelector from 'react-native-modal-selector';
import CustomWagmiChart from '../uiutils/CustomWagmiChart';
import * as Haptics from 'expo-haptics';
import { Coin, RootStackParamList, OHLCData } from '../types';

const screenWidth = Dimensions.get('window').width;

type CoinDetailsRouteProp = RouteProp<RootStackParamList, 'CoinDetails'>;

const CoinDetailsScreen: React.FC = () => {
  const route = useRoute<CoinDetailsRouteProp>();
  const { selectedCoin } = route.params;
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [timeFrame, setTimeFrame] = useState<'1' | '7' | '30' | '365' | 'max'>('30');
  const [currencyType, setCurrencyType] = useState<'usd' | 'aed'>('usd');
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [coinData, setCoinData] = useState<Coin | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {coinData ? (
          <>
            <Text style={styles.coinName}>{coinData.name}</Text>
            <Text style={styles.coinPrice}>
              {currencyType.toUpperCase()} {coinData.currentPrice.toFixed(2)}
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
              {isLoadingData ? (
                <ActivityIndicator size="large" color="#007AFF" />
              ) : ohlcData.length === 0 ? (
                <Text>No data available for this time frame</Text>
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
                />
              )}
            </View>
            <View style={styles.coinInfo}>
              <Text>Market Cap: {currencyType.toUpperCase()} {coinData.marketCap.toLocaleString()}</Text>
              <Text>24h Volume: {currencyType.toUpperCase()} {(coinData.currentPrice * 1000).toLocaleString()}</Text>
              <Text>Circulating Supply: {(coinData.currentPrice * 1000000).toLocaleString()}</Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color="#007AFF" />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  coinName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  coinPrice: {
    fontSize: 20,
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
  },
  selectText: {
    color: '#000',
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
    marginBottom: 50,
  },
  coinInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
});

export default CoinDetailsScreen;
