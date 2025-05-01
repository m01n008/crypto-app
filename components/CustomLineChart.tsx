import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface CustomLineChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  width: number;
  height: number;
  chartConfig: any;
  labels: string[];
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({ data, width, height, chartConfig, labels }) => {
  const labelCount = Math.min(labels.length, 6);
  const labelInterval = Math.ceil(labels.length / labelCount);

  return (
    <View style={styles.chartWrapper}>
      <LineChart
        data={data}
        width={width}
        height={height}
        chartConfig={{
          ...chartConfig,
          propsForLabels: {
            fontSize: 10, // Hide default labels
          },
        }}
        style={{ paddingHorizontal: 10 }}
        withHorizontalLabels={true}
        withVerticalLabels={false}
        segments={5}
      />
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
  labelContainer: {
    position: 'absolute',
    bottom: -20,
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

export default CustomLineChart;