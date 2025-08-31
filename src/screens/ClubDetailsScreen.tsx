import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useClubsStore, Club, ClubMember } from '../stores/clubsStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';

interface ClubDetailsRouteParams {
  clubId: string;
}

const ClubDetailsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { 
    getClubById,
    getUserRoleInClub,
    canUserManageClub,
    canUserCreateEvents,
    joinClubEvent,
    leaveClubEvent,
    removeMember,
    updateMemberRole,
    verifyMember
  } = useClubsStore();
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clubId } = route.params as ClubDetailsRouteParams;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events'>('overview');
  const [showMemberOptions, setShowMemberOptions] = useState<string | null>(null);

  const styles = createStyles(theme);

  const club = getClubById(clubId);
  const userRole = getUserRoleInClub(clubId, user?.id || '');
  const canManage = canUserManageClub(clubId, user?.id || '');
  const canCreateEvents = canUserCreateEvents(clubId, user?.id || '');

  useEffect(() => {
    if (!club) {
      Alert.alert('Error', 'Club not found');
      navigation.goBack();
    }
  }, [club, navigation]);

  if (!club) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Club Not Found</Text>
          <Text style={styles.errorText}>The club you're looking for doesn't exist.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleJoinEvent = (eventId: string) => {
    if (!user?.id) return;
    
    const event = club.events.find(e => e.id === eventId);
    if (!event) return;

    if (event.participants.includes(user.id)) {
      Alert.alert(
        'Leave Event',
        'Are you sure you want to leave this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => leaveClubEvent(clubId, eventId, user.id)
          },
        ]
      );
    } else {
      if (event.currentParticipants >= event.maxParticipants) {
        Alert.alert('Event Full', 'This event has reached maximum capacity.');
        return;
      }
      
      joinClubEvent(clubId, eventId, user.id);
      Alert.alert('Success', 'You have joined the event!');
    }
  };

  const handleMemberAction = (member: ClubMember, action: 'remove' | 'promote' | 'demote' | 'verify') => {
    if (!canManage) return;

    switch (action) {
      case 'remove':
        Alert.alert(
          'Remove Member',
          `Are you sure you want to remove ${member.userName} from the club?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Remove', 
              style: 'destructive',
              onPress: () => removeMember(clubId, member.userId)
            },
          ]
        );
        break;
      
      case 'promote':
        if (member.role === 'MEMBER') {
          updateMemberRole(clubId, member.userId, 'ORGANIZER');
        } else if (member.role === 'ORGANIZER') {
          updateMemberRole(clubId, member.userId, 'ADMIN');
        }
        setShowMemberOptions(null);
        break;
      
      case 'demote':
        if (member.role === 'ADMIN') {
          updateMemberRole(clubId, member.userId, 'ORGANIZER');
        } else if (member.role === 'ORGANIZER') {
          updateMemberRole(clubId, member.userId, 'MEMBER');
        }
        setShowMemberOptions(null);
        break;
      
      case 'verify':
        verifyMember(clubId, member.userId);
        setShowMemberOptions(null);
        break;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return theme.colors.primary;
      case 'ADMIN': return theme.colors.error;
      case 'ORGANIZER': return theme.colors.warning;
      case 'MEMBER': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return 'crown';
      case 'ADMIN': return 'shield';
      case 'ORGANIZER': return 'star';
      case 'MEMBER': return 'person';
      default: return 'person';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Club Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{club.description}</Text>
      </View>

      {/* Club Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{club.currentMembers}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={theme.colors.success} />
            <Text style={styles.statNumber}>{club.events.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={theme.colors.warning} />
            <Text style={styles.statNumber}>{club.stats.totalTournaments}</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={theme.colors.info} />
            <Text style={styles.statNumber}>{club.stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Club Rules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Club Rules</Text>
        {club.rules.map((rule, index) => (
          <View key={index} style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      {/* Club Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {club.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Ionicons name="trophy" size={16} color={theme.colors.warning} />
            <Text style={styles.achievementText}>{achievement}</Text>
          </View>
        ))}
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        {club.contactInfo.email && (
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={16} color={theme.colors.primary} />
            <Text style={styles.contactText}>{club.contactInfo.email}</Text>
          </View>
        )}
        
        {club.contactInfo.phone && (
          <View style={styles.contactItem}>
            <Ionicons name="call" size={16} color={theme.colors.primary} />
            <Text style={styles.contactText}>{club.contactInfo.phone}</Text>
          </View>
        )}
        
        {club.contactInfo.website && (
          <View style={styles.contactItem}>
            <Ionicons name="globe" size={16} color={theme.colors.primary} />
            <Text style={styles.contactText}>{club.contactInfo.website}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Members ({club.members.length})
        </Text>
        
        {club.members.map((member) => (
          <View key={member.userId} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <View style={styles.memberPhoto}>
                {member.userPhoto ? (
                  <Image source={{ uri: member.userPhoto }} style={styles.memberImage} />
                ) : (
                  <View style={[styles.memberImagePlaceholder, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                    <Ionicons name="person" size={24} color={getRoleColor(member.role)} />
                  </View>
                )}
              </View>
              
              <View style={styles.memberDetails}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>{member.userName}</Text>
                  <View style={styles.memberBadges}>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(member.role) + '20' }
                    ]}>
                      <Ionicons 
                        name={getRoleIcon(member.role) as any} 
                        size={12} 
                        color={getRoleColor(member.role)} 
                      />
                      <Text style={[
                        styles.roleText,
                        { color: getRoleColor(member.role) }
                      ]}>
                        {member.role}
                      </Text>
                    </View>
                    
                    {member.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
                      </View>
                    )}
                  </View>
                </View>
                
                <Text style={styles.memberStats}>
                  Joined {formatDate(member.joinedAt)} • {member.totalEvents} events • {member.totalGames} games
                </Text>
              </View>
            </View>
            
            {canManage && member.userId !== user?.id && (
              <TouchableOpacity
                style={styles.memberOptions}
                onPress={() => setShowMemberOptions(showMemberOptions === member.userId ? null : member.userId)}
              >
                <Ionicons name="ellipsis-vertical" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
            
            {/* Member Options Menu */}
            {showMemberOptions === member.userId && canManage && (
              <View style={styles.optionsMenu}>
                {member.role !== 'OWNER' && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMemberAction(member, 'remove')}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                    <Text style={[styles.optionText, { color: theme.colors.error }]}>Remove</Text>
                  </TouchableOpacity>
                )}
                
                {member.role === 'MEMBER' && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMemberAction(member, 'promote')}
                  >
                    <Ionicons name="arrow-up" size={16} color={theme.colors.success} />
                    <Text style={[styles.optionText, { color: theme.colors.success }]}>Promote to Organizer</Text>
                  </TouchableOpacity>
                )}
                
                {member.role === 'ORGANIZER' && (
                  <>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleMemberAction(member, 'promote')}
                    >
                      <Ionicons name="arrow-up" size={16} color={theme.colors.success} />
                      <Text style={[styles.optionText, { color: theme.colors.success }]}>Promote to Admin</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleMemberAction(member, 'demote')}
                    >
                      <Ionicons name="arrow-down" size={16} color={theme.colors.warning} />
                      <Text style={[styles.optionText, { color: theme.colors.warning }]}>Demote to Member</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {member.role === 'ADMIN' && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMemberAction(member, 'demote')}
                  >
                    <Ionicons name="arrow-down" size={16} color={theme.colors.warning} />
                    <Text style={[styles.optionText, { color: theme.colors.warning }]}>Demote to Organizer</Text>
                  </TouchableOpacity>
                )}
                
                {!member.isVerified && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMemberAction(member, 'verify')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={[styles.optionText, { color: theme.colors.success }]}>Verify Member</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.eventsHeader}>
          <Text style={styles.sectionTitle}>
            Events ({club.events.length})
          </Text>
          
          {canCreateEvents && (
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => navigation.navigate('CreateClubEvent', { clubId: club.id })}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.createEventText}>Create Event</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {club.events.length === 0 ? (
          <View style={styles.emptyEvents}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyEventsTitle}>No events yet</Text>
            <Text style={styles.emptyEventsText}>
              {canCreateEvents 
                ? 'Create the first event for your club!'
                : 'Check back later for upcoming events.'
              }
            </Text>
          </View>
        ) : (
          club.events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventType}>
                  <Ionicons 
                    name={event.type === 'TOURNAMENT' ? 'trophy' : 'calendar'} 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.eventTypeText}>{event.type.replace('_', ' ')}</Text>
                </View>
                
                <Text style={styles.eventDate}>
                  {formatDate(event.startDate)}
                </Text>
              </View>
              
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.eventDetailText}>
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </Text>
                </View>
                
                <View style={styles.eventDetail}>
                  <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.eventDetailText}>
                    {event.location.name}
                  </Text>
                </View>
                
                <View style={styles.eventDetail}>
                  <Ionicons name="people" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.eventDetailText}>
                    {event.currentParticipants}/{event.maxParticipants} participants
                  </Text>
                </View>
              </View>
              
              {user && (
                <TouchableOpacity
                  style={[
                    styles.eventActionButton,
                    event.participants.includes(user.id) && styles.eventActionButtonActive
                  ]}
                  onPress={() => handleJoinEvent(event.id)}
                >
                  <Text style={[
                    styles.eventActionText,
                    event.participants.includes(user.id) && styles.eventActionTextActive
                  ]}>
                    {event.participants.includes(user.id) ? 'Leave Event' : 'Join Event'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Cover Photo */}
      <View style={styles.header}>
        {club.coverPhoto ? (
          <Image source={{ uri: club.coverPhoto }} style={styles.coverPhoto} />
        ) : (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.coverGradient}
          />
        )}
        
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.clubLogoContainer}>
              {club.logo ? (
                <Image source={{ uri: club.logo }} style={styles.clubLogo} />
              ) : (
                <View style={[styles.clubLogoPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="business" size={32} color={theme.colors.primary} />
                </View>
              )}
            </View>
            
            <View style={styles.clubHeaderInfo}>
              <View style={styles.clubTitleRow}>
                <Text style={styles.clubName}>{club.name}</Text>
                {club.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  </View>
                )}
              </View>
              
              <Text style={styles.clubCategory}>
                {club.category.replace('_', ' ')} • {club.location.city}
              </Text>
              
              <Text style={styles.clubMembership}>
                {club.membershipType} • {club.currentMembers} members
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'overview' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'overview' && styles.tabTextActive
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'members' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'members' && styles.tabTextActive
          ]}>
            Members
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'events' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'events' && styles.tabTextActive
          ]}>
            Events
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'events' && renderEventsTab()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('ClubChat', { clubId: club.id })}
        >
          <Ionicons name="chatbubble" size={20} color="white" />
          <Text style={styles.chatButtonText}>Club Chat</Text>
        </TouchableOpacity>
        
        {canManage && (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate('ClubManagement', { clubId: club.id })}
          >
            <Ionicons name="settings" size={20} color={theme.colors.primary} />
            <Text style={[styles.manageButtonText, { color: theme.colors.primary }]}>Manage</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  clubLogoContainer: {
    marginRight: 16,
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  clubLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubHeaderInfo: {
    flex: 1,
  },
  clubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  clubCategory: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  clubMembership: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  ruleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  achievementText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  memberCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPhoto: {
    marginRight: theme.spacing.md,
  },
  memberImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '500',
  },

  memberStats: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  memberOptions: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  optionsMenu: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    minWidth: 150,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  createEventButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  createEventText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyEvents: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyEventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyEventsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  eventDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  eventActionButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  eventActionButtonActive: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  eventActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  eventActionTextActive: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  chatButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 16,
    gap: theme.spacing.sm,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  manageButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default ClubDetailsScreen;
