import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

interface RatingDataPoint {
  date: string;
  rating: number;
  matchType: 'SINGLES' | 'DOUBLES';
  result: 'W' | 'L';
  opponent: string;
}

interface RatingChartProps {
  data: RatingDataPoint[];
  currentRating: number;
}

const RatingChart: React.FC<RatingChartProps> = ({ data, currentRating }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [selectedPoint, setSelectedPoint] = useState<RatingDataPoint | null>(null);

  // Generate sample data for different timeframes
  const generateChartData = (timeframe: string) => {
    const now = new Date();
    const dataPoints: RatingDataPoint[] = [];
    let baseRating = 4.0;
    
    const getDaysBack = () => {
      switch (timeframe) {
        case '1M': return 30;
        case '3M': return 90;
        case '6M': return 180;
        case '1Y': return 365;
        default: return 90;
      }
    };
    
    const daysBack = getDaysBack();
    
    for (let i = daysBack; i >= 0; i -= Math.max(1, Math.floor(daysBack / 20))) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic rating fluctuations
      const randomChange = (Math.random() - 0.5) * 0.2;
      baseRating = Math.max(1.0, Math.min(7.0, baseRating + randomChange));
      
      dataPoints.push({
        date: date.toISOString().split('T')[0],
        rating: parseFloat(baseRating.toFixed(2)),
        matchType: Math.random() > 0.5 ? 'SINGLES' : 'DOUBLES',
        result: Math.random() > 0.4 ? 'W' : 'L',
        opponent: `Player ${Math.floor(Math.random() * 100) + 1}`,
      });
    }
    
    return dataPoints;
  };

  const chartData = generateChartData(selectedTimeframe);
  
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#2563eb',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(226, 232, 240, 0.3)',
      strokeWidth: 1,
    },
  };

  const handleDataPointClick = (data: any) => {
    if (data && data.index >= 0 && data.index < chartData.length) {
      setSelectedPoint(chartData[data.index]);
    }
  };

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '1M': return '1 Month';
      case '3M': return '3 Months';
      case '6M': return '6 Months';
      case '1Y': return '1 Year';
      default: return '3 Months';
    }
  };

  const getRatingChange = () => {
    if (chartData.length < 2) return 0;
    const firstRating = chartData[0].rating;
    const lastRating = chartData[chartData.length - 1].rating;
    return parseFloat((lastRating - firstRating).toFixed(2));
  };

  const ratingChange = getRatingChange();
  const isPositive = ratingChange >= 0;

  return (
    <View style={styles.container}>
      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <View style={styles.ratingSummary}>
          <Text style={styles.currentRatingLabel}>Current Rating</Text>
          <Text style={styles.currentRatingValue}>{currentRating}</Text>
          <View style={styles.changeContainer}>
            <Ionicons 
              name={isPositive ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={isPositive ? '#10b981' : '#ef4444'} 
            />
            <Text style={[
              styles.changeText, 
              { color: isPositive ? '#10b981' : '#ef4444' }
            ]}>
              {isPositive ? '+' : ''}{ratingChange} ({getTimeframeLabel(selectedTimeframe)})
            </Text>
          </View>
        </View>
        
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                selectedTimeframe === tf && { backgroundColor: '#2563eb' }
              ]}
              onPress={() => setSelectedTimeframe(tf)}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === tf && { color: 'white' }
              ]}>
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: chartData.map((_, index) => 
              index % Math.max(1, Math.floor(chartData.length / 6)) === 0 ? 
              new Date(chartData[index].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
              ''
            ),
            datasets: [
              {
                data: chartData.map(point => point.rating),
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                strokeWidth: 3,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          onDataPointClick={handleDataPointClick}
          decorator={() => null}
        />
      </View>

      {/* Selected Point Details */}
      {selectedPoint && (
        <View style={styles.pointDetails}>
          <View style={styles.pointHeader}>
            <Text style={styles.pointDate}>{selectedPoint.date}</Text>
            <TouchableOpacity onPress={() => setSelectedPoint(null)}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View style={styles.pointInfo}>
            <View style={styles.pointRow}>
              <Text style={styles.pointLabel}>Rating:</Text>
              <Text style={styles.pointValue}>{selectedPoint.rating}</Text>
            </View>
            <View style={styles.pointRow}>
              <Text style={styles.pointLabel}>Match:</Text>
              <Text style={styles.pointValue}>{selectedPoint.matchType}</Text>
            </View>
            <View style={styles.pointRow}>
              <Text style={styles.pointLabel}>Result:</Text>
              <Text style={[
                styles.pointValue, 
                { color: selectedPoint.result === 'W' ? '#10b981' : '#ef4444' }
              ]}>
                {selectedPoint.result}
              </Text>
            </View>
            <View style={styles.pointRow}>
              <Text style={styles.pointLabel}>Opponent:</Text>
              <Text style={styles.pointValue}>{selectedPoint.opponent}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Chart Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
          <Text style={styles.legendText}>Rating Progression</Text>
        </View>
        <Text style={styles.legendNote}>
          Tap on chart points to see match details
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginVertical: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ratingSummary: {
    flex: 1,
  },
  currentRatingLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  currentRatingValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeframeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    minWidth: 40,
    alignItems: 'center',
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pointDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  pointInfo: {
    gap: 8,
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  pointValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  legend: {
    alignItems: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  legendNote: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default RatingChart;
