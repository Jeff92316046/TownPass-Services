<template>
  <div class="flex flex-col h-screen">
    <FixedTitleSection
      :title="props.activityName"
      class="bg-primary-400 text-white text-lg font-semibold py-2"
    />

    <!-- 訊息列表 -->
    <div class="flex-1 bg-gray-50 p-4 overflow-y-auto mt-12">
      <div v-for="(msg, index) in messages" :key="index" class="mb-2">
        <div
          class="flex flex-col"
          :class="msg.sender === userData.data.id ? 'items-end' : 'items-start'"
        >
          <!-- 顯示發送者id -->
          <div class="text-sm mb-1 font-medium">
            {{ uuidToAnimal(msg.sender) }}
          </div>

          <!-- 訊息氣泡 -->
          <div
            :class="[
              'inline-block px-3 py-2 rounded-lg max-w-xs break-words',
              msg.sender === userData.data.id
                ? 'bg-primary-400 text-white'
                : 'bg-gray-200 text-black'
            ]"
          >
            {{ msg.text }}
          </div>

          <!-- 顯示時間 -->
          <div v-if="msg.timestamp" class="text-xs text-gray-500 mt-1">
            {{ handleTimestamp(msg.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 輸入區 -->
    <div class="p-4 flex justify-end bg-primary-50">
      <BaseInput
        placeholder="Type your message..."
        class="flex-1 mr-4 bg-transparent"
        v-model="textMessage"
      />
      <BaseButton variant="primary" class="p-1 w-fit h-fit text-bold" @click="handleSendMessage">
        >
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
// @ts-ignore - mqtt types might not be available in this environment
import mqtt, { MqttClient } from 'mqtt';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '../components/atoms/BaseButton.vue';
import FixedTitleSection from '@/components/molecules/FixedTitleSection.vue';
import { uuidToAnimal } from '@/utils/userid-to-name';
import axios from 'axios';
// === 環境變數 ===
const MQTT_BROKER: string = import.meta.env.VITE_MQTT_BROKER;
const MQTT_WS_PORT: number = 9001;
const MQTT_USR_NAME: string = import.meta.env.VITE_MQTT_USR_NAME;
const MQTT_USR_PWD: string = import.meta.env.VITE_MQTT_USR_PWD;

// === Props ===
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
      };
      extra: null | any;
      version: string;
    };
    otherUserData: { name: string; imageUrl: string }[];
  }>(),
  {
    activityName: '2025-11-08 羽球場',
    messages: () => [],
    userData: () => ({
      name: 'TP_SUCCESS',
      status: 0,
      reasonPhrase: '',
      data: {
        id: 'a1b2c3d4-e5f6-7890-1234-567890bc1345',
        account: 'user1',
        username: 'Wesley',
        realName: '金大森'
      },
      extra: null,
      version: 'v1.0.0'
    }),
    otherUserData: () => []
  }
);

// === 狀態 ===
const textMessage = ref('');
const messages = ref<Array<{ sender: string; text: string; timestamp?: string }>>(
  props.messages ?? []
);
let client: MqttClient | null = null;

// === 從 URL 拿 channelId ===
const route = useRoute();
const channelId = ref<string>('');
onMounted(() => {
  channelId.value = route.params.channel_id as string;
});

// === 格式化時間 ===
const handleTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// === API 取得歷史訊息 ===
const fetchMessageHistory = async () => {
  if (!channelId.value) return;

  try {
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/message/history/`, {
      params: { channel_id: channelId.value }
    });

    const data = res.data; // [{ sender, text, timestamp }, ...]
    messages.value = data.map((msg: any) => ({
      sender: msg.sender,
      text: msg.text ?? msg.message_content,
      timestamp: msg.timestamp
    }));
  } catch (e: any) {
    console.error('Failed to fetch message history:', e?.response?.data || e.message);
  }
};
// === MQTT topic ===
const topic = computed(() => `TownPass/${channelId.value}`);

// === MQTT 連線與訂閱 ===
onMounted(async () => {
  // 1️⃣ 先取得歷史訊息
  await fetchMessageHistory();

  // 2️⃣ MQTT 連線
  const connectUrl = `ws://${MQTT_BROKER}:${MQTT_WS_PORT}`;

  client = mqtt.connect(connectUrl, {
    username: MQTT_USR_NAME,
    password: MQTT_USR_PWD,
    reconnectPeriod: 2000,
    clean: true,
    connectTimeout: 5000
  });

  client.on('connect', () => {
    console.log('✅ MQTT Connected');
    client?.subscribe(topic.value, (err: any) => {
      if (err) console.error('❌ Subscribe failed', err);
      else console.log('📩 Subscribed to', topic.value);
    });
  });

  client.on('message', (tpc: any, payload: any) => {
    if (tpc === topic.value) {
      try {
        const msg = JSON.parse(payload.toString()) as { sender: string; text: string };

        // 過濾掉自己發送的訊息
        if (msg.sender === props.userData.data.id) return;

        messages.value.push({
          ...msg,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error parsing MQTT message:', e);
      }
    }
  });

  client.on('error', (err: any) => {
    console.error('MQTT Error:', err);
  });
});

// === 卸載時斷開 MQTT ===
onUnmounted(() => {
  client?.end(true);
});

// === 傳送訊息 ===
const handleSendMessage = () => {
  if (!textMessage.value.trim() || !client?.connected || !channelId.value) return;

  const msg = {
    sender: props.userData.data.id,
    text: textMessage.value
  };

  client.publish(`TownPass/${channelId.value}`, JSON.stringify(msg));
  messages.value.push({
    ...msg,
    timestamp: new Date().toISOString()
  });
  textMessage.value = '';
};
</script>
