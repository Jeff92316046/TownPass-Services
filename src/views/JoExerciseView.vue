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
              <div class="font-semibold">{{ record.records.sport }}</div>
              <div class="text-sm text-gray-600 mt-3 flex flex-col">
                運動種類: {{ record.records.sport }}<br />
                地點: {{ record.records.place }}<br />
                時間: {{ handleTimestamp(record.records.startTime) }} -
                {{ handleTimestamp(record.records.endTime) }}
                <button
                  v-if="
                    chatChannelList.every(
                      (channel) => channel.records.recordId !== record.records.recordId
                    )
                  "
                  class="text-red-500 text-sm w-fit mt-2"
                  @click="
                    // TODO: stop event propagation
                    () => {
                      handlePostJoinRecord(record.records.recordId);
                    }
                  "
                >
                  加入活動
                </button>
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
                  query: { channelID: channel.records.recordId }
                });
              }
            "
          >
            <div class="flex flex-col">
              <div class="font-semibold">
                {{
                  new Date(channel.records.startTime).getDate() + channel.records.place.name ||
                  'Unnamed Channel'
                }}
              </div>
              <div class="text-sm text-gray-600 mt-3 flex flex-col">
                運動種類: {{ channel.records.sport }}<br />
                地點: {{ channel.records.place.name }}<br />
                時間: {{ handleTimestamp(channel.records.startTime) }} -
                {{ handleTimestamp(channel.records.endTime) }}
                <div>
                  <button
                    class="text-red-500 text-sm w-fit mt-2"
                    @click="
                      async () => {
                        const params = {
                          userId: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250',
                          recordId: channel.records.recordId
                        };
                        await deleteJoinRecord(params);
                      }
                    "
                  >
                    退出
                  </button>
                  <button
                    v-if="channel.records.organizerId === '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250'"
                    class="text-white bg-primary-700 text-sm w-fit mt-2"
                    @click="
                      async () => {
                        const params = {
                          recordId: channel.records.recordId
                        };
                        await deleteRecord(params);
                      }
                    "
                  >
                    解散
                  </button>
                </div>
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
import getUserRecord from '../api/getUserRecord';
import postJoinRecord from '../api/postJoinRecord';
import deleteJoinRecord from '../api/deleteJoinRecord';
import deleteRecord from '../api/deleteRecord';

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

interface RecordInfo {
  records: {
    recordId: string;
    place: {
      placeId: number;
      name: string;
    };
    sport: string;
    startTime: string;
    endTime: string;
    capacity: number;
    status: string;
    organizerId: string;
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
const AllRecords = ref<RecordInfo[]>([]);

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
const records = ref<RecordInfo[]>([]);

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
  const allRecords = AllRecords.value;
  const recordInfos = allRecords;

  records.value = recordInfos.filter((r) => {
    const matchSport = !selectedSport.value || r.records.sport === selectedSport.value;
    const matchPlace = !selectedPlace.value || r.records.place.name === selectedPlace.value;
    const matchTime =
      !selectedTime.value || new Date(r.records.startTime) >= new Date(selectedTime.value);
    return matchSport && matchPlace && matchTime;
  });
};

const chatChannelList = ref<RecordInfo[]>([]);

const currentTab = ref<'find' | 'joined'>('find');

const handleSwitchTab = async (tab: 'find' | 'joined') => {
  currentTab.value = tab;
  if (tab === 'joined') {
    // normalize various response shapes from getUserRecord to an array of RecordInfo
    const params = {
      userId: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250'
    };
    const res = (await getUserRecord(params)) as any;
    if (Array.isArray(res)) {
      chatChannelList.value = res;
    } else if (res && Array.isArray(res.records)) {
      chatChannelList.value = res.records;
    } else {
      chatChannelList.value = res ? [res] : [];
    }
  }
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

const handlePostJoinRecord = async (recordId: string) => {
  try {
    await postJoinRecord({
      userId: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250',
      recordId: recordId
    });
    console.log('Successfully joined record:', recordId);
    const res = (await getUserRecord({
      userId: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250'
    })) as any;
    if (Array.isArray(res)) {
      chatChannelList.value = res;
    } else if (res && Array.isArray(res.records)) {
      chatChannelList.value = res.records;
    } else {
      chatChannelList.value = res ? [res] : [];
    }
  } catch (error) {
    console.error('Error joining record:', error);
  }
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
