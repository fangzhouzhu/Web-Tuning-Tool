<script lang="ts">
import {
  ref,
  reactive,
  onMounted,
  defineComponent,
  defineProps,
  nextTick,
  watchEffect,
} from 'vue';
import {
  NButton,
  useMessage,
  NIcon,
  NSlider,
  NSpace,
  NUpload,
  NRadioGroup,
  NRadioButton,
} from 'naive-ui';
import { Play, Pause } from '@vicons/ionicons5';

import WalkThruFire from '@/assets/audio/Walk Thru Fire.mp3';
import { audioDraw } from '@/utils/draw.js';

export default defineComponent({
  components: {
    NButton,
    NIcon,
    Play,
    Pause,
    NSlider,
    NSpace,
    NUpload,
    NRadioGroup,
    NRadioButton,
  },
  props: { msg: { type: String, default: '' } },
  setup(props) {
    const message = useMessage();
    const play = ref<boolean>(true);
    const gainValue = ref(50);
    const filterValue = ref(1200);
    const audioUrl = ref('');
    const showType = ref('line');

    audioUrl.value = WalkThruFire;
    const pannerValue = ref(0);
    const audioBuffer = ref<ArrayBuffer>();
    const audioRef: any = ref<HTMLAudioElement | null>();
    const audioContext = reactive<any>({});
    const analyser = ref<any>({
      analyser: {},
      dataArray: [],
      bufferLength: 0,
    });
    function toogle() {
      if (play.value) {
        audioRef.value.play();
      } else {
        audioRef.value.pause();
      }
      play.value = !play.value;
    }
    function showTypeChange() {
      if (!audioContext.value) {
        return;
      }
      audioDraw(
        'audioCanvas',
        showType.value,
        analyser.value.dataArray,
        analyser.value.analyser,
        analyser.value.bufferLength
      );
    }

    function initAudio() {
      if (audioContext.value) {
        return;
      }
      audioContext.value = new AudioContext();
      const track = audioContext.value.createMediaElementSource(audioRef.value);
      const gainNode = audioContext.value.createGain();
      const pannerOptions = { pan: 0 };
      const pannerNode = audioContext.value.createPanner();
      const filterNode = audioContext.value.createBiquadFilter();
      gainNode.gain.value = gainValue.value;

      analyser.value.analyser = audioContext.value.createAnalyser();
      analyser.value.analyser.fftSize = 256;
      analyser.value.bufferLength = analyser.value.analyser.frequencyBinCount;
      analyser.value.dataArray = new Uint8Array(analyser.value.bufferLength);
      analyser.value.analyser.getByteTimeDomainData(analyser.value.dataArray);

      track
        .connect(gainNode)
        .connect(pannerNode)
        .connect(filterNode)
        .connect(analyser.value.analyser)
        .connect(audioContext.value.destination);
      audioDraw(
        'audioCanvas',
        showType.value,
        analyser.value.dataArray,
        analyser.value.analyser,
        analyser.value.bufferLength
      );
      watchEffect(() => {
        gainNode.gain.value = gainValue.value / 100;
        filterNode.frequency.value = filterValue.value;
        pannerNode.setPosition(pannerValue.value, 0, 0);
      });
    }
    function fileChange(param: any) {
      if (!param.fileList.length) return;
      var file = param.fileList[0].file; //通过input上传的音频文件
      audioUrl.value = URL.createObjectURL(new Blob([file]));
      var fileReader = new FileReader(); //使用FileReader异步读取文件
      fileReader.readAsArrayBuffer(file); //开始读取音频文件
      fileReader.onload = function (e: any) {
        audioContext.value.decodeAudioData(
          e.target.result,
          function (buffer: ArrayBuffer) {
            audioBuffer.value = buffer;
            initAudio();
            audioRef.value.play();
          }
        );
      };
    }
    onMounted(async () => {
      window.AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!window.AudioContext) {
        message.error('当前浏览器不支持Web Audio API');
        return;
      }
      audioRef.value.addEventListener('play', function () {
        initAudio();
      });
    });

    return {
      play,
      audioRef,
      audioUrl,
      toogle,
      gainValue,
      filterValue,
      pannerValue,
      fileChange,
      showType,
      showTypeChange,
    };
  },
});
</script>

<template>
  <h1>{{ msg }}</h1>
  <n-radio-group v-model:value="showType" @change="showTypeChange">
    <n-radio-button value="line">line</n-radio-button>
    <n-radio-button value="bar">bar</n-radio-button>
  </n-radio-group>
  <n-space justify="center">
    <canvas id="audioCanvas" width="1000" height="300"></canvas>
  </n-space>
  <n-upload action="/" @change="fileChange" :default-upload="false" :max="1">
    <n-button>选择 文件</n-button>
  </n-upload>
  <audio :src="audioUrl" controls ref="audioRef" id="audioRef"></audio>
  <!-- <n-button secondary circle #icon @click="toogle">
    <n-icon>
      <Play v-if="play" />
      <Pause v-else />
    </n-icon>
  </n-button>-->
  <n-space style="height: 300px; justify-content: center">
    <span>音量</span>
    <n-slider v-model:value="gainValue" :step="1" :min="0" :max="100" vertical />
    <span>低阶滤波器</span>
    <n-slider v-model:value="filterValue" :step="1" :min="0" :max="2400" vertical />
    <span>空间音效</span>
    <n-slider v-model:value="pannerValue" :step="1" :max="10" :min="-10" vertical />
  </n-space>
</template>

<style scoped></style>
