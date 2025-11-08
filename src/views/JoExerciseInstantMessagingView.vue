<template>
  <div class="flex flex-col h-screen">
    <div class="bg-primary-400 p-4 text-white text-lg font-semibold h-12 flex items-center">
      <div class="mr-4 cursor-pointer">
        <img
          @click="$router.back()"
          src="../assets/images/down-icon.svg"
          style="transform: rotate(90deg)"
        />
      </div>
      <div class="text-center flex-1 text-lg font-semibold">
        {{ props.activityName }}
      </div>
    </div>
    <div class="flex-1 bg-gray-50 p-4 overflow-y-auto">
      <div v-for="(msg, index) in messages" :key="index" class="mb-2">
        <div
          class="flex items-start"
          :class="msg.sender === userData.data.username ? 'justify-end' : 'justify-start'"
        >
          <div class="flex flex-col">
            <div
              v-if="msg.sender !== userData.data.username"
              :class="
                msg.sender === userData.data.username
                  ? 'text-right justify-end'
                  : 'text-left justify-start'
              "
              class="text-sm mb-1 font-medium flex items-center gap-2"
            >
              <img
                :src="
                  otherUserData.find((user) => user.name === msg.sender)?.imageUrl ||
                  'https://picsum.photos/200'
                "
                :alt="`${msg.sender} Avatar`"
                class="w-8 h-8 rounded-full"
              />

              {{ msg.sender }}
            </div>
            <div
              :class="[
                'inline-block px-3 py-2 rounded-lg max-w-xs',
                msg.sender === userData.data.username
                  ? 'bg-primary-400 text-white self-end ml-auto'
                  : 'bg-gray-200 text-black self-start'
              ]"
            >
              {{ msg.text }}
            </div>
            <div
              v-if="msg.timestamp"
              :class="
                msg.sender === userData.data.username
                  ? 'text-right justify-end'
                  : 'text-left justify-start'
              "
              class="text-xs text-gray-500 mt-1"
            >
              {{ handleTimestamp(msg.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 flex justify-end bg-primary-50">
      <BaseInput
        placeholder="Type your message..."
        class="flex-1 mr-4 bg-transparent"
        v-model="textMessage"
      />
      <BaseButton variant="primary" class="p-1 w-fit h-fit text-bold" @click="handleSendMessage"
        >></BaseButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '../components/atoms/BaseButton.vue';

const textMessage = ref('');

const handleSendMessage = () => {
  if (textMessage.value.trim() === '') return;

  try {
    // postMessage logic here
    // getAllMessage again after sending message
    console.log('Message sent:', textMessage.value);
  } catch (error) {
    console.error('Error sending message:', error);
  }

  textMessage.value = '';
};

const props = withDefaults(
  defineProps<{
    activityName: string;
    messages?: Array<{ sender: string; text: string; timestamp?: string }>;
    userData: {
      name: string;
      status: number;
      reasonPhrase: string;
      data: {
        id: string;
        account: string;
        username: string;
        realName: string;
        idNo: string;
        email: string;
        phoneNo: string;
        birthday: string;
        memberType: string;
        verifyLevel: string;
        addresses: Array<{
          zip3: number;
          city: string;
          town: string;
          village: string;
          street: string;
          usageType: string;
          seq: number;
          priority: boolean;
        }>;
        residentAddress: string;
        citizen: boolean;
        nativePeople: boolean;
        cityInternetUid: string;
      };
      extra: null | any;
      version: string;
    };
    otherUserData: {
      name: string;
      imageUrl: string;
    }[];
  }>(),
  {
    activityName: '2025-11-08 羽球場',
    messages: () => [
      { sender: 'user1', text: '您好，請問你們到了嗎？', timestamp: '2025-11-08T08:30:00Z' },
      { sender: 'Wesley', text: '您好，我們剛到達羽球場入口。', timestamp: '2025-11-08T08:31:00Z' },
      { sender: 'user2', text: '好的，我們馬上出來接你們。', timestamp: '2025-11-08T08:32:00Z' },
      { sender: 'Wesley', text: '謝謝！我們會在入口等你們。', timestamp: '2025-11-08T08:33:00Z' }
    ],
    userData: () => ({
      name: 'TP_SUCCESS',
      status: 0,
      reasonPhrase: 'Indicates the successful completion of an operation',
      data: {
        id: '7f3562f4-bb3f-4ec7-89b9-da3b4b5ff250',
        account: 'wz7786',
        username: 'Wesley',
        realName: '金大森',
        idNo: 'A123456789',
        email: 'ist83903@bcaoo.com',
        phoneNo: '0932166777',
        birthday: '1988/12/12',
        memberType: 'personal',
        verifyLevel: '3',
        addresses: [
          {
            zip3: 104,
            city: '臺北市',
            town: '中山區',
            village: '正得里',
            street: '吉林路',
            usageType: '0',
            seq: 1,
            priority: true
          }
        ],
        residentAddress: '臺北市中山區吉林路 69 號 4 樓',
        citizen: true,
        nativePeople: false,
        cityInternetUid: ''
      },
      extra: null,
      version: 'v1.0.9'
    }),
    otherUserData: () => [
      {
        name: 'user1',
        imageUrl: 'https://picsum.photos/id/1/200/200'
      },
      {
        name: 'user2',
        imageUrl: 'https://picsum.photos/id/2/200/200'
      }
    ]
  }
);

const handleTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
