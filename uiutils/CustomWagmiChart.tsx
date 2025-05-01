import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart, CandlestickChart } from 'react-native-wagmi-charts';
import { OHLCData } from '../types';

const screenWidth = Dimensions.get('window').width;

interface CustomWagmiChartProps {
  chartType: 'line' | 'candlestick';
  data: OHLCData[];
  width: number;
  height: number;
  labels: string[];
  labelRotation: string;
  yValues?: number[];
  currencyType: 'usd' | 'aed';
}

const CustomWagmiChart: React.FC<CustomWagmiChartProps> = ({
  chartType,
  data,
  width,
  height,
  labels,
  labelRotation,
  yValues,
  currencyType,
}) => {
  const labelCount = Math.min(labels.length, 6);
  const labelInterval = Math.ceil(labels.length / labelCount);

  // Y-axis labels (optional)
  const yLabelCount = yValues ? 5 : 0;
  const maxValue = yValues ? Math.max(...yValues) : 0;
  const minValue = yValues ? Math.min(...yValues) : 0;
  const yStep = yValues ? (maxValue - minValue) / (yLabelCount - 1) : 0;

  // Line chart data format
  const lineData = data.map((d) => ({
    timestamp: d.timestamp,
    value: d.close,
  }));

  // Candlestick chart data format
  const candleData = data.map((d) => ({
    timestamp: d.timestamp,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));

  const formatPrice = (value: number) => {
    const symbol = currencyType === 'usd' ? '$' : 'AED ';
    return `${symbol}${value.toFixed(2)}`;
  };

  return (
    <View style={[styles.chartWrapper, { marginRight: 20 }]}>
      {chartType === 'line' ? (
        <LineChart.Provider data={lineData}>
          <LineChart width={width - 80} height={Platform.OS === 'ios' ? height : height - 90}>
            <LineChart.Path color="#007AFF" />
            <LineChart.PriceText
              style={yValues ? { fontSize: 10 } : styles.priceText}
              precision={2}
              format={({ value }) => {
                'worklet';
                const symbol = currencyType === 'usd' ? '$' : 'AED ';
                return `${symbol}${value}`;
              }}
            />
            <LineChart.DatetimeText
              style={{ fontSize: 10 }}
              locale="en-US"
              options={{ month: 'short', day: 'numeric' }}
            />
          </LineChart>
        </LineChart.Provider>
      ) : (
        <CandlestickChart.Provider data={candleData}>
          <CandlestickChart width={width - 80} height={Platform.OS === 'ios' ? height : height - 90}>
            <CandlestickChart.Candles />
            <CandlestickChart.Crosshair />
            <CandlestickChart.PriceText
              style={yValues ? { fontSize: 10 } : styles.priceText}
              precision={2}
              format={({ value }) => {
                'worklet';
                const symbol = currencyType === 'usd' ? '$' : 'AED ';
                return `${symbol}${value}`;
              }}
            />
            <CandlestickChart.DatetimeText
              style={{ fontSize: 10 }}
              locale="en-US"
              options={{ month: 'short', day: 'numeric' }}
            />
          </CandlestickChart>
        </CandlestickChart.Provider>
      )}
      <View style={styles.labelContainer}>
        {labels.map((label, index) => {
          if (index % labelInterval !== 0) return null;
          return (
            <Text
              key={index}
              style={[
                styles.label,
                {
                  left: (index / (labels.length - 1)) * (width - 40) + 20,
                  transform: [{ rotate: labelRotation }],
                },
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
      {yValues && (
        <View style={styles.yLabelContainer}>
          {Array.from({ length: yLabelCount }).map((_, index) => {
            const value = minValue + index * yStep;
            return (
              <Text
                key={index}
                style={[
                  styles.yLabel,
                  {
                    bottom: (index / (yLabelCount - 1)) * (height - 80) + 20,
                    transform: [{ rotate: labelRotation }],
                  },
                ]}
              >
                {formatPrice(value)}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    bottom: -10,
    width: '100%',
    right: -100, // Adjusted to move x-axis labels further right
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 60,
    transformOrigin: 'center bottom',
  },
  yLabelContainer: {
    position: 'absolute',
    right: -20, // Y-axis labels on right side
    height: '100%',
  },
  yLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    width: 60,
    textAlign: 'left', // Left-aligned for right-side labels
    transformOrigin: 'left center',
  },
  priceText: {
    fontSize: 10,
    color: '#666',
  },
});

export default CustomWagmiChart;