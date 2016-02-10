# fastdom-sequencer

A [`fastdom`](http://github.com/wilsonpage/fastdom) extension that prioritises tasks and executes them in 'sequence' for the best possible render performance.

- User interactions are 'protected' from tasks that cause jank
- Animations/transitions are 'protected' from DOM measurements and mutations that cause jank
- Clean `Promise` based API

## Usage

```js
var sequencer = require('fastdom-sequencer')
```

or

```html
<script src="node_modules/fastdom/fastdom.js"></script>
<script src="node_modules/fastdom-sequencer/fastdom-sequencer.js"></script>
```

## API

### sequencer#on()

Binds a high-priority interaction that defers any `.animate()` or `.mutate()` task that are executed elsewhere in the app. This protects any interaction related UI changes from jank.

```js
sequencer.on(element, 'scroll', function(e) {
  sequencer.mutate(...);
});
```

```js
sequencer.on(element, 'click', function(e) {
  return sequencer.animate(element, function() {
    element.classList.add('grow');
  });
});
```

```js
sequencer.on(element, 'click', function(e) {
  return sequencer
    .animate(element, () => element.classList.add('grow')
    .animate(element, () => element.classList.add('shrink');
});
```

```js
sequencer.off(element, 'click', callback);
```

- `.animate()` or `.mutate()` tasks inside the `.interaction()` callbacks are run instantly and not deferred.

### sequencer#animate()

Should contain any animation/transition code.

```js
sequencer
  .animate(element, () => element.style.transform = 'translateY(100%)'))
  .then(() => {
    // transition/animation end
  });
```

- Is deferred by any incomplete `.on()` interactions
- Run instantly if no `.on()` interactions are happening
- Internally run inside `sequencer.mutate()` as DOM changes will be required to trigger animation

### sequencer#mutate()

Should contain any code that is likely to cause document reflow/layout.

```js
sequencer.mutate(element, () => {
  var li = document.createElement('li');
  list.appendChild(li);
});
```

- Is deferred by any incomplete `.interactions()`
- Run instantly if no `.interactions()` are happening
- Internally run inside `sequencer.mutate()` as DOM changes will be required to trigger animation

### Chaining

Tasks can be chained together so that they happen sequencially in series.

```js
sequencer
  .measure(() => list.clientHeight)
  .mutate(height => list.appendChild(item))
  .animate(item, () => item.classList.add('reveal'))
  .then(() => {
    console.log('all done!');
  });
```
