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
          v-model="location as string"
          required
          :trigger-validate="triggerValidate"
          :options="locationOptions"
          selectId="location"
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
import { onMounted, ref } from 'vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseSelect from '@/components/atoms/BaseSelect.vue';
import DatePicker from '@/components/molecules/DatePicker.vue';
import FixedTitleSection from '@/components/molecules/FixedTitleSection.vue';
import getSportList from '../api/getSportList';
import postRecord from '../api/postRecord';

const triggerValidate = ref(false);

const sportType = ref('');
const location = ref<string>('');
const participants = ref<string>('');
const activityDate = ref(new Date().toISOString().split('T')[0]);
const startTime = ref('');
const endTime = ref('');

const sportOptions = ref<Array<{ label: string; value: string }>>([]);

const locationOptions = ref<Array<{ label: string; value: string }>>([
  { label: 'Taipei Arena', value: '1' },
  { label: 'Daan Forest Park', value: '2' },
  { label: 'Xinyi Sports Center', value: '3' },
  { label: 'Riverside Park', value: '4' }
]);

const participantsOptions = ref<Array<{ label: string; value: string }>>(
  Array.from({ length: 20 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString()
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

const handleSubmit = () => {
  triggerValidate.value = true;

  if (
    sportType.value &&
    location.value &&
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
    postRecord({
      userId: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250',
      placeId: parseInt(location.value),
      sport: sportType.value,
      startTime: `${activityDate.value}T${startTime.value}:00`,
      endTime: `${activityDate.value}T${endTime.value}:00`,
      capacity: parseInt(participants.value)
    })
      .then((response) => {
        console.log('Record posted successfully:', response);
      })
      .catch((error) => {
        console.error('Error posting record:', error);
      });

    sportType.value = '';
    location.value = '';
    participants.value = '';
    activityDate.value = '';
    startTime.value = '';
    endTime.value = '';
    triggerValidate.value = false;
  }
  activityDate.value = new Date().toISOString().split('T')[0];
};

onMounted(async () => {
  try {
    const response = await getSportList();
    const sportList: string[] = Array.isArray(response) ? response : [];
    sportOptions.value = sportList.map((sport) => ({
      label: sport,
      value: sport
    }));
  } catch (error) {
    console.error('Error fetching sport list:', error);
  }
});
</script>
