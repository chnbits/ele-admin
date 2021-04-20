<template>
  <div class="ele-body">
    <more-tag/>
    <more-dot/>
    <more-alert/>
    <more-steps/>
    <more-menu/>
    <more-message/>
    <more-empty/>
    <more-city-select/>
    <more-cropper/>
    <more-count-up/>
    <more-qrcode/>
  </div>
</template>

<script>
import MoreTag from './more-tag';
import MoreDot from './more-dot';
import MoreAlert from './more-alert';
import MoreSteps from './more-steps';
import MoreMenu from './more-menu';
import MoreMessage from './more-message';
import MoreEmpty from './more-empty';
import MoreCitySelect from './more-city-select';
import MoreCropper from './more-cropper';
import MoreCountUp from './more-count-up';
import MoreQrcode from './more-qrcode';

export default {
  name: 'ExtensionMore',
  components: {
    MoreTag,
    MoreDot,
    MoreAlert,
    MoreSteps,
    MoreMenu,
    MoreMessage,
    MoreEmpty,
    MoreCitySelect,
    MoreCropper,
    MoreCountUp,
    MoreQrcode
  }
}
</script>

<style scoped>
</style>
