import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { OHLCData } from '../types'; // Adjust path to your types.ts

const screenWidth = Dimensions.get('window').width;

interface CustomCandlestickChartProps {
  data: OHLCData[];
  width: number;
  height: number;
  labels: string[];
}

const CustomCandlestickChart: React.FC<CustomCandlestickChartProps> = ({ data, width, height, labels }) => {
  const labelCount = Math.min(labels.length, 6);
  const labelInterval = Math.ceil(labels.length / labelCount);

  // Calculate min/max for scaling
  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
  const maxPrice = Math.max(...allPrices);
  const minPrice = Math.min(...allPrices);
  const priceRange = maxPrice - minPrice;

  // Candlestick dimensions
  const candlestickWidth = (width - 40) / data.length / 2; // Half width for spacing
  const wickWidth = candlestickWidth / 4;

  return (
    <View style={styles.chartWrapper}>
      <View style={[styles.candlestickContainer, { width, height: height - 40 }]}>
        {data.map((d, index) => {
          const isPositive = d.close >= d.open;
          const bodyTop = ((maxPrice - Math.max(d.open, d.close)) / priceRange) * (height - 40);
          const bodyBottom = ((maxPrice - Math.min(d.open, d.close)) / priceRange) * (height - 40);
          const high = ((maxPrice - d.high) / priceRange) * (height - 40);
          const low = ((maxPrice - d.low) / priceRange) * (height - 40);
          const x = (index / (data.length - 1)) * (width - 40) + 20;

          return (
            <View key={index} style={[styles.candlestick, { left: x - candlestickWidth / 2 }]}>
              {/* Wick */}
              <View
                style={[
                  styles.wick,
                  {
                    top: high,
                    height: low - high,
                    left: candlestickWidth / 2 - wickWidth / 2,
                    width: wickWidth,
                  },
                ]}
              />
              {/* Body */}
              <View
                style={[
                  styles.body,
                  {
                    top: bodyTop,
                    height: bodyBottom - bodyTop,
                    width: candlestickWidth,
                    backgroundColor: isPositive ? 'green' : 'red',
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
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
                  transform: [{ rotate: '-70deg' }],
                },
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    position: 'relative',
  },
  candlestickContainer: {
    position: 'relative',
    marginHorizontal: 10,
  },
  candlestick: {
    position: 'absolute',
    alignItems: 'center',
  },
  wick: {
    position: 'absolute',
    backgroundColor: '#333',
  },
  body: {
    position: 'absolute',
  },
  labelContainer: {
    position: 'absolute',
    bottom: -30,
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
});

export default CustomCandlestickChart;