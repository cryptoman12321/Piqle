import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';
import { useThemeStore } from '../stores/themeStore';
import { useGameStore } from '../stores/gameStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useNavigation } from '@react-navigation/native';
import { Game, Tournament } from '../types';

const CalendarScreen: React.FC = () => {
  const { getCurrentTheme } = useThemeStore();
  const { games, getUpcomingGames } = useGameStore();
  const { tournaments, getUpcomingTournaments } = useTournamentStore();
  const navigation = useNavigation<any>();
  
  const theme = getCurrentTheme();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTab, setSelectedTab] = useState<'GAMES' | 'TOURNAMENTS' | 'ALL'>('ALL');

  const styles = createStyles(theme);

  // Get events for the selected date
  const getEventsForDate = useCallback((date: string) => {
    const dateEvents = {
      games: games.filter(game => 
        game.startTime.toISOString().split('T')[0] === date
      ),
      tournaments: tournaments.filter(tournament => 
        tournament.startDate.toISOString().split('T')[0] === date
      ),
    };
    return dateEvents;
  }, [games, tournaments]);

  // Mark dates with events
  const getMarkedDates = useCallback(() => {
    const marked: any = {};
    
    // Mark game dates
    games.forEach(game => {
      const date = game.startTime.toISOString().split('T')[0];
      if (!marked[date]) {
        marked[date] = { marked: true, dotColor: theme.colors.primary };
      }
    });
    
    // Mark tournament dates
    tournaments.forEach(tournament => {
      const date = tournament.startDate.toISOString().split('T')[0];
      if (!marked[date]) {
        marked[date] = { marked: true, dotColor: theme.colors.secondary };
      } else {
        // If both game and tournament on same date, use a different color
        marked[date] = { marked: true, dotColor: theme.colors.warning };
      }
    });
    
    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }
    
    return marked;
  }, [games, tournaments, selectedDate, theme.colors]);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleCreateEvent = () => {
    Alert.alert(
      'Create Event',
      'What would you like to create?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Game', onPress: () => navigation.navigate('CreateGame' as never) },
        { text: 'Tournament', onPress: () => navigation.navigate('CreateTournament' as never) },
      ]
    );
  };

  const renderEventItem = (event: Game | Tournament, type: 'game' | 'tournament') => (
    <TouchableOpacity
      key={`${type}-${event.id}`}
      style={styles.eventItem}
      onPress={() => {
        if (type === 'game') {
          navigation.navigate('GameDetails' as never, { gameId: event.id } as never);
        } else {
          navigation.navigate('TournamentDetails' as never, { tournamentId: event.id } as never);
        }
      }}
    >
      <View style={styles.eventIcon}>
        <Ionicons
          name={type === 'game' ? 'game-controller' : 'trophy'}
          size={24}
          color={type === 'game' ? theme.colors.primary : theme.colors.secondary}
        />
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>
          {type === 'game' ? (event as Game).title : (event as Tournament).name}
        </Text>
        <Text style={styles.eventType}>
          {type === 'game' ? 'Game' : 'Tournament'}
        </Text>
        <Text style={styles.eventTime}>
          {type === 'game' 
            ? (event as Game).startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : (event as Tournament).startDate.toLocaleDateString()
          }
        </Text>
        <Text style={styles.eventLocation}>
          {type === 'game' 
            ? (event as Game).location.city 
            : (event as Tournament).location.city
          }
        </Text>
      </View>
      
      <View style={styles.eventStatus}>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const currentDateEvents = getEventsForDate(selectedDate);
  const allEvents = [...currentDateEvents.games, ...currentDateEvents.tournaments];

  const filteredEvents = selectedTab === 'ALL' ? allEvents :
    selectedTab === 'GAMES' ? currentDateEvents.games :
    currentDateEvents.tournaments;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Calendar</Text>
              <Text style={styles.headerSubtitle}>Schedule your pickleball activities</Text>
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreateEvent}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={handleDateSelect}
          markedDates={getMarkedDates()}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.text,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.textSecondary,
            dotColor: theme.colors.primary,
            selectedDotColor: '#ffffff',
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.text,
            indicatorColor: theme.colors.primary,
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ALL' && styles.activeTab]}
          onPress={() => setSelectedTab('ALL')}
        >
          <Text style={[styles.tabText, selectedTab === 'ALL' && styles.activeTabText]}>
            All Events
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'GAMES' && styles.activeTab]}
          onPress={() => setSelectedTab('GAMES')}
        >
          <Text style={[styles.tabText, selectedTab === 'GAMES' && styles.activeTabText]}>
            Games
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'TOURNAMENTS' && styles.activeTab]}
          onPress={() => setSelectedTab('TOURNAMENTS')}
        >
          <Text style={[styles.tabText, selectedTab === 'TOURNAMENTS' && styles.activeTabText]}>
            Tournaments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.eventCount}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const isGame = 'startTime' in event;
            return renderEventItem(event, isGame ? 'game' : 'tournament');
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Events</Text>
            <Text style={styles.emptyStateText}>
              {selectedTab === 'ALL' 
                ? 'No events scheduled for this date'
                : `No ${selectedTab.toLowerCase()} scheduled for this date`
              }
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateEvent}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.emptyStateButtonGradient}
              >
                <Text style={styles.emptyStateButtonText}>Create Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  addButton: {
    padding: theme.spacing.sm,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    borderRadius: 16,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: 'white',
  },
  eventsContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  eventCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  eventType: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  eventStatus: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  emptyStateButtonGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarScreen;
