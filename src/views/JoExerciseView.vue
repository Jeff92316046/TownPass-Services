<template>
  <div class="flex flex-col h-screen">
    <FixedTitleSection
      title="Jo Excercise"
      class="bg-primary-400 text-white text-lg font-semibold py-2"
    />
    <div class="flex-1 bg-gray-50 mt-12">
      <div class="banner">
        <img
          :src="currentTab === 'find' ? joBanner : joBanner2"
          alt="Jo Exercise Banner"
          class="w-full h-[200px] object-cover"
        />
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="currentTab === 'find'" key="find" class="overflow-y-auto px-4 pb-20">
          <div
            v-for="(channel, index) in chatChannelList"
            :key="`find-${index}`"
            class="activity-card mb-4 p-4"
          >
            <!-- ErEr TODO -->
          </div>
        </div>

        <div v-else key="joined" class="overflow-y-auto px-4 pb-20">
          <div
            v-for="(channel, index) in chatChannelList"
            :key="`joined-${index}`"
            class="activity-card mb-4 p-4 flex flex-row justify-between items-center"
          >
            <div class="flex flex-col">
              <div class="font-semibold">{{ channel.name || 'Unnamed Channel' }}</div>
              <div class="text-sm text-gray-600 mt-3">
                運動種類: {{ channel.activityInfo.sportName }}<br />
                地點: {{ channel.activityInfo.place }}<br />
                時間: {{ handleTimestamp(channel.activityInfo.startTime) }} -
                {{ handleTimestamp(channel.activityInfo.endTime) }}
              </div>
            </div>
            <img :src="ChatIcon" alt="Chat Icon" class="w-20 h-20 cursor-pointer" />
          </div>
        </div>
      </transition>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 shadow-md flex justify-around bg-white">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="[currentTab === tab.value ? 'current-button' : 'other-button']"
        @click="handleSwitchTab(tab.value as 'find' | 'joined')"
      >
        <img
          :src="currentTab === tab.value ? tab.iconActive : tab.icon"
          class="w-6 h-6 transition-transform duration-300"
          :class="{ 'scale-110 text-primary-500': currentTab === tab.value }"
        />
        <span
          class="text-xs mt-1 font-medium transition-colors duration-200"
          :class="currentTab === tab.value ? 'text-white' : 'text-gray-500'"
        >
          {{ tab.label }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import FixedTitleSection from '@/components/molecules/FixedTitleSection.vue';
import { ref } from 'vue';
import searchIconDark from '../assets/images/search-icon-dark.svg';
import searchIcon from '../assets/images/search-icon.svg';
import calendarIcon from '../assets/images/calendar-icon.svg';
import calendarIconWhite from '../assets/images/calendar-white-icon.svg';
import joBanner from '../assets/images/jo-banner.png';
import joBanner2 from '../assets/images/jo-banner2.png';
import ChatIcon from '../assets/images/tp_icon_1999.svg';

const tabs = [
  {
    label: '尋找活動',
    value: 'find',
    icon: searchIconDark,
    iconActive: searchIcon
  },
  {
    label: '已參加活動',
    value: 'joined',
    icon: calendarIcon,
    iconActive: calendarIconWhite
  }
];

interface ChatChannelInfo {
  id: number;
  channelId: string;
  name?: string; // hash name
  activityInfo: {
    sportName: string;
    place: string;
    startTime: string;
    endTime: string;
  };
}

const chatChannelList = ref<ChatChannelInfo[]>([
  {
    id: 1,
    channelId: 'channel_001',
    name: 'Morning Joggers',
    activityInfo: {
      sportName: 'jogging',
      place: 'Central Park',
      startTime: '2024-06-01T06:00:00Z',
      endTime: '2024-06-01T07:00:00Z'
    }
  },
  {
    id: 2,
    channelId: 'channel_002',
    name: 'Evening Walkers',
    activityInfo: {
      sportName: 'walking',
      place: 'Riverside',
      startTime: '2024-06-01T18:00:00Z',
      endTime: '2024-06-01T19:00:00Z'
    }
  },
  {
    id: 3,
    channelId: 'channel_003',
    name: 'Yoga Enthusiasts',
    activityInfo: {
      sportName: 'Yoga',
      place: 'Beachside',
      startTime: '2024-06-01T17:00:00Z',
      endTime: '2024-06-01T18:00:00Z'
    }
  },
  {
    id: 4,
    channelId: 'channel_004',
    name: 'Cycling Group',
    activityInfo: {
      sportName: 'cycling',
      place: 'Downtown',
      startTime: '2024-06-01T08:00:00Z',
      endTime: '2024-06-01T10:00:00Z'
    }
  }
]);

const currentTab = ref<'find' | 'joined'>('find');

const handleSwitchTab = (tab: 'find' | 'joined') => {
  currentTab.value = tab;
};

const handleTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style lang="postcss" scoped>
.current-button {
  @apply flex flex-1 py-3 text-center font-semibold text-white bg-primary-400 transition-all duration-200 items-center justify-center flex-col;
}

.other-button {
  @apply flex flex-1 py-3 text-center text-gray-500 hover:text-primary-400 transition-all duration-200 items-center justify-center flex-col;
}

.activity-card {
  @apply bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:scale-[1.01];
  @apply cursor-pointer;
}

.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}
.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.banner {
  @apply relative w-full h-[200px] overflow-hidden mb-4;
}
</style>
