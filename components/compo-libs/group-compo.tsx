import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

 const GroupScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoined, setIsJoined] = useState(true);

  // Mock data
  const groupData = {
    id: 'group123',
    name: 'UX/UI Design Collective',
    description: 'A community of passionate designers sharing ideas, resources, and job opportunities.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    logo: 'https://via.placeholder.com/100/4A90E2/FFFFFF?text=UX',
    category: 'Design & Creative',
    memberCount: 3842,
    postCount: 753,
    isPrivate: false,
    createdDate: '2021-05-12',
    admins: [
      {
        id: 'user1',
        name: 'Emma Wilson',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        role: 'Founder & Admin',
        company: 'Design Works',
      },
      {
        id: 'user2',
        name: 'Marcus Chen',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        role: 'Admin',
        company: 'Pixel Perfect',
      },
    ],
    members: [
      {
        id: 'user3',
        name: 'Sofia Rodriguez',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        role: 'UX Researcher',
        company: 'InnovateTech',
      },
      {
        id: 'user4',
        name: 'James Peterson',
        avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
        role: 'Product Designer',
        company: 'Designify',
      },
      {
        id: 'user5',
        name: 'Aisha Khan',
        avatar: 'https://randomuser.me/api/portraits/women/75.jpg',
        role: 'UI Designer',
        company: 'CreativeHub',
      },
      {
        id: 'user6',
        name: 'David Nguyen',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        role: 'Design Director',
        company: 'Artistry Inc',
      },
    ],
    posts: [
      {
        id: 'post1',
        user: {
          id: 'user3',
          name: 'Sofia Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        },
        content: 'Just published a case study on our UX research process for the new health app. Would love your thoughts and feedback! #UXResearch #HealthcareUX',
        images: ['https://via.placeholder.com/500/F0F0F0/333?text=Research+Process'],
        date: '2 hours ago',
        likes: 48,
        comments: 12,
      },
      {
        id: 'post2',
        user: {
          id: 'user1',
          name: 'Emma Wilson',
          avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        },
        content: 'We\'re hosting a virtual workshop next Friday on "Designing Accessible Interfaces". Free for all group members! Register via the link in comments. #Accessibility #UIDesign',
        images: [],
        date: '5 hours ago',
        likes: 72,
        comments: 23,
      },
      {
        id: 'post3',
        user: {
          id: 'user4',
          name: 'James Peterson',
          avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
        },
        content: 'Check out this new design system I\'ve been working on. I\'ve put special attention to color variables and component states.',
        images: [
          'https://via.placeholder.com/500/4A90E2/FFFFFF?text=Design+System+1',
          'https://via.placeholder.com/500/4A90E2/FFFFFF?text=Design+System+2',
        ],
        date: '8 hours ago',
        likes: 96,
        comments: 34,
      },
    ],
    events: [
      {
        id: 'event1',
        title: 'UX Research Fundamentals',
        date: 'May 25, 2023',
        time: '10:00 AM - 12:00 PM',
        location: 'Virtual (Zoom)',
        attendees: 126,
        image: 'https://via.placeholder.com/200/50C878/FFFFFF?text=Workshop',
      },
      {
        id: 'event2',
        title: 'Design Portfolio Review Session',
        date: 'June 3, 2023',
        time: '2:00 PM - 5:00 PM',
        location: 'Design Hub, San Francisco',
        attendees: 48,
        image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Review',
      },
    ],
    resources: [
      {
        id: 'resource1',
        title: 'Ultimate UI Components Library',
        type: 'Figma File',
        downloads: 1287,
        icon: 'file-figma',
      },
      {
        id: 'resource2',
        title: 'Accessibility Checklist for Designers',
        type: 'PDF Document',
        downloads: 876,
        icon: 'file-pdf-box',
      },
      {
        id: 'resource3',
        title: 'User Research Templates',
        type: 'ZIP Archive',
        downloads: 643,
        icon: 'file-archive',
      },
    ],
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {!showSearch ? (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{groupData.name}</Text>
            <View style={styles.headerPrivacyLabel}>
              <Ionicons
                name={groupData.isPrivate ? 'lock-closed' : 'globe-outline'}
                size={12}
                color="#666"
              />
              <Text style={styles.headerPrivacyText}>
                {groupData.isPrivate ? 'Private group' : 'Public group'}
              </Text>
            </View>
          </View>
        ) : (
          <TextInput
            style={styles.searchInput}
            placeholder="Search in group..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            onBlur={() => {
              if (!searchQuery) setShowSearch(false);
            }}
          />
        )}
        <View style={styles.headerActions}>
          {!showSearch && (
            <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.iconButton}>
              <Ionicons name="search" size={22} color="#333" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="more-vert" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCoverSection = () => (
    <View style={styles.coverSection}>
      <Image source={{ uri: groupData.coverImage }} style={styles.coverImage} />
      <View style={styles.logoContainer}>
        <Image source={{ uri: groupData.logo }} style={styles.groupLogo} />
      </View>
      <View style={styles.groupInfoContainer}>
        <View style={styles.groupBasicInfo}>
          <Text style={styles.groupName}>{groupData.name}</Text>
          <View style={styles.groupCategoryContainer}>
            <MaterialIcons name="category" size={14} color="#666" />
            <Text style={styles.groupCategory}>{groupData.category}</Text>
          </View>
        </View>
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{groupData.memberCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{groupData.postCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(groupData.createdDate).getFullYear()}
            </Text>
            <Text style={styles.statLabel}>Founded</Text>
          </View>
        </View>
        <Text style={styles.groupDescription}>{groupData.description}</Text>
        <View style={styles.groupActionButtons}>
          <TouchableOpacity
            style={[
              styles.mainActionButton,
              isJoined ? styles.joinedButton : styles.joinButton,
            ]}
            onPress={() => setIsJoined(!isJoined)}
          >
            <Ionicons
              name={isJoined ? 'checkmark-circle' : 'add-circle'}
              size={20}
              color={isJoined ? '#4A90E2' : '#fff'}
            />
            <Text
              style={[
                styles.mainActionButtonText,
                isJoined ? styles.joinedButtonText : styles.joinButtonText,
              ]}
            >
              {isJoined ? 'Joined' : 'Join Group'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionButton}>
            <Ionicons name="share-social-outline" size={20} color="#4A90E2" />
            <Text style={styles.secondaryActionButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionButton}>
            <Ionicons name="notifications-outline" size={20} color="#4A90E2" />
            <Text style={styles.secondaryActionButtonText}>Notify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabMenu = () => (
    <View style={styles.tabMenuContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'feed' && styles.activeTabButton]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="newspaper-outline"
            size={20}
            color={activeTab === 'feed' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'feed' && styles.activeTabButtonText,
            ]}
          >
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'members' && styles.activeTabButton]}
          onPress={() => setActiveTab('members')}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={activeTab === 'members' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'members' && styles.activeTabButtonText,
            ]}
          >
            Members
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'events' && styles.activeTabButton]}
          onPress={() => setActiveTab('events')}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={activeTab === 'events' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'events' && styles.activeTabButtonText,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'resources' && styles.activeTabButton]}
          onPress={() => setActiveTab('resources')}
        >
          <Ionicons
            name="folder-open-outline"
            size={20}
            color={activeTab === 'resources' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'resources' && styles.activeTabButtonText,
            ]}
          >
            Resources
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'about' && styles.activeTabButton]}
          onPress={() => setActiveTab('about')}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === 'about' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'about' && styles.activeTabButtonText,
            ]}
          >
            About
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderFeedTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.createPostContainer}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          style={styles.userAvatar}
        />
        <TouchableOpacity style={styles.postInputButton}>
          <Text style={styles.postInputPlaceholder}>Share something with the group...</Text>
        </TouchableOpacity>
      </View>

      {groupData.posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={styles.postUserAvatar} />
            <View style={styles.postHeaderInfo}>
              <Text style={styles.postUserName}>{post.user.name}</Text>
              <Text style={styles.postDate}>{post.date}</Text>
            </View>
            <TouchableOpacity style={styles.postMenuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.images && post.images.length > 0 && (
            <View style={styles.postImageContainer}>
              {post.images.length === 1 ? (
                <Image source={{ uri: post.images[0] }} style={styles.postSingleImage} />
              ) : (
                <View style={styles.postImagesGrid}>
                  {post.images.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.postGridImage} />
                  ))}
                </View>
              )}
            </View>
          )}
          <View style={styles.postStats}>
            <View style={styles.postLikes}>
              <Ionicons name="heart" size={14} color="#FF3B30" />
              <Text style={styles.postStatsText}>{post.likes}</Text>
            </View>
            <Text style={styles.postStatsText}>{post.comments} comments</Text>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postActionButton}>
              <Ionicons name="heart-outline" size={22} color="#666" />
              <Text style={styles.postActionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postActionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#666" />
              <Text style={styles.postActionText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postActionButton}>
              <Ionicons name="share-outline" size={22} color="#666" />
              <Text style={styles.postActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.membersSearchBox}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.membersSearchInput}
          placeholder="Search members..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.membersSection}>
        <View style={styles.membersSectionHeader}>
          <Text style={styles.membersSectionTitle}>Admins & Moderators</Text>
          <Text style={styles.memberCount}>{groupData.admins.length}</Text>
        </View>
        {groupData.admins.map((admin) => (
          <View key={admin.id} style={styles.memberItem}>
            <Image source={{ uri: admin.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{admin.name}</Text>
              <View style={styles.memberDetails}>
                <Text style={styles.memberRole}>{admin.role}</Text>
                <Text style={styles.memberCompany}>• {admin.company}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.memberActionButton}>
              <Feather name="message-square" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.membersSection}>
        <View style={styles.membersSectionHeader}>
          <Text style={styles.membersSectionTitle}>Members</Text>
          <Text style={styles.memberCount}>{groupData.memberCount}</Text>
        </View>
        {groupData.members.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <View style={styles.memberDetails}>
                <Text style={styles.memberRole}>{member.role}</Text>
                <Text style={styles.memberCompany}>• {member.company}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.memberActionButton}>
              <Feather name="user-plus" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllButtonText}>View all members</Text>
          <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.eventsHeader}>
        <Text style={styles.eventsHeaderTitle}>Upcoming Events</Text>
        <TouchableOpacity style={styles.createEventButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.createEventButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>

      {groupData.events.map((event) => (
        <View key={event.id} style={styles.eventCard}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetailItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{event.date}</Text>
              </View>
              <View style={styles.eventDetailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{event.time}</Text>
              </View>
              <View style={styles.eventDetailItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
            </View>
            <View style={styles.eventAttendees}>
              <View style={styles.eventAttendeesImages}>
                {/* Some mock attendee images */}
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                  style={[styles.eventAttendeeImage, { zIndex: 5 }]}
                />
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                  style={[styles.eventAttendeeImage, { marginLeft: -10, zIndex: 4 }]}
                />
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/22.jpg' }}
                  style={[styles.eventAttendeeImage, { marginLeft: -10, zIndex: 3 }]}
                />
              </View>
              <Text style={styles.eventAttendeesCount}>
                {event.attendees} going
              </Text>
            </View>
            <View style={styles.eventActions}>
              <TouchableOpacity style={styles.eventPrimaryButton}>
                <Text style={styles.eventPrimaryButtonText}>RSVP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.eventSecondaryButton}>
                <Text style={styles.eventSecondaryButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllButtonText}>View all events</Text>
        <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  );

  const renderResourcesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.resourcesHeader}>
        <Text style={styles.resourcesHeaderTitle}>Resources & Files</Text>
        <TouchableOpacity style={styles.uploadResourceButton}>
          <Ionicons name="cloud-upload-outline" size={16} color="#4A90E2" />
          <Text style={styles.uploadResourceButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {groupData.resources.map((resource) => (
        <View key={resource.id} style={styles.resourceItem}>
          <View style={styles.resourceIconContainer}>
            <MaterialCommunityIcons
              name={resource.icon}
              size={24}
              color="#4A90E2"
              style={styles.resourceIcon}
            />
          </View>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <View style={styles.resourceMeta}>
              <Text style={styles.resourceType}>{resource.type}</Text>
              <Text style={styles.resourceDot}>•</Text>
              <Text style={styles.resourceDownloads}>
                {resource.downloads} downloads
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.resourceDownloadButton}>
            <Ionicons name="download-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllButtonText}>View all resources</Text>
        <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.aboutSection}>
        <Text style={styles.aboutSectionTitle}>About This Group</Text>
        <Text style={styles.aboutDescription}>
          {groupData.description}
          {'\n\n'}
          Our mission is to create a collaborative space for designers to grow,
          share knowledge, and support each other in their professional journeys.
          Whether you're a seasoned designer or just starting out, this community
          is here to help you connect with peers, find resources, and stay updated
          on industry trends.
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.aboutSection}>
        <Text style={styles.aboutSectionTitle}>Group Rules</Text>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleNumber}>1.</Text>
          <Text style={styles.ruleText}>
            Be respectful and professional in all interactions
          </Text>
        </View>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleNumber}>2.</Text>
          <Text style={styles.ruleText}>
            No self-promotion or spam; share valuable content only
          </Text>
        </View>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleNumber}>3.</Text>
          <Text style={styles.ruleText}>
            Credit original sources when sharing others' work
          </Text>
        </View>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleNumber}>4.</Text>
          <Text style={styles.ruleText}>
            Constructive feedback only; be kind and helpful
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.aboutSection}>
        <Text style={styles.aboutSectionTitle}>Group Details</Text>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            Created on {new Date(groupData.createdDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name={groupData.isPrivate ? 'lock-closed-outline' : 'globe-outline'}
            size={18}
            color="#666"
          />
          <Text style={styles.detailText}>
            {groupData.isPrivate ? 'Private group' : 'Public group'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            {groupData.memberCount.toLocaleString()} members
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            {groupData.postCount.toLocaleString()} posts
          </Text>
        </View>
      </View>
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'feed':
        return renderFeedTab();
      case 'members':
        return renderMembersTab();
      case 'events':
        return renderEventsTab();
      case 'resources':
        return renderResourcesTab();
      case 'about':
        return renderAboutTab();
      default:
        return renderFeedTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <ScrollView style={styles.scrollContainer}>
        {renderCoverSection()}
        {renderTabMenu()}
        {renderActiveTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerPrivacyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerPrivacyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginLeft: 16,
    fontSize: 14,
  },
  coverSection: {
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  logoContainer: {
    position: 'absolute',
    top: 130,
    left: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  groupLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  groupInfoContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  groupBasicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  groupCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginTop: 16,
  },
  groupActionButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  joinButton: {
    backgroundColor: '#4A90E2',
  },
  joinedButton: {
    backgroundColor: '#E8F1FB',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  mainActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  joinButtonText: {
    color: '#fff',
  },
  joinedButtonText: {
    color: '#4A90E2',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  secondaryActionButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 6,
  },
  tabMenuContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4A90E2',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabButtonText: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  tabContent: {
    padding: 16,
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInputButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  postInputPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  postUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postMenuButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postImageContainer: {
    width: '100%',
  },
  postSingleImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    resizeMode: 'cover',
  },
  postImagesGrid: {
    flexDirection: 'row',
    width: '100%',
  },
  postGridImage: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  postActionText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  membersSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  membersSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  membersSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  memberDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberRole: {
    fontSize: 13,
    color: '#666',
  },
  memberCompany: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
  },
  memberActionButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
    marginRight: 4,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 6,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventAttendeesImages: {
    flexDirection: 'row',
    marginRight: 10,
  },
  eventAttendeeImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  eventAttendeesCount: {
    fontSize: 14,
    color: '#666',
  },
  eventActions: {
    flexDirection: 'row',
  },
  eventPrimaryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  eventPrimaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  eventSecondaryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  eventSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourcesHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  uploadResourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadResourceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
    marginLeft: 6,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E8F1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceIcon: {},
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceType: {
    fontSize: 13,
    color: '#666',
  },
  resourceDot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 6,
  },
  resourceDownloads: {
    fontSize: 13,
    color: '#999',
  },
  resourceDownloadButton: {
    padding: 8,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ruleNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    width: 24,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },})

  export default GroupScreen