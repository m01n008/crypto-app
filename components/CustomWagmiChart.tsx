import React, { useMemo } from 'react';
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
  bullishColor?: string;
  bearishColor?: string;
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
  bullishColor = '#FFFF00',
  bearishColor = '#FF0000',
}) => {
  const labelCount = Math.min(labels.length, 6);
  const labelInterval = Math.ceil(labels.length / labelCount);

  const { yLabelCount, maxValue, minValue, yStep } = useMemo(() => {
    const count = yValues && yValues.length > 0 ? 5 : 0;
    const max = yValues && yValues.length > 0 ? Math.max(...yValues) : 0;
    const min = yValues && yValues.length > 0 ? Math.min(...yValues) : 0;
    const step = count > 0 && max !== min ? (max - min) / (count - 1) : 0;
    return { yLabelCount: count, maxValue: max, minValue: min, yStep: step };
  }, [yValues]);

  const lineData = data.map((d) => ({
    timestamp: d.timestamp,
    value: d.close,
  }));

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

  const chartHeight = Platform.OS === 'ios' ? height : height - 20;

  return (
    <View style={[styles.chartWrapper, { marginRight: 40, marginLeft: 20 }]}>
      {chartType === 'line' ? (
        <LineChart.Provider data={lineData}>
          <LineChart width={width - 120} height={chartHeight}>
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
          <CandlestickChart width={width - 120} height={chartHeight}>
            <CandlestickChart.Candles
              positiveColor={bullishColor}
              negativeColor={bearishColor}
            />
            <CandlestickChart.Crosshair />
            <CandlestickChart.PriceText
              style={[yValues ? { fontSize: 10 } : styles.priceText, { color: '#FFFF00',right: 40  }]} // Bright yellow for crosshair text
              precision={2}
              format={({ value }) => {
                'worklet';
                const symbol = currencyType === 'usd' ? '$' : 'AED ';
                return `${symbol}${value}`;
              }}
            />
            <CandlestickChart.DatetimeText
              style={{ fontSize: 10, color: '#FFFF00',right: 40 }}
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
                  left: (index / (labels.length - 1)) * (width - 120) + 20,
                  transform: [{ rotate: labelRotation }],
                },
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
      {yLabelCount > 0 && (
        <View style={[styles.yLabelContainer, { height: chartHeight }]}>
          {Array.from({ length: yLabelCount }).map((_, index) => {
            const value = minValue + index * yStep;
            return (
              <Text
                key={index}
                style={[
                  styles.yLabel,
                  {
                    bottom: (index / (yLabelCount - 1)) * (chartHeight - 80) + 20,
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
    bottom: 20,
    width: '100%',
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
    right: -20,
    height: '100%',
  },
  yLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    width: 60,
    textAlign: 'left',
    transformOrigin: 'left center',
  },
  priceText: {
    fontSize: 10,
    color: '#666',
  },
});

export default CustomWagmiChart;