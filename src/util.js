import $ from 'jquery';

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

    compareStrings(a, b) {
      if (a === undefined) return false;
      return a.toLowerCase() === b.toLowerCase();
    },

    flattenArray(arr) {
      const flatArray = [];
      arr = Array.from(arr);
      for (let i = 0; i < arr.length; i++) {
        flatArray.push(...Array.from(arr[i]));
      }
      return flatArray;
    },

    children(elements, query) {
      // matches the query to capture tagName
      // and other properties from it
      const matcher = /(\w+)(?:#(\w+))*(?:\.([A-Za-z\-]+))*/;
      const matches = matcher.exec(query);
      const [, tagName, id, className] = matches;

      if (!elements instanceof Array)
        elements = Array.from(elements);

      return this.flattenArray(
        Array.from(elements).map(element => element.children)
        ).filter(
        el => {
          // check if this is the wanted element
          let isMatching = this.compareStrings(el.tagName, tagName);
          if (id && isMatching)
            isMatching = el.id === id;
          if (className && isMatching)
            isMatching = el.classList.contains(className);
          return isMatching;
        }
      );
    },

    find(elements, query="*") {
      return this.flattenArray(
        Array.from(elements).map(element => (
          Array.from(element.querySelectorAll(query))
        ))
      );
    },

    parents(elements, tagName) {
      const parentNodes = [];
      Array.from(elements).forEach(element => {
        for (let current = element; current.parentElement; current = current.parentElement) {
          parentNodes.push(current.parentElement);
        }
      });
      return parentNodes.filter((el) => this.compareStrings(el.tagName, tagName));
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
    },

    has(elements, query) {
      return Array.from(elements)
        .filter(
          element => (
            element.querySelectorAll(query).length > 0
          )
        )
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
