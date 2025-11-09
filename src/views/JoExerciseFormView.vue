<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <FixedTitleSection
      title="發起活動"
      class="bg-primary-400 text-white text-lg font-semibold py-2"
    />
    <form class="flex-1 overflow-auto p-4 space-y-4 flex flex-col mt-12">
      <label class="font-semibold">運動種類</label>
      <BaseSelect
        v-model="sportType"
        :options="sportOptions"
        selectId="sportType"
        defaultSelected="請選擇運動種類"
      />
      <div v-if="sportType !== ''" class="flex flex-col gap-4">
        <label class="font-semibold">場地訊息</label>
        <BaseSelect
          v-model="selectedLocation"
          required
          :trigger-validate="triggerValidate"
          :options="locationOptions"
          selectId="selectedLocation"
          defaultSelected="請選擇場地訊息"
        />
        <label class="font-semibold">活動人數</label>
        <BaseSelect
          v-model="participants"
          required
          :trigger-validate="triggerValidate"
          placeholder="請選擇人數"
          :options="participantsOptions"
          selectId="participants"
          defaultSelected="請選擇人數"
        />
        <label class="font-semibold">活動日期與時間</label>
        <DatePicker
          v-model="activityDate"
          required
          :trigger-validate="triggerValidate"
          placeholder="請選擇活動日期"
        />
        <div v-if="isDateEarlyThanToday()" class="text-red-500 text-sm">活動日期不可早於今日</div>
        <div class="flex gap-4">
          <BaseSelect
            v-model="startTime"
            class="flex-1"
            required
            :trigger-validate="triggerValidate"
            :options="timeOptions"
            selectId="startTime"
            default-selected="請選擇開始時間"
          />
          <BaseSelect
            v-model="endTime"
            class="flex-1"
            required
            :trigger-validate="triggerValidate"
            :options="timeOptions"
            selectId="endTime"
            default-selected="請選擇結束時間"
          />
        </div>
        <div v-if="isStartTimeLaterThanEndTime()" class="text-red-500 text-sm">
          結束時間必須晚於開始時間
        </div>
        <div v-if="isStartTimeEarlierThanCurrentTime()" class="text-red-500 text-sm">
          開始時間不可早於目前時間
        </div>
        <BaseButton
          type="button"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2"
          @click="handleSubmit"
        >
          確認
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseSelect from '@/components/atoms/BaseSelect.vue';
import DatePicker from '@/components/molecules/DatePicker.vue';
import FixedTitleSection from '@/components/molecules/FixedTitleSection.vue';
import getSportList from '../api/getSportList';
import postRecord from '../api/postRecord';
import getPlaceList from '@/api/getPlaceList';
import { useRouter } from 'vue-router';

const router = useRouter();

const triggerValidate = ref(false);

const sportType = ref('');
const selectedLocation = ref<string>('');
const participants = ref<string>('');

const now = new Date();
const pad = (n: number) => n.toString().padStart(2, '0');
const localStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
  now.getHours()
)}:${pad(now.getMinutes())}`;

const activityDate = ref(localStr.split('T')[0]);
const startTime = ref(localStr.split('T')[1]);
const endTime = ref(localStr.split('T')[1]);

const sportOptions = ref<Array<{ label: string; value: string }>>([]);

const locationOptions = ref<Array<{ label: string; value: string }>>([
  { label: 'Taipei Arena', value: '1' },
  { label: 'Daan Forest Park', value: '2' },
  { label: 'Xinyi Sports Center', value: '3' },
  { label: 'Riverside Park', value: '4' }
]);

const participantsOptions = ref<Array<{ label: string; value: string }>>(
  Array.from({ length: 11 }, (_, i) => ({
    label: (i + 2).toString(),
    value: (i + 2).toString()
  }))
);

const timeOptions = Array.from({ length: 17 }, (_, i) => {
  const hour = (6 + i).toString().padStart(2, '0');
  return { label: `${hour}:00`, value: `${hour}:00` };
});

const isStartTimeLaterThanEndTime = () => {
  if (startTime.value && endTime.value) {
    return startTime.value >= endTime.value;
  }
  return false;
};

const isDateEarlyThanToday = () => {
  const today = new Date().getDate();
  const date = new Date(activityDate.value).getDate();
  return date < today;
};

const isStartTimeEarlierThanCurrentTime = () => {
  const now = new Date();
  const [startHour, startMinute] = startTime.value.split(':').map(Number);
  const activityDateTime = new Date(activityDate.value);
  activityDateTime.setHours(startHour, startMinute, 0, 0);
  return activityDateTime < now;
};

watch(sportType, async (newSportType) => {
  if (newSportType !== '') {
    const response = (await getPlaceList({ sport: newSportType })) as {
      places: Array<{
        place_id: string;
        name: string;
      }>;
    };
    console.log('Fetched place list for sport type:', newSportType, response);
    locationOptions.value = response.places.map((place) => {
      console.log('Processing place:', place);
      return {
        label: place.name,
        value: place.place_id
      };
    });
    console.log('Updated location options:', locationOptions.value);
    selectedLocation.value = '';
  }
});

watch(selectedLocation, (newLocation, oldLocation) => {
  console.log('Selected Location changed:', oldLocation);
  console.log('New Location value:', newLocation);
});

const handleSubmit = async () => {
  triggerValidate.value = true;
  console.log('Submitting with values:', {
    sportType: sportType.value,
    location: selectedLocation.value,
    participants: participants.value,
    activityDate: activityDate.value,
    startTime: startTime.value,
    endTime: endTime.value
  });

  if (
    sportType.value &&
    selectedLocation.value &&
    participants.value &&
    activityDate.value &&
    startTime.value &&
    endTime.value
  ) {
    if (isStartTimeLaterThanEndTime()) {
      alert('結束時間必須晚於開始時間');
      return;
    } else if (isDateEarlyThanToday()) {
      alert('活動日期不可早於今日');
      return;
    } else if (isStartTimeEarlierThanCurrentTime()) {
      alert('開始時間不可早於目前時間');
      return;
    }
    try {
      await postRecord({
        user_id: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250',
        place_id: selectedLocation.value,
        sport: sportType.value,
        start_time: `${activityDate.value}T${startTime.value}:00`,
        end_time: `${activityDate.value}T${endTime.value}:00`,
        capacity: parseInt(participants.value)
      })
        .then((response) => {
          console.log('Record posted successfully:', response);
        })
        .catch((error) => {
          console.error('Error posting record:', error);
        });
    } catch (error) {
      console.error('Unexpected error posting record:', error);
    }
  }
  activityDate.value = localStr.split('T')[0];
  router.push('/jo-exercise');
};

onMounted(async () => {
  try {
    const response = await getSportList();
    console.log('Fetched sport list:', response);
    const sportList = response.sports;
    console.log('Processed sport list:', sportList);
    sportOptions.value = sportList.map((sport) => ({
      label: sport,
      value: sport
    }));
  } catch (error) {
    console.error('Error fetching sport list:', error);
  }
});
</script>
