<!-- 页脚 -->
<template>
  <div class="ele-text-center" style="padding: 16px 0;">
    <div>
      <a
        class="ele-text-secondary"
        href="https://eleadmin.com"
        target="_blank">
        {{ $t('layout.footer.website') }}
      </a>
      <em/>
      <a
        class="ele-text-secondary"
        href="https://eleadmin.com/doc/eleadmin/"
        target="_blank">
        {{ $t('layout.footer.document') }}
      </a>
      <em/>
      <a
        class="ele-text-secondary"
        href="https://err5.com/"
        target="_blank">
        {{ $t('layout.footer.authorization') }}
      </a>
    </div>
    <div class="ele-text-secondary" style="margin-top: 8px;">
      {{ $t('layout.footer.copyright') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'EleFooter'
}
</script>
