<template>
  <div class="flex flex-col h-screen">
    <FixedTitleSection
      title="Jo Excercise"
      class="bg-primary-400 text-white text-lg font-semibold py-2"
    />
    <div class="flex-1 bg-gray-50 mt-12">
      <div class="banner" v-if="currentTab !== 'find'">
        <img :src="joBanner2" alt="Jo Exercise Banner" class="w-full h-[200px] object-cover" />
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="currentTab === 'find'" key="find" class="overflow-y-auto px-4 pb-20">
          <!-- 🔍 搜尋區塊 -->
          <div class="bg-white rounded-2xl p-4 shadow mb-6 mt-4">
            <h2 class="font-bold text-lg mb-3">查詢活動</h2>

            <!-- 橫向搜尋列 -->
            <div class="flex flex-wrap items-end gap-3">
              <!-- 運動種類 -->
              <div class="flex-1 min-w-[140px]">
                <label class="block text-sm text-gray-700 mb-1">運動種類</label>
                <select
                  v-model="selectedSport"
                  @change="handleSportChange"
                  class="w-full border rounded-lg p-2"
                >
                  <option value="">全部</option>
                  <option v-for="sport in sportList" :key="sport" :value="sport">
                    {{ sport }}
                  </option>
                </select>
              </div>

              <!-- 地點 -->
              <div class="flex-1 min-w-[140px]">
                <label class="block text-sm text-gray-700 mb-1">地點</label>
                <select
                  v-model="selectedPlace"
                  @change="handlePlaceChange"
                  class="w-full border rounded-lg p-2"
                >
                  <option value="">全部</option>
                  <option value="nearby">最近的場所</option>
                  <option v-for="place in placeList" :key="place" :value="place">
                    {{ place }}
                  </option>
                </select>
              </div>

              <!-- 時間 -->
              <div class="flex-1 min-w-[160px]">
                <label class="block text-sm text-gray-700 mb-1">開始時間之後</label>
                <input
                  type="datetime-local"
                  v-model="selectedTime"
                  class="w-full border rounded-lg p-2"
                />
              </div>

              <!-- 查詢 icon 按鈕 -->
              <button class="search-button" @click="searchRecords">
              <img src="@/assets/images/search-icon.svg" alt="搜尋" />
            </button>
            </div>
          </div>

          <!-- 📋 查詢結果 -->
          <div v-if="records.length">
            <div
              v-for="(record, index) in records"
              :key="`find-${index}`"
              class="activity-card mb-4 p-4 bg-white rounded-2xl shadow"
            >
              <div class="font-semibold">{{ record.sport }}</div>
              <div class="text-sm text-gray-600 mt-3">
                運動種類: {{ record.sport }}<br />
                地點: {{ record.place }}<br />
                時間: {{ handleTimestamp(record.start_time) }} -
                {{ handleTimestamp(record.end_time) }}
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500">尚無資料</div>
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
const sportToPlaces: Record<string, string[]> = {
  籃球: ['大安運動中心', '中正紀念堂'],
  羽球: ['內湖體育館', '中正紀念堂'],
  足球: ['信義運動場', '大安運動中心'],
  網球: ['內湖體育館']
};

const placeToSports: Record<string, string[]> = {
  大安運動中心: ['籃球', '足球'],
  內湖體育館: ['羽球', '網球'],
  中正紀念堂: ['籃球', '羽球'],
  信義運動場: ['足球']
};

// 靜態資料
const allSports = Object.keys(sportToPlaces);
const allPlaces = Object.keys(placeToSports);

// 綁定狀態
const selectedSport = ref('');
const selectedPlace = ref('');
const selectedTime = ref(''); // 時間篩選
const sportList = ref([...allSports]);
const placeList = ref([...allPlaces]);
const records = ref<any[]>([]);

// 地點與運動交叉過濾
const handleSportChange = () => {
  if (!selectedSport.value) {
    placeList.value = [...allPlaces];
    return;
  }
  placeList.value = sportToPlaces[selectedSport.value] || [];
};

const handlePlaceChange = () => {
  if (selectedPlace.value === 'nearby') {
    // 模擬最近地點
    selectedPlace.value = '大安運動中心';
  }
  if (!selectedPlace.value) {
    sportList.value = [...allSports];
    return;
  }
  sportList.value = placeToSports[selectedPlace.value] || [];
};

// 🔍 搜尋
const searchRecords = () => {
  const allRecords = [
    {
      place: '大安運動中心',
      sport: '籃球',
      start_time: '2025-11-08T10:00',
      end_time: '2025-11-08T12:00'
    },
    {
      place: '內湖體育館',
      sport: '羽球',
      start_time: '2025-11-09T14:00',
      end_time: '2025-11-09T16:00'
    },
    {
      place: '信義運動場',
      sport: '足球',
      start_time: '2025-11-10T09:00',
      end_time: '2025-11-10T11:00'
    }
  ];

  records.value = allRecords.filter((record) => {
    const matchSport = !selectedSport.value || record.sport === selectedSport.value;
    const matchPlace = !selectedPlace.value || record.place === selectedPlace.value;
    const matchTime =
      !selectedTime.value || new Date(record.start_time) >= new Date(selectedTime.value);
    return matchSport && matchPlace && matchTime;
  });
};
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
