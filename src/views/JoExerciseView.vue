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
        <div v-if="currentTab === 'find'" key="find" class="overflow-y-auto pb-16">
          <!-- 查詢 bar -->
          <div class="flex mt-1 mb-2 items-center w-full bg-gray-100 px-4">
            <button class="flex items-center gap-1 px-0 py-2" @click="openSearchDialog">
              <img
                :src="filterIconWhite"
                alt="Filter"
                class="w-6 h-6 mr-2 filter invert sepia saturate-200 hue-rotate-90"
              />
              篩選條件
            </button>
          </div>
          <MessageModal :isShow="isSearchDialogOpen">
            <template #header>查詢活動</template>

            <template #body>
              <div class="flex flex-col gap-3">
                <!-- 運動種類 -->
                <div class="flex flex-col justify-start text-start">
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
                <div class="flex flex-col justify-start text-start">
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
                <div class="flex flex-col justify-start text-start">
                  <label class="block text-sm text-gray-700 mb-1">開始時間</label>
                  <DatePicker
                    v-model="selectedTime"
                    class="w-full border rounded-lg p-2 bg-white"
                  />
                  <div
                    v-if="handleStartTimeEarlierThanCurrentTime()"
                    class="text-red-500 text-sm mt-1"
                  >
                    開始時間不可早於目前時間
                  </div>
                </div>
              </div>
            </template>

            <template #footer>
              <button
                class="bg-primary-400 text-white w-full h-full py-2 rounded-b-md font-semibold"
                @click="
                  () => {
                    searchRecords();
                    isSearchDialogOpen = false;
                  }
                "
              >
                確認
              </button>
            </template>
          </MessageModal>

          <!-- 📋 查詢結果 -->
          <div v-if="records.length" class="mt-4 px-4">
            <div class="text-center mb-2">共有 {{ records.length }} 筆符合條件的活動</div>
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
          <div
            v-else
            class="text-center text-gray-500 flex items-center justify-center transition-all mt-20"
          >
            <div class="flex flex-col items-center">
              <img
                :src="HistoryIcon"
                alt="No Data"
                class="w-40 h-40 mx-auto mb-2 filter grayscale opacity-50"
              />
              <div class="text-lg mt-4">目前沒有符合條件的活動！</div>
            </div>
          </div>
        </div>

        <div v-else key="joined" class="overflow-y-auto px-4 pb-20">
          <button
            v-for="(channel, index) in chatChannelList"
            :key="`joined-${index}`"
            class="activity-card mb-4 p-4 flex flex-row justify-between items-center text-left w-full"
            @click="
              () => {
                router.push({
                  name: 'instant-messaging',
                  query: { channelId: channel.channelId }
                });
              }
            "
          >
            <div class="flex flex-col">
              <div class="font-semibold">{{ channel.name || 'Unnamed Channel' }}</div>
              <div class="text-sm text-gray-600 mt-3 flex flex-col">
                運動種類: {{ channel.activityInfo.sportName }}<br />
                地點: {{ channel.activityInfo.place }}<br />
                時間: {{ handleTimestamp(channel.activityInfo.startTime) }} -
                {{ handleTimestamp(channel.activityInfo.endTime) }}
                <button
                  class="text-red-500 text-sm w-fit mt-2"
                  @click="
                    // TODO: stop event propagation
                    () => {
                      router.push({
                        name: 'instant-messaging',
                        query: { channelId: channel.channelId }
                      });
                    }
                  "
                >
                  退出
                </button>
              </div>
            </div>
            <img :src="ChatIcon" alt="Chat Icon" class="w-20 h-20 cursor-pointer" />
          </button>
        </div>
      </transition>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 shadow-md flex justify-around bg-white">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="[currentTab === tab.value ? 'current-button' : 'other-button']"
        @click="
          () => {
            if (tab.value === 'create' && tab.url) {
              router.push(tab.url);
            } else {
              handleSwitchTab(tab.value as 'find' | 'joined');
            }
          }
        "
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import searchIconDark from '../assets/images/search-icon-dark.svg';
import searchIcon from '../assets/images/search-icon.svg';
import calendarIcon from '../assets/images/calendar-icon.svg';
import calendarIconWhite from '../assets/images/calendar-white-icon.svg';
import joBanner2 from '../assets/images/jo-banner2.png';
import ChatIcon from '../assets/images/tp_icon_1999.svg';
import MessageModal from '@/components/molecules/MessageModal.vue';
import filterIconWhite from '../assets/images/icon-filter-white.svg';
import DatePicker from '@/components/molecules/DatePicker.vue';
import HistoryIcon from '../assets/images/icon-history.svg';
import AddIcon from '../assets/images/add-icon.svg';
import AddIconWhite from '../assets/images/add-icon-white.svg';
import getAllRecord from '../api/getAllRecord';

