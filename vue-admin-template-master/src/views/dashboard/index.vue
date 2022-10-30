<template>
  <div>
    <Card></Card>
    <Sale></Sale>
    <Observr></Observr>
  </div>
</template>

<script>

import Card from './Card'
import Sale from './Sale'
import Observr from './Observe'
export default {
  name: 'Dashboard',
  mounted() {
    this.$store.dispatch('getData')
  },
  components: {
    Card,
    Sale,
    Observr
  }
}
</script>

<style lang="scss" scoped>

</style>
