import $ from 'jquery';

// function flattenArray(arr) {
//   return [].concat(...arr);
// }

const Util = (($) => { // eslint-disable-line no-shadow
  const TRANSITION_END = 'transitionend';

  const Util = { // eslint-disable-line no-shadow
    TRANSITION_END: 'mmTransitionEnd',

    triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },

    supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },

    flattenArray(arr) {
      return [].concat(...arr);
    },

    children(elements, query="*") {
      return this.flattenArray(
        Array.from(elements).map(element => (
          Array.from(element.querySelectorAll(query))
        ))
      );
    },

    hasClass(elements, className) {
      return elements.every(el => el.classList.contains(className));
    },

    addClass(elements, className) {
      Array.from(elements).forEach(el => el.classList.add(className));
    },

    removeClass(elements, className) {
      Array.from(elements).forEach(el => el.classList.remove(className));
    },

    attr(elements, key, value) {
      elements.forEach(el => el.setAttribute(key, value));
    }
  };

  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle(event) {
        if ($(event.target).is(this)) {
          return event
            .handleObj
            .handler
            .apply(this, arguments); // eslint-disable-line prefer-rest-params
        }
        return undefined;
      },
    };
  }

  function transitionEndEmulator(duration) {
    let called = false;

    $(this).one(Util.TRANSITION_END, () => {
      called = true;
    });

    setTimeout(() => {
      if (!called) {
        Util.triggerTransitionEnd(this);
      }
    }, duration);

    return this;
  }

  function setTransitionEndSupport() {
    $.fn.mmEmulateTransitionEnd = transitionEndEmulator; // eslint-disable-line no-param-reassign
    // eslint-disable-next-line no-param-reassign
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }

  setTransitionEndSupport();

  return Util;
})($);

export default Util;