const router = useRouter();

const tabs = [
  {
    label: '發起活動',
    value: 'create',
    icon: AddIcon,
    iconActive: AddIconWhite,
    url: '/jo-exercise/form'
  },
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
const AllRecords = ref<any[]>([]);

const selectedSport = ref('');
const selectedPlace = ref('nearby');
const now = new Date();
const pad = (n: number) => n.toString().padStart(2, '0');
const localStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
  now.getHours()
)}:${pad(now.getMinutes())}`;

const selectedTime = ref(localStr);
const sportList = ref([...allSports]);
const placeList = ref([...allPlaces]);
const records = ref<
  Array<{
    place: string;
    sport: string;
    start_time: string;
    end_time: string;
  }>
>([]);

const handleStartTimeEarlierThanCurrentTime = () => {
  const selected = new Date(selectedTime.value).getDate();
  const currentTime = new Date().getDate();
  return selected < currentTime;
};

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
    },
    {
      place: '中正紀念堂',
      sport: '籃球',
      start_time: '2025-11-11T15:00',
      end_time: '2025-11-11T17:00'
    },
    {
      place: '內湖體育館',
      sport: '網球',
      start_time: '2025-11-12T13:00',
      end_time: '2025-11-12T15:00'
    },
    {
      place: '大安運動中心',
      sport: '足球',
      start_time: '2025-11-13T08:00',
      end_time: '2025-11-13T10:00'
    },
    {
      place: '中正紀念堂',
      sport: '羽球',
      start_time: '2025-11-14T17:00',
      end_time: '2025-11-14T19:00'
    },
    {
      place: '信義運動場',
      sport: '足球',
      start_time: '2025-11-15T11:00',
      end_time: '2025-11-15T13:00'
    },
    {
      place: '大安運動中心',
      sport: '籃球',
      start_time: '2025-11-16T16:00',
      end_time: '2025-11-16T18:00'
    },
    {
      place: '內湖體育館',
      sport: '網球',
      start_time: '2025-11-17T12:00',
      end_time: '2025-11-17T14:00'
    },
    {
      place: '中正紀念堂',
      sport: '羽球',
      start_time: '2025-11-18T09:00',
      end_time: '2025-11-18T11:00'
    },
    {
      place: '信義運動場',
      sport: '足球',
      start_time: '2025-11-19T14:00',
      end_time: '2025-11-19T16:00'
    },
    {
      place: '大安運動中心',
      sport: '籃球',
      start_time: '2025-11-20T10:00',
      end_time: '2025-11-20T12:00'
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

const isSearchDialogOpen = ref(false);
const openSearchDialog = () => {
  isSearchDialogOpen.value = true;
  console.log('Open search dialog');
};

const handleTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(async () => {
  handlePlaceChange();
  searchRecords();
  const params = {
    place: selectedPlace.value,
    sport: selectedSport.value,
    startTime: selectedTime.value
  };
  const res = (await getAllRecord(params)) as any;
  if (Array.isArray(res)) {
    AllRecords.value = res;
  } else if (res && Array.isArray(res.records)) {
    AllRecords.value = res.records;
  } else {
    AllRecords.value = res ? [res] : [];
  }
});
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
