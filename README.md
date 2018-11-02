# v-press

# Install
```sh
yarn global add vue-press-directive
```

# Usage 
```js
// main.js
import VuePressDirective from 'vue-press-directive'
import Vue from 'vue'

// long-press interval has an default value that is 600ms. But you still can override this with options.interval.
Vue.use(VuePressDirective, { interval: 600 })

new Vue({
  // Also you can override interval in the directive. Passing arguments in directive like this.
  template: `
    <article>
      <button v-press="handler">Long press this button.</button>
      <button v-press:100="handler">Long press this button with only 100ms.</button>
    </article>
  `,
})
```
see more in `/example/index.html`
