<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <div class="bg-primary-400 p-4 text-white text-lg font-semibold h-12 flex items-center">
      <div class="mr-4 cursor-pointer">
        <img @click="$router.back()" src="../assets/images/down-icon.svg" class="rotate-90" />
      </div>
      <div class="flex-1 text-center text-lg font-semibold">發起活動</div>
    </div>
    <form class="flex-1 overflow-auto p-4 space-y-4 flex flex-col">
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
          v-model="location"
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
import { ref } from 'vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseSelect from '@/components/atoms/BaseSelect.vue';
import DatePicker from '@/components/molecules/DatePicker.vue';

const triggerValidate = ref(false);

const sportType = ref('');
const location = ref('');
const participants = ref('');
const activityDate = ref(new Date().toISOString().split('T')[0]);
const startTime = ref('');
const endTime = ref('');

const sportOptions = [
  { label: '羽球', value: '羽球' },
  { label: '籃球', value: '籃球' },
  { label: '足球', value: '足球' },
  { label: '網球', value: '網球' }
];

const locationOptions = [
  { label: '松山運動中心羽球場', value: '松山運動中心羽球場' },
  { label: '大安運動中心羽球場', value: '大安運動中心羽球場' },
  { label: '信義運動中心羽球場', value: '信義運動中心羽球場' }
];

const participantsOptions = [
  { label: '2人', value: '2' },
  { label: '4人', value: '4' },
  { label: '6人', value: '6' },
  { label: '8人', value: '8' },
  { label: '10人', value: '10' }
];

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
    // TODO: Submit form data to backend or perform desired action
    console.log(
      `已發起活動：
運動種類：${sportType.value}
場地：${location.value}
人數：${participants.value}
日期：${activityDate.value}
時間：${startTime.value} - ${endTime.value}`
    );

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
</script>
